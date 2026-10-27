from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from pydantic import BaseModel
from app.db.mongo import get_database, serialize_mongo_docs, serialize_mongo_doc
from app.schemas.support_notification_admin import AdminSummaryKPIs
from app.schemas.auth import RoleApprovalSchema
from app.api.deps import require_admin
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/admin", tags=["Admin & Operations"], dependencies=[Depends(require_admin)])

class CapacityOverrideSchema(BaseModel):
    marketId: str
    date: str
    slotTime: str
    newCapacity: int
    reason: str

class FeedbackModerationSchema(BaseModel):
    status: str  # 'PUBLISHED' | 'FLAGGED' | 'REMOVED'
    notes: Optional[str] = None

@router.get("/summary-kpis", response_model=AdminSummaryKPIs)
async def get_admin_kpis():
    db = get_database()
    today_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    total_bookings = await db.bookings.count_documents({"date": today_date})
    checked_in = await db.bookings.count_documents({"date": today_date, "status": "CHECKED_IN"})
    
    slots = await db.market_slots.find({"date": today_date}).to_list(100)
    total_cap = sum(s.get("totalCapacityVehicles", 25) for s in slots) or 100
    booked_cap = sum(s.get("bookedVehicles", 0) for s in slots)
    utilization = round((booked_cap / total_cap) * 100, 1)

    total_godown_res = await db.godown_reservations.count_documents({})
    orders_count = await db.orders.count_documents({})
    pending_sellers = await db.sellers.count_documents({"verificationStatus": "PENDING"})
    open_cases = await db.support_cases.count_documents({"status": "OPEN"})
    outbox_pending = await db.notification_outbox.count_documents({"status": "PENDING"})

    return {
        "totalBookingsToday": total_bookings,
        "checkedInBookingsToday": checked_in,
        "slotUtilizationPercent": utilization,
        "totalGodownReservations": total_godown_res,
        "marketplaceOrdersCount": orders_count,
        "pendingSellerApprovals": pending_sellers,
        "openSupportCases": open_cases,
        "notificationOutboxPending": outbox_pending,
        "pilotDistrict": "Kurnool"
    }

@router.get("/users")
async def list_users(
    role: Optional[str] = None,
    pending_only: bool = False,
    search: Optional[str] = None,
    limit: int = 50
):
    db = get_database()
    query = {}
    if role:
        query["roles"] = role
    if pending_only:
        query["pendingRoles"] = {"$exists": True, "$not": {"$size": 0}}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]
    users = await db.users.find(query).sort("createdAt", -1).to_list(limit)
    return serialize_mongo_docs(users)

@router.post("/users/approve-role")
async def approve_user_role(data: RoleApprovalSchema, admin_user: dict = Depends(require_admin)):
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(data.userId)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user_roles = user.get("roles", [user.get("role", "FARMER")])
    pending_roles = user.get("pendingRoles", [])

    if data.approved:
        if data.role not in user_roles:
            user_roles.append(data.role)
        pending_roles = [r for r in pending_roles if r != data.role]
        await db.users.update_one(
            {"_id": ObjectId(data.userId)},
            {"$set": {"roles": user_roles, "pendingRoles": pending_roles}}
        )
        # Notify user
        await db.notifications.insert_one({
            "userId": data.userId,
            "type": "ROLE_APPROVED",
            "title": f"Role Approved: {data.role}",
            "message": f"Your requested role '{data.role}' has been verified and approved by the district administrator.",
            "read": False,
            "createdAt": datetime.now(timezone.utc).isoformat()
        })
    else:
        pending_roles = [r for r in pending_roles if r != data.role]
        await db.users.update_one(
            {"_id": ObjectId(data.userId)},
            {"$set": {"pendingRoles": pending_roles}}
        )
        await db.notifications.insert_one({
            "userId": data.userId,
            "type": "ROLE_REJECTED",
            "title": f"Role Request Declined: {data.role}",
            "message": f"Your request for role '{data.role}' was declined. Reason: {data.rejectionReason or 'Documentation incomplete'}",
            "read": False,
            "createdAt": datetime.now(timezone.utc).isoformat()
        })

    await record_audit_log(
        action="APPROVE_ROLE" if data.approved else "REJECT_ROLE",
        resource="USER",
        resource_id=data.userId,
        user_id=admin_user["id"],
        user_role="ADMIN",
        details={"role": data.role, "approved": data.approved, "reason": data.rejectionReason}
    )

    return {
        "success": True,
        "message": f"Role '{data.role}' {'approved' if data.approved else 'declined'}",
        "roles": user_roles,
        "pendingRoles": pending_roles
    }

@router.post("/users/{user_id}/toggle-status")
async def toggle_user_active_status(user_id: str, admin_user: dict = Depends(require_admin)):
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    new_status = not user.get("isActive", True)
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"isActive": new_status}})

    await record_audit_log(
        action="TOGGLE_USER_STATUS",
        resource="USER",
        resource_id=user_id,
        user_id=admin_user["id"],
        user_role="ADMIN",
        details={"isActive": new_status}
    )

    return {"success": True, "userId": user_id, "isActive": new_status}

@router.get("/audit-logs")
async def get_audit_logs(limit: int = 100):
    db = get_database()
    logs = await db.audit_logs.find().sort("timestamp", -1).to_list(limit)
    return serialize_mongo_docs(logs)

@router.post("/override-capacity")
async def override_slot_capacity(
    body: CapacityOverrideSchema,
    admin_user: dict = Depends(require_admin)
):
    db = get_database()
    updated = await db.market_slots.find_one_and_update(
        {"marketId": body.marketId, "date": body.date, "slotTime": body.slotTime},
        {"$set": {"totalCapacityVehicles": body.newCapacity}},
        return_document=True
    )
    if not updated:
        doc = {
            "marketId": body.marketId,
            "date": body.date,
            "slotTime": body.slotTime,
            "totalCapacityVehicles": body.newCapacity,
            "bookedVehicles": 0,
            "isActive": True
        }
        res = await db.market_slots.insert_one(doc)
        updated = doc
        updated["_id"] = res.inserted_id

    await record_audit_log(
        action="OVERRIDE_CAPACITY",
        resource="MARKET_SLOT",
        resource_id=f"{body.marketId}_{body.date}_{body.slotTime}",
        user_id=admin_user["id"],
        user_role="ADMIN",
        details={"newCapacity": body.newCapacity, "reason": body.reason}
    )

    return {"success": True, "message": f"Capacity updated to {body.newCapacity}", "reason": body.reason}
