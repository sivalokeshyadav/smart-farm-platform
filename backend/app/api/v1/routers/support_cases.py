import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.db.mongo import get_database
from app.schemas.support_notification_admin import SupportCaseCreateRequest
from app.api.deps import get_current_user, require_field_agent
from app.core.security import generate_reference_token

router = APIRouter(prefix="/support-cases", tags=["Helpdesk & Support Cases"])

@router.post("/")
async def create_support_case(
    data: SupportCaseCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    case_num = generate_reference_token("KNL-SUP", 5)
    now_iso = datetime.now(timezone.utc).isoformat()

    doc = {
        "caseNumber": case_num,
        "farmerId": current_user["id"],
        "farmerPhone": current_user["phone"],
        "category": data.category,
        "subject": data.subject,
        "description": data.description,
        "priority": data.priority,
        "status": "OPEN",
        "createdAt": now_iso
    }
    res = await db.support_cases.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return doc

@router.get("/my")
async def get_my_support_cases(current_user: dict = Depends(get_current_user)):
    db = get_database()
    cases = await db.support_cases.find({"farmerId": current_user["id"]}).sort("createdAt", -1).to_list(50)
    for c in cases:
        c["id"] = str(c["_id"])
    return cases

@router.get("/all", dependencies=[Depends(require_field_agent)])
async def get_all_support_cases():
    db = get_database()
    cases = await db.support_cases.find().sort("createdAt", -1).to_list(100)
    for c in cases:
        c["id"] = str(c["_id"])
    return cases

@router.post("/{case_id}/resolve", dependencies=[Depends(require_field_agent)])
async def resolve_support_case(case_id: str, notes: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()
    try:
        query = {"_id": ObjectId(case_id)}
    except Exception:
        query = {"caseNumber": case_id}

    updated = await db.support_cases.find_one_and_update(
        query,
        {
            "$set": {
                "status": "RESOLVED",
                "assignedAgentId": current_user["id"],
                "resolutionNotes": notes,
                "resolvedAt": now_iso
            }
        },
        return_document=True
    )
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Support case not found")
    updated["id"] = str(updated["_id"])
    return updated
