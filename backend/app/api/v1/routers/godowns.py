from pydantic import BaseModel
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from app.db.mongo import get_database, serialize_mongo_docs, serialize_mongo_doc
from app.schemas.godown import GodownReservationRequest
from app.services.godown_service import godown_service
from app.api.deps import get_current_user, require_godown_operator, require_staff_or_operator

router = APIRouter(prefix="/godowns", tags=["Godowns & Storage"])

@router.get("/locations")
async def get_godown_locations():
    return await godown_service.get_locations()

@router.get("/")
@router.get("")
async def list_godowns(
    state: Optional[str] = None,
    district: Optional[str] = None,
    commodity: Optional[str] = None,
    search: Optional[str] = None,
):
    return await godown_service.list_godowns(
        state=state,
        district=district,
        commodity=commodity,
        search=search
    )

@router.post("/reservations")
async def create_reservation(
    data: GodownReservationRequest,
    current_user: dict = Depends(get_current_user)
):
    farmer_id = current_user["id"]
    farmer_name = current_user.get("name", "Farmer")

    reservation = await godown_service.reserve_godown(
        farmer_id=farmer_id,
        farmer_name=farmer_name,
        godown_id=data.godownId,
        commodity=data.commodity,
        bags_count=data.bagsCount,
        duration_months=data.durationMonths,
        start_date=data.startDate,
        idempotency_key=data.idempotencyKey
    )
    return reservation

@router.delete("/reservations/{reservation_id}")
async def cancel_reservation(
    reservation_id: str,
    current_user: dict = Depends(get_current_user)
):
    return await godown_service.cancel_reservation(
        reservation_id=reservation_id,
        farmer_id=current_user["id"]
    )

@router.get("/reservations/my")
async def get_my_reservations(current_user: dict = Depends(get_current_user)):
    db = get_database()
    reservations = await db.godown_reservations.find({
        "farmerId": current_user["id"]
    }).sort("createdAt", -1).to_list(100)

    for r in reservations:
        r["id"] = str(r["_id"])
        r["_id"] = str(r["_id"])
    return reservations

@router.get("/reservations/all", dependencies=[Depends(require_staff_or_operator)])
async def get_all_reservations(godown_id: Optional[str] = None):
    db = get_database()
    query = {}
    if godown_id:
        query["godownId"] = godown_id
    reservations = await db.godown_reservations.find(query).sort("createdAt", -1).to_list(100)
    for r in reservations:
        r["id"] = str(r["_id"])
        r["_id"] = str(r["_id"])
    return reservations


class GodownStatusUpdateRequest(BaseModel):
    newStatus: str
    notes: Optional[str] = None
    reason: Optional[str] = None

@router.get("/reference/{reservation_ref}")
async def lookup_godown_reservation(reservation_ref: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    ref_clean = reservation_ref.strip().upper()
    res = await db.godown_reservations.find_one({"reservationReference": ref_clean})
    if not res:
        raise HTTPException(status_code=404, detail=f"Godown reservation token '{reservation_ref}' not found")
    res["id"] = str(res["_id"])
    res["_id"] = str(res["_id"])
    return res

@router.post("/reference/{reservation_ref}/status", dependencies=[Depends(require_staff_or_operator)])
@router.post("/{reservation_ref}/status", dependencies=[Depends(require_staff_or_operator)])
async def update_godown_reservation_status(
    reservation_ref: str,
    data: GodownStatusUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    from app.services.status_service import record_status_transition
    try:
        updated = await record_status_transition(
            collection_name="godown_reservations",
            record_id=reservation_ref,
            module="GODOWN_RESERVATION",
            new_status=data.newStatus,
            actor_id=current_user["id"],
            actor_role=current_user.get("role", "GODOWN_OPERATOR"),
            actor_name=current_user.get("name", "Staff/Operator"),
            notes=data.notes or data.reason
        )
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
