from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from bson import ObjectId
from fastapi import HTTPException, status
from app.db.mongo import get_database
from app.core.security import generate_reference_token
from app.services.audit_service import record_audit_log
from app.services.notification_service import notification_service

class BookingService:
    @staticmethod
    async def create_booking(
        farmer_id: str,
        farmer_phone: str,
        farmer_name: str,
        market_id: str,
        date: str,
        slot_time: str,
        commodity: str,
        vehicle_type: str = "Tractor",
        estimated_quantity_quintals: float = 10.0,
        idempotency_key: Optional[str] = None,
        channel: str = "WEB",
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        db = get_database()

        # 1. Idempotency Check: if key provided and exists, return existing booking
        if idempotency_key:
            existing = await db.bookings.find_one({"idempotencyKey": idempotency_key})
            if existing:
                existing["id"] = str(existing["_id"])
                return existing

        # 2. Verify Market
        try:
            market = await db.markets.find_one({"_id": ObjectId(market_id), "isActive": True})
        except Exception:
            market = await db.markets.find_one({"_id": market_id, "isActive": True})

        if not market:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Selected market-yard not found or not active"
            )

        if commodity not in market.get("commoditiesSupported", []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Commodity '{commodity}' is not supported at this market yard"
            )

        # 3. Find or Create Market Slot for this date/time/commodity
        slot = await db.market_slots.find_one({
            "marketId": str(market["_id"]),
            "date": date,
            "slotTime": slot_time,
            "commodity": commodity
        })

        if not slot:
            # Create slot with default capacity
            new_slot = {
                "marketId": str(market["_id"]),
                "date": date,
                "slotTime": slot_time,
                "commodity": commodity,
                "totalCapacityVehicles": 25,
                "bookedVehicles": 0,
                "isActive": True,
                "createdAt": datetime.now(timezone.utc).isoformat()
            }
            res = await db.market_slots.insert_one(new_slot)
            slot = await db.market_slots.find_one({"_id": res.inserted_id})

        # 4. Atomic capacity check and reservation
        # Uses conditional update: bookedVehicles must be < totalCapacityVehicles
        total_cap = slot.get("totalCapacityVehicles", 25)
        updated_slot = await db.market_slots.find_one_and_update(
            {
                "_id": slot["_id"],
                "bookedVehicles": {"$lt": total_cap},
                "isActive": True
            },
            {"$inc": {"bookedVehicles": 1}},
            return_document=True
        )

        if not updated_slot:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No capacity available in this slot. Please select another slot or alternative market yard."
            )

        # 5. Generate Cryptographically Random Token (e.g., KNL-MKT-7F42Q)
        token = generate_reference_token("KNL-MKT", 5)
        now_iso = datetime.now(timezone.utc).isoformat()

        booking_doc = {
            "bookingReference": token,
            "farmerId": farmer_id,
            "farmerPhone": farmer_phone,
            "farmerName": farmer_name or "Farmer",
            "marketId": str(market["_id"]),
            "marketName": market.get("name", "Kurnool Market Yard"),
            "marketNameTe": market.get("nameTe", ""),
            "date": date,
            "slotTime": slot_time,
            "commodity": commodity,
            "vehicleType": vehicle_type,
            "estimatedQuantityQuintals": estimated_quantity_quintals,
            "status": "CONFIRMED",
            "channel": channel,
            "bookedAt": now_iso,
            "statusHistory": [
                {
                    "fromStatus": "INITIATED",
                    "toStatus": "CONFIRMED",
                    "timestamp": now_iso,
                    "by": farmer_id,
                    "channel": channel,
                    "remarks": "Booking confirmed with unique reference."
                }
            ]
        }
        if idempotency_key:
            booking_doc["idempotencyKey"] = idempotency_key

        res = await db.bookings.insert_one(booking_doc)
        booking_doc["id"] = str(res.inserted_id)
        booking_doc["_id"] = str(res.inserted_id)

        # 6. Audit Event
        await record_audit_log(
            action="CREATE_BOOKING",
            resource="BOOKING",
            resource_id=token,
            user_id=farmer_id,
            user_role="FARMER" if channel == "WEB" else channel,
            details={
                "market": market.get("name"),
                "date": date,
                "slotTime": slot_time,
                "commodity": commodity,
                "channel": channel
            },
            ip_address=ip_address
        )

        # 7. Queue Outbox Notification
        sms_msg = f"Smart Farmer: Slot booked at {market.get('name')}. Token: {token}, Date: {date}, Slot: {slot_time}, Crop: {commodity}."
        sms_msg_te = f"రైతు వేదిక: {market.get('nameTe', market.get('name'))} లో స్లాట్ బుక్ అయ్యింది. టోకెన్: {token}, తేదీ: {date}, సమయం: {slot_time}."
        await notification_service.queue_notification(
            recipient_phone=farmer_phone,
            message=sms_msg,
            message_te=sms_msg_te,
            channel="SMS",
            related_id=token
        )

        return booking_doc

    @staticmethod
    async def get_booking_by_reference(token: str) -> Dict[str, Any]:
        db = get_database()
        booking = await db.bookings.find_one({"bookingReference": token.strip().upper()})
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Booking token '{token}' not found."
            )
        booking["id"] = str(booking["_id"])
        booking["_id"] = str(booking["_id"])
        return booking

    @staticmethod
    async def check_in_booking(token: str, staff_user_id: str, notes: Optional[str] = None) -> Dict[str, Any]:
        db = get_database()
        now_iso = datetime.now(timezone.utc).isoformat()
        
        booking = await db.bookings.find_one({"bookingReference": token.strip().upper()})
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Booking reference '{token}' not found"
            )

        if booking["status"] == "CHECKED_IN":
            booking["id"] = str(booking["_id"])
            return booking

        updated = await db.bookings.find_one_and_update(
            {"_id": booking["_id"]},
            {
                "$set": {
                    "status": "CHECKED_IN",
                    "checkedInAt": now_iso,
                    "checkedInBy": staff_user_id,
                    "checkInNotes": notes
                },
                "$push": {
                    "statusHistory": {
                        "status": "CHECKED_IN",
                        "timestamp": now_iso,
                        "by": staff_user_id
                    }
                }
            },
            return_document=True
        )
        updated["id"] = str(updated["_id"])

        await record_audit_log(
            action="CHECK_IN_BOOKING",
            resource="BOOKING",
            resource_id=token,
            user_id=staff_user_id,
            user_role="MARKET_STAFF",
            details={"notes": notes}
        )

        return updated

    @staticmethod
    async def cancel_booking(booking_id: str, user_id: str, role: str) -> Dict[str, Any]:
        db = get_database()
        now_iso = datetime.now(timezone.utc).isoformat()

        try:
            booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        except Exception:
            booking = await db.bookings.find_one({"bookingReference": booking_id})

        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

        # Authorization: only booking owner or admin/staff
        if role not in ["ADMIN", "MARKET_STAFF"] and booking["farmerId"] != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot cancel another farmer's booking")

        if booking["status"] == "CANCELLED":
            booking["id"] = str(booking["_id"])
            return booking

        # Decrement slot booked count
        await db.market_slots.update_one(
            {
                "marketId": booking["marketId"],
                "date": booking["date"],
                "slotTime": booking["slotTime"],
                "commodity": booking["commodity"],
                "bookedVehicles": {"$gt": 0}
            },
            {"$inc": {"bookedVehicles": -1}}
        )

        updated = await db.bookings.find_one_and_update(
            {"_id": booking["_id"]},
            {
                "$set": {"status": "CANCELLED", "cancelledAt": now_iso},
                "$push": {
                    "statusHistory": {"status": "CANCELLED", "timestamp": now_iso, "by": user_id}
                }
            },
            return_document=True
        )
        updated["id"] = str(updated["_id"])

        await record_audit_log(
            action="CANCEL_BOOKING",
            resource="BOOKING",
            resource_id=booking.get("bookingReference"),
            user_id=user_id,
            user_role=role
        )

        return updated

booking_service = BookingService()
