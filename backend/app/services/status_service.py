from datetime import datetime, timezone
from typing import Dict, List, Optional
from bson import ObjectId
from app.db.mongo import get_database
from app.services.audit_service import record_audit_log

# Allowed transitions state machine map by module
MODULE_ALLOWED_TRANSITIONS: Dict[str, Dict[str, List[str]]] = {
    "MARKET_BOOKING": {
        "BOOKED": ["CONFIRMED", "ARRIVED", "ENTERED", "WAITING", "CANCELLED", "REJECTED", "NO_SHOW"],
        "CONFIRMED": ["ARRIVED", "ENTERED", "WAITING", "STORED", "SELLED", "CANCELLED", "REJECTED", "NO_SHOW"],
        "ARRIVED": ["WAITING", "ENTERED", "STORED", "SELLED", "COMPLETED", "REJECTED", "CANCELLED"],
        "ENTERED": ["WAITING", "ARRIVED", "RATE_NEGOTIATION", "STORED", "SELLED", "LOADING", "COMPLETED", "REJECTED"],
        "WAITING": ["ARRIVED", "ENTERED", "STORED", "SELLED", "RATE_NEGOTIATION", "LOADING", "COMPLETED", "CANCELLED"],
        "RATE_NEGOTIATION": ["WAITING", "LOADING", "SELLED", "COMPLETED", "REJECTED", "CANCELLED"],
        "STORED": ["WAITING", "SELLED", "COMPLETED", "DISPATCHED", "CANCELLED"],
        "SELLED": ["COMPLETED", "DISPATCHED", "LOADING", "STORED"],
        "SOLD": ["COMPLETED", "DISPATCHED", "LOADING", "STORED"],
        "LOADING": ["COMPLETED", "REJECTED"],
        "COMPLETED": [],
        "REJECTED": [],
        "CANCELLED": [],
        "NO_SHOW": []
    },
    "GODOWN_RESERVATION": {
        "INITIATED": ["CONFIRMED", "CANCELLED"],
        "CONFIRMED": ["ARRIVED", "WAITING", "STORED", "COMPLETED", "CANCELLED"],
        "ARRIVED": ["WAITING", "STORED", "COMPLETED", "CANCELLED"],
        "WAITING": ["ARRIVED", "STORED", "COMPLETED", "CANCELLED"],
        "STORED": ["WAITING", "SELLED", "DISPATCHED", "COMPLETED", "CANCELLED"],
        "SELLED": ["COMPLETED", "DISPATCHED"],
        "SOLD": ["COMPLETED", "DISPATCHED"],
        "DISPATCHED": ["COMPLETED"],
        "COMPLETED": [],
        "CANCELLED": []
    },
    "CROP_TRADE": {
        "DRAFT": ["PUBLISHED", "CANCELLED"],
        "PUBLISHED": ["INQUIRY_RECEIVED", "OFFER_MADE", "CANCELLED"],
        "INQUIRY_RECEIVED": ["OFFER_MADE", "NEGOTIATING", "CANCELLED"],
        "OFFER_MADE": ["NEGOTIATING", "DEAL_AGREED", "CANCELLED"],
        "NEGOTIATING": ["DEAL_AGREED", "CANCELLED"],
        "DEAL_AGREED": ["PICKUP_SCHEDULED", "CANCELLED", "DISPUTED"],
        "PICKUP_SCHEDULED": ["IN_TRANSIT", "DELIVERED", "CANCELLED", "DISPUTED"],
        "IN_TRANSIT": ["DELIVERED", "DISPUTED"],
        "DELIVERED": ["COMPLETED", "DISPUTED"],
        "COMPLETED": [],
        "CANCELLED": [],
        "DISPUTED": ["COMPLETED", "CANCELLED"]
    },
    "ORDER": {
        "ORDER_PLACED": ["ACCEPTED", "REJECTED", "CANCELLED"],
        "ACCEPTED": ["PREPARING", "CANCELLED"],
        "PREPARING": ["READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "CANCELLED"],
        "READY_FOR_PICKUP": ["DELIVERED", "COMPLETED"],
        "OUT_FOR_DELIVERY": ["REACHED_CUSTOMER", "DELIVERED", "CANCELLED"],
        "REACHED_CUSTOMER": ["DELIVERED"],
        "DELIVERED": ["COMPLETED"],
        "COMPLETED": [],
        "CANCELLED": [],
        "REJECTED": []
    },
    "VETERINARY": {
        "REQUEST_SUBMITTED": ["ASSIGNED", "CANCELLED", "REJECTED"],
        "ASSIGNED": ["ACCEPTED", "REJECTED", "RESCHEDULE_REQUIRED"],
        "ACCEPTED": ["SCHEDULED", "PROVIDER_ON_THE_WAY", "CANCELLED"],
        "SCHEDULED": ["PROVIDER_ON_THE_WAY", "RESCHEDULE_REQUIRED", "CANCELLED"],
        "PROVIDER_ON_THE_WAY": ["REACHED_FARM", "RESCHEDULE_REQUIRED", "CANCELLED"],
        "REACHED_FARM": ["CONSULTATION_STARTED"],
        "CONSULTATION_STARTED": ["COMPLETED", "RESCHEDULE_REQUIRED"],
        "COMPLETED": [],
        "CANCELLED": [],
        "REJECTED": [],
        "RESCHEDULE_REQUIRED": ["SCHEDULED", "CANCELLED"]
    },
    "EQUIPMENT_RENTAL": {
        "RENTAL_REQUESTED": ["OWNER_ACCEPTED", "REJECTED", "CANCELLED"],
        "OWNER_ACCEPTED": ["PAYMENT_PENDING", "CONFIRMED", "CANCELLED"],
        "PAYMENT_PENDING": ["CONFIRMED", "CANCELLED"],
        "CONFIRMED": ["EQUIPMENT_PREPARED", "DISPATCHED", "CANCELLED"],
        "EQUIPMENT_PREPARED": ["DISPATCHED", "REACHED_FARM", "RENTAL_ACTIVE"],
        "DISPATCHED": ["REACHED_FARM", "RENTAL_ACTIVE"],
        "REACHED_FARM": ["RENTAL_ACTIVE"],
        "RENTAL_ACTIVE": ["RETURN_REQUESTED", "DISPUTED"],
        "RETURN_REQUESTED": ["RETURNED", "DISPUTED"],
        "RETURNED": ["INSPECTED", "DISPUTED"],
        "INSPECTED": ["COMPLETED", "DISPUTED"],
        "COMPLETED": [],
        "CANCELLED": [],
        "DISPUTED": ["COMPLETED", "CANCELLED"]
    },
    "SCHEME_ASSISTANCE": {
        "ASSISTANCE_REQUESTED": ["ASSIGNED_TO_OPERATOR", "CANCELLED"],
        "ASSIGNED_TO_OPERATOR": ["DOCUMENTS_PENDING", "CANCELLED"],
        "DOCUMENTS_PENDING": ["DOCUMENTS_VERIFIED", "CANCELLED"],
        "DOCUMENTS_VERIFIED": ["READY_FOR_SUBMISSION", "CANCELLED"],
        "READY_FOR_SUBMISSION": ["SUBMITTED", "CANCELLED"],
        "SUBMITTED": ["UNDER_REVIEW"],
        "UNDER_REVIEW": ["APPROVED", "REJECTED", "DOCUMENTS_PENDING"],
        "APPROVED": ["ASSISTANCE_COMPLETED"],
        "REJECTED": ["ASSISTANCE_COMPLETED"],
        "ASSISTANCE_COMPLETED": [],
        "CANCELLED": []
    },
    "FIELD_SERVICE": {
        "REQUESTED": ["ASSIGNED", "CANCELLED", "REJECTED"],
        "ASSIGNED": ["ACCEPTED", "REJECTED"],
        "ACCEPTED": ["ON_THE_WAY", "IN_PROGRESS"],
        "ON_THE_WAY": ["REACHED_LOCATION"],
        "REACHED_LOCATION": ["IN_PROGRESS"],
        "IN_PROGRESS": ["COMPLETED", "ON_HOLD", "CANCELLED"],
        "ON_HOLD": ["IN_PROGRESS", "CANCELLED"],
        "COMPLETED": [],
        "REJECTED": [],
        "CANCELLED": []
    }
}

async def record_status_transition(
    collection_name: str,
    record_id: str,
    module: str,
    new_status: str,
    actor_id: str,
    actor_role: str,
    actor_name: str,
    notes: Optional[str] = None,
    evidence: Optional[dict] = None,
    customer_confirmation: bool = False
) -> dict:
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()
    
    # Fetch record by ObjectId, id, or reference token
    record = None
    try:
        record = await db[collection_name].find_one({"_id": ObjectId(record_id)})
    except Exception:
        pass
    if not record:
        cleaned_id = str(record_id).strip()
        record = await db[collection_name].find_one({
            "$or": [
                {"_id": cleaned_id},
                {"id": cleaned_id},
                {"bookingReference": cleaned_id.upper()},
                {"reservationReference": cleaned_id.upper()}
            ]
        })

    if not record:
        raise ValueError(f"Record '{record_id}' not found in '{collection_name}'")

    current_status = record.get("status", "REQUESTED")
    allowed = MODULE_ALLOWED_TRANSITIONS.get(module, {}).get(current_status, [])

    # If transitions defined, validate unless actor is ADMIN
    if allowed and new_status not in allowed and actor_role != "ADMIN":
        raise ValueError(
            f"Invalid status transition from '{current_status}' to '{new_status}' for {module}. Allowed: {allowed}"
        )

    history_entry = {
        "fromStatus": current_status,
        "toStatus": new_status,
        "timestamp": now_iso,
        "actorId": actor_id,
        "actorRole": actor_role,
        "actorName": actor_name,
        "notes": notes,
        "evidence": evidence or {},
        "customerConfirmation": customer_confirmation
    }

    update_fields = {
        "status": new_status,
        "updatedAt": now_iso,
        "lastUpdatedBy": actor_name
    }
    if customer_confirmation:
        update_fields["confirmedByCustomer"] = True
        update_fields["confirmedAt"] = now_iso

    await db[collection_name].update_one(
        {"_id": record["_id"]},
        {
            "$set": update_fields,
            "$push": {"statusHistory": history_entry}
        }
    )

    # Trigger In-App Notification to Record Owner or Assigned User
    target_user_id = record.get("farmerId") or record.get("userId") or record.get("customerId")
    if target_user_id and str(target_user_id) != str(actor_id):
        await db.notifications.insert_one({
            "userId": str(target_user_id),
            "type": f"{module}_STATUS_UPDATED",
            "title": f"Status Update: {new_status.replace('_', ' ').title()}",
            "message": f"Your {module.replace('_', ' ').title()} status changed from {current_status} to {new_status}. {notes or ''}",
            "recordId": str(record["_id"]),
            "module": module,
            "read": False,
            "createdAt": now_iso
        })

    # Record Audit Log
    await record_audit_log(
        action=f"STATUS_TRANSITION_{new_status}",
        resource=module,
        resource_id=str(record["_id"]),
        user_id=actor_id,
        user_role=actor_role,
        details={
            "fromStatus": current_status,
            "toStatus": new_status,
            "notes": notes,
            "evidence": evidence
        }
    )

    updated_record = await db[collection_name].find_one({"_id": record["_id"]})
    if updated_record:
        updated_record["id"] = str(updated_record["_id"])
        updated_record["_id"] = str(updated_record["_id"])
    return updated_record
