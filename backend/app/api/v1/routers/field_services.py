from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from pydantic import BaseModel, Field
from app.db.mongo import get_database, serialize_mongo_docs, serialize_mongo_doc
from app.api.deps import get_current_user
from app.services.status_service import record_status_transition

router = APIRouter(prefix="/field-services", tags=["Field Services & Appointments"])

class CreateFieldServiceRequest(BaseModel):
    serviceType: str = Field(..., description="VETERINARY | EQUIPMENT_DELIVERY | FIELD_INSPECTION | SCHEME_ASSISTANCE")
    title: str
    description: str
    scheduledDate: str
    scheduledTime: Optional[str] = "10:00 AM - 12:00 PM"
    farmLocation: str
    mandal: Optional[str] = "Kurnool Rural"
    district: Optional[str] = "Kurnool"
    state: Optional[str] = "Andhra Pradesh"
    contactPhone: str

class AssignProviderRequest(BaseModel):
    providerId: str
    providerName: str
    providerRole: str
    notes: Optional[str] = None

class StatusUpdateRequest(BaseModel):
    newStatus: str = Field(..., description="ACCEPTED | REJECTED | ON_THE_WAY | REACHED_LOCATION | IN_PROGRESS | COMPLETED | CANCELLED")
    notes: Optional[str] = None
    locationEvidence: Optional[dict] = None
    customerConfirmation: Optional[bool] = False

@router.post("")
async def create_field_service_request(
    data: CreateFieldServiceRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()

    doc = {
        "serviceType": data.serviceType,
        "title": data.title,
        "description": data.description,
        "scheduledDate": data.scheduledDate,
        "scheduledTime": data.scheduledTime,
        "farmLocation": data.farmLocation,
        "mandal": data.mandal,
        "district": data.district,
        "state": data.state,
        "contactPhone": data.contactPhone,
        "customerId": current_user["id"],
        "customerName": current_user.get("name", "Farmer"),
        "customerPhone": current_user["phone"],
        "status": "REQUESTED",
        "assignedProviderId": None,
        "assignedProviderName": None,
        "assignedProviderRole": None,
        "statusHistory": [
            {
                "fromStatus": None,
                "toStatus": "REQUESTED",
                "timestamp": now_iso,
                "actorId": current_user["id"],
                "actorRole": current_user.get("role", "FARMER"),
                "actorName": current_user.get("name", "Farmer"),
                "notes": "Service request submitted by farmer",
                "evidence": {}
            }
        ],
        "createdAt": now_iso,
        "updatedAt": now_iso
    }

    res = await db.field_services.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc["_id"] = str(res.inserted_id)

    # In-App notification
    await db.notifications.insert_one({
        "userId": current_user["id"],
        "type": "FIELD_SERVICE_CREATED",
        "title": f"Service Request Received: {data.serviceType}",
        "message": f"Your request for {data.title} has been logged. We are assigning a verified provider.",
        "recordId": doc["id"],
        "module": "FIELD_SERVICE",
        "read": False,
        "createdAt": now_iso
    })

    return doc

@router.get("")
async def list_field_services(
    service_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    mine: bool = False,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    query = {}
    if service_type:
        query["serviceType"] = service_type
    if status_filter:
        query["status"] = status_filter
    if mine:
        # Either the creator or the assigned provider
        user_id = current_user["id"]
        query["$or"] = [
            {"customerId": user_id},
            {"assignedProviderId": user_id}
        ]

    services = await db.field_services.find(query).sort("createdAt", -1).to_list(100)
    return serialize_mongo_docs(services)

@router.get("/{service_id}")
async def get_field_service_by_id(service_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    try:
        service = await db.field_services.find_one({"_id": ObjectId(service_id)})
    except Exception:
        service = await db.field_services.find_one({"id": service_id})

    if not service:
        raise HTTPException(status_code=404, detail="Service record not found")
    return serialize_mongo_doc(service)

@router.post("/{service_id}/assign")
async def assign_service_provider(
    service_id: str,
    data: AssignProviderRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()

    try:
        service = await db.field_services.find_one({"_id": ObjectId(service_id)})
    except Exception:
        service = await db.field_services.find_one({"id": service_id})

    if not service:
        raise HTTPException(status_code=404, detail="Service request not found")

    await db.field_services.update_one(
        {"_id": service["_id"]},
        {
            "$set": {
                "assignedProviderId": data.providerId,
                "assignedProviderName": data.providerName,
                "assignedProviderRole": data.providerRole,
                "assignedAt": now_iso
            }
        }
    )

    updated = await record_status_transition(
        collection_name="field_services",
        record_id=str(service["_id"]),
        module="FIELD_SERVICE",
        new_status="ASSIGNED",
        actor_id=current_user["id"],
        actor_role=current_user.get("role", "ADMIN"),
        actor_name=current_user.get("name", "Admin/Staff"),
        notes=f"Assigned to {data.providerName} ({data.providerRole}). {data.notes or ''}"
    )

    # Notify provider
    await db.notifications.insert_one({
        "userId": data.providerId,
        "type": "FIELD_SERVICE_ASSIGNED",
        "title": f"New Field Assignment: {service.get('title')}",
        "message": f"You have been assigned to visit {service.get('farmLocation')} on {service.get('scheduledDate')}.",
        "recordId": str(service["_id"]),
        "module": "FIELD_SERVICE",
        "read": False,
        "createdAt": now_iso
    })

    return serialize_mongo_doc(updated)

@router.post("/{service_id}/status")
async def update_service_status(
    service_id: str,
    data: StatusUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        updated = await record_status_transition(
            collection_name="field_services",
            record_id=service_id,
            module="FIELD_SERVICE",
            new_status=data.newStatus,
            actor_id=current_user["id"],
            actor_role=current_user.get("role", "PROVIDER"),
            actor_name=current_user.get("name", "Provider"),
            notes=data.notes,
            evidence=data.locationEvidence,
            customer_confirmation=bool(data.customerConfirmation)
        )
        return serialize_mongo_doc(updated)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
