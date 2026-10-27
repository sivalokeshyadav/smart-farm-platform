from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from app.db.mongo import get_database, serialize_mongo_docs, serialize_mongo_doc
from app.core.security import generate_reference_token
from app.services.audit_service import record_audit_log
from app.core.all_india_locations import ALL_INDIA_LOCATIONS, ALL_INDIA_GODOWNS

class GodownService:
    @staticmethod
    async def get_locations() -> Dict[str, List[str]]:
        db = get_database()
        godowns = await db.godowns.find({"isVerified": True}, {"state": 1, "district": 1}).to_list(1000)
        locations: dict[str, set[str]] = {st: set(dist_list) for st, dist_list in ALL_INDIA_LOCATIONS.items()}
        for g in godowns:
            st = g.get("state") or "Andhra Pradesh"
            dist = g.get("district")
            if st not in locations:
                locations[st] = set()
            if dist:
                locations[st].add(dist)
        return {st: sorted(list(dist_set)) for st, dist_set in sorted(locations.items())}

    @staticmethod
    async def list_godowns(
        state: Optional[str] = None,
        district: Optional[str] = None,
        commodity: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        db = get_database()
        query: dict[str, Any] = {"isVerified": True}
        if state and state.upper() != "ALL":
            query["state"] = state
        if district and district.upper() != "ALL":
            query["district"] = district
        if commodity and commodity.upper() != "ALL":
            query["eligibleCommodities"] = commodity
        if search and search.strip():
            term = search.strip()
            query["$or"] = [
                {"name": {"$regex": term, "$options": "i"}},
                {"nameTe": {"$regex": term, "$options": "i"}},
                {"district": {"$regex": term, "$options": "i"}},
                {"state": {"$regex": term, "$options": "i"}},
                {"address": {"$regex": term, "$options": "i"}},
            ]
        godowns = await db.godowns.find(query).to_list(500)
        
        # If DB returns nothing for this state/filter, provide matching facilities from ALL_INDIA_GODOWNS
        if not godowns and state and state.upper() != "ALL":
            fallback = []
            for g in ALL_INDIA_GODOWNS:
                if g["state"].lower() == state.lower():
                    if district and district.upper() != "ALL" and g["district"].lower() != district.lower():
                        continue
                    if commodity and commodity.upper() != "ALL" and commodity not in g.get("eligibleCommodities", []):
                        continue
                    # Ensure document is in MongoDB so subsequent reservations work atomically
                    existing_db = await db.godowns.find_one({"name": g["name"]})
                    if not existing_db:
                        ins = await db.godowns.insert_one(dict(g))
                        g_copy = dict(g)
                        g_copy["id"] = str(ins.inserted_id)
                        fallback.append(g_copy)
                    else:
                        fallback.append(serialize_mongo_doc(existing_db))
            if fallback:
                return fallback

        return serialize_mongo_docs(godowns)

    @staticmethod
    async def reserve_godown(
        farmer_id: str,
        farmer_name: str,
        godown_id: str,
        commodity: str,
        bags_count: int,
        duration_months: int,
        start_date: str,
        idempotency_key: Optional[str] = None
    ) -> Dict[str, Any]:
        db = get_database()

        if idempotency_key:
            existing = await db.godown_reservations.find_one({"idempotencyKey": idempotency_key})
            if existing:
                existing["id"] = str(existing["_id"])
                return existing

        try:
            godown = await db.godowns.find_one({"_id": ObjectId(godown_id)})
        except Exception:
            godown = await db.godowns.find_one({"_id": godown_id})

        if not godown:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Godown facility not found")

        if commodity not in godown.get("eligibleCommodities", []):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Godown does not accept '{commodity}'")

        # Atomic reservation check: availableCapacityBags must be >= bags_count
        updated_godown = await db.godowns.find_one_and_update(
            {
                "_id": godown["_id"],
                "availableCapacityBags": {"$gte": bags_count}
            },
            {"$inc": {"availableCapacityBags": -bags_count}},
            return_document=True
        )

        if not updated_godown:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Insufficient available bag capacity in this godown."
            )

        token = generate_reference_token("IND-GDN", 5)
        rate = godown.get("unitPricePerMonthPerBag", 6.50)
        total_cost = round(bags_count * rate * duration_months, 2)
        now_iso = datetime.now(timezone.utc).isoformat()

        reservation_doc = {
            "reservationReference": token,
            "farmerId": farmer_id,
            "farmerName": farmer_name,
            "godownId": str(godown["_id"]),
            "godownName": godown.get("name"),
            "godownNameTe": godown.get("nameTe", ""),
            "godownAddress": godown.get("address", ""),
            "state": godown.get("state", "Andhra Pradesh"),
            "district": godown.get("district", ""),
            "commodity": commodity,
            "bagsCount": bags_count,
            "durationMonths": duration_months,
            "startDate": start_date,
            "totalEstimatedCost": total_cost,
            "unitPricePerMonthPerBag": rate,
            "status": "CONFIRMED",
            "statusHistory": [
                {
                    "fromStatus": "INITIATED",
                    "toStatus": "CONFIRMED",
                    "changedAt": now_iso,
                    "actorId": farmer_id,
                    "actorRole": "FARMER",
                    "actorName": farmer_name,
                    "remarks": "Instant godown storage reservation confirmed."
                }
            ],
            "idempotencyKey": idempotency_key,
            "createdAt": now_iso
        }

        if not idempotency_key:
            reservation_doc.pop("idempotencyKey", None)

        res = await db.godown_reservations.insert_one(reservation_doc)
        reservation_doc["id"] = str(res.inserted_id)
        reservation_doc["_id"] = str(res.inserted_id)

        await record_audit_log(
            action="CREATE_GODOWN_RESERVATION",
            resource="GODOWN_RESERVATION",
            resource_id=token,
            user_id=farmer_id,
            details={"bags": bags_count, "cost": total_cost}
        )

        return reservation_doc

    @staticmethod
    async def cancel_reservation(reservation_id: str, farmer_id: str) -> Dict[str, Any]:
        db = get_database()
        try:
            res_doc = await db.godown_reservations.find_one({"_id": ObjectId(reservation_id)})
        except Exception:
            res_doc = await db.godown_reservations.find_one({
                "$or": [{"_id": reservation_id}, {"reservationReference": reservation_id}]
            })

        if not res_doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservation not found")

        if res_doc.get("farmerId") != farmer_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to cancel this reservation")

        if res_doc.get("status") in ["CANCELLED", "DISPATCHED"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot cancel reservation in status {res_doc.get('status')}")

        now_iso = datetime.now(timezone.utc).isoformat()

        # Refund capacity back to godown
        try:
            godown_obj_id = ObjectId(res_doc["godownId"])
            await db.godowns.update_one({"_id": godown_obj_id}, {"$inc": {"availableCapacityBags": res_doc["bagsCount"]}})
        except Exception:
            await db.godowns.update_one({"_id": res_doc["godownId"]}, {"$inc": {"availableCapacityBags": res_doc["bagsCount"]}})

        # Update reservation status
        history_item = {
            "fromStatus": res_doc.get("status"),
            "toStatus": "CANCELLED",
            "changedAt": now_iso,
            "actorId": farmer_id,
            "actorRole": "FARMER",
            "remarks": "Cancelled by farmer."
        }
        await db.godown_reservations.update_one(
            {"_id": res_doc["_id"]},
            {
                "$set": {"status": "CANCELLED", "cancelledAt": now_iso},
                "$push": {"statusHistory": history_item}
            }
        )

        return {"message": "Reservation cancelled successfully", "status": "CANCELLED"}

godown_service = GodownService()

