from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends, Request
from app.db.mongo import get_database
from app.schemas.market_booking import BookingCreateRequest, BookingCheckInRequest
from app.services.booking_service import booking_service
from app.api.deps import get_current_user, require_market_staff, require_farmer, require_staff_or_operator

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("")
@router.post("/")
async def create_booking(
    data: BookingCreateRequest,
    req: Request,
    current_user: dict = Depends(get_current_user)
):
    ip_addr = req.client.host if req.client else "127.0.0.1"
    
    # If farmer booking on behalf of self or field agent booking
    farmer_id = current_user["id"]
    farmer_phone = data.farmerPhone or current_user["phone"]
    farmer_name = data.farmerName or current_user.get("name", "Farmer")

    booking = await booking_service.create_booking(
        farmer_id=farmer_id,
        farmer_phone=farmer_phone,
        farmer_name=farmer_name,
        market_id=data.marketId,
        date=data.date,
        slot_time=data.slotTime,
        commodity=data.commodity,
        vehicle_type=data.vehicleType,
        estimated_quantity_quintals=data.estimatedQuantityQuintals,
        idempotency_key=data.idempotencyKey,
        channel=data.channel,
        ip_address=ip_addr
    )
    return booking

@router.get("/my")
async def get_my_bookings(current_user: dict = Depends(get_current_user)):
    db = get_database()
    bookings = await db.bookings.find({
        "$or": [
            {"farmerId": current_user["id"]},
            {"farmerPhone": current_user["phone"]}
        ]
    }).sort("bookedAt", -1).to_list(100)

    for b in bookings:
        b["id"] = str(b["_id"])
        b["_id"] = str(b["_id"])
    return bookings

@router.get("/reference/{booking_ref}")
async def lookup_booking_by_token(booking_ref: str, current_user: dict = Depends(get_current_user)):
    # Used by Market Staff and Farmers to verify token validity
    booking = await booking_service.get_booking_by_reference(booking_ref)
    return booking

@router.post("/reference/{booking_ref}/check-in", dependencies=[Depends(require_staff_or_operator)])
async def check_in_farmer(
    booking_ref: str,
    check_in_data: Optional[BookingCheckInRequest] = None,
    current_user: dict = Depends(get_current_user)
):
    notes = check_in_data.verificationNotes if check_in_data else None
    result = await booking_service.check_in_booking(
        token=booking_ref,
        staff_user_id=current_user["id"],
        notes=notes
    )
    return result

@router.post("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    result = await booking_service.cancel_booking(
        booking_id=booking_id,
        user_id=current_user["id"],
        role=current_user.get("role", "FARMER")
    )
    return result

@router.get("/all", dependencies=[Depends(require_staff_or_operator)])
async def get_all_bookings(
    market_id: Optional[str] = None,
    date: Optional[str] = None,
    status_filter: Optional[str] = None
):
    db = get_database()
    query = {}
    if market_id:
        query["marketId"] = market_id
    if date:
        query["date"] = date
    if status_filter:
        query["status"] = status_filter

    bookings = await db.bookings.find(query).sort("bookedAt", -1).to_list(200)
    for b in bookings:
        b["id"] = str(b["_id"])
        b["_id"] = str(b["_id"])
    return bookings

from pydantic import BaseModel
from app.services.status_service import record_status_transition
from bson import ObjectId

class BookingStatusUpdateRequest(BaseModel):
    newStatus: str
    notes: Optional[str] = None
    reason: Optional[str] = None

class RateNegotiationRequest(BaseModel):
    traderName: str
    agreedRatePerQuintal: float
    notes: Optional[str] = None

@router.post("/{booking_id}/status", dependencies=[Depends(require_staff_or_operator)])
async def update_booking_status(
    booking_id: str,
    data: BookingStatusUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        updated = await record_status_transition(
            collection_name="bookings",
            record_id=booking_id,
            module="MARKET_BOOKING",
            new_status=data.newStatus,
            actor_id=current_user["id"],
            actor_role=current_user.get("role", "MARKET_STAFF"),
            actor_name=current_user.get("name", "Market Staff"),
            notes=data.notes or data.reason
        )
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{booking_id}/negotiation", dependencies=[Depends(require_staff_or_operator)])
async def record_booking_negotiation(
    booking_id: str,
    data: RateNegotiationRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    try:
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    except Exception:
        booking = await db.bookings.find_one({"bookingReference": booking_id})

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    await db.bookings.update_one(
        {"_id": booking["_id"]},
        {
            "$set": {
                "negotiation": {
                    "traderName": data.traderName,
                    "agreedRatePerQuintal": data.agreedRatePerQuintal,
                    "recordedAt": data.notes
                }
            }
        }
    )

    updated = await record_status_transition(
        collection_name="bookings",
        record_id=str(booking["_id"]),
        module="MARKET_BOOKING",
        new_status="RATE_NEGOTIATION",
        actor_id=current_user["id"],
        actor_role=current_user.get("role", "MARKET_STAFF"),
        actor_name=current_user.get("name", "Market Staff"),
        notes=f"Rate agreed with trader {data.traderName} at Rs {data.agreedRatePerQuintal}/quintal"
    )
    return updated
