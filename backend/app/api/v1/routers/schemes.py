from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from pydantic import BaseModel
from app.db.mongo import get_database, serialize_mongo_docs, serialize_mongo_doc
from app.schemas.scheme import SchemePreCheckRequest, SchemeCaseCreateRequest
from app.services.scheme_service import scheme_service
from app.services.status_service import record_status_transition
from app.api.deps import get_current_user, require_help_desk

router = APIRouter(prefix="/schemes", tags=["Government Schemes & Assistance"])

class UpdateCaseStatusRequest(BaseModel):
    newStatus: str
    notes: Optional[str] = None
    evidence: Optional[dict] = None

class AssignCaseOperatorRequest(BaseModel):
    operatorId: str
    operatorName: str

@router.get("")
async def list_schemes(
    jurisdiction: Optional[str] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    search: Optional[str] = None
):
    return await scheme_service.list_schemes(
        jurisdiction=jurisdiction,
        category=category,
        state=state,
        district=district,
        search=search
    )

@router.get("/{scheme_id}")
async def get_scheme(scheme_id: str):
    db = get_database()
    try:
        scheme = await db.schemes.find_one({"_id": ObjectId(scheme_id)})
    except Exception:
        scheme = await db.schemes.find_one({"schemeCode": scheme_id})

    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")
    return serialize_mongo_doc(scheme)

@router.post("/{scheme_id}/pre-check")
async def run_scheme_pre_check(scheme_id: str, data: SchemePreCheckRequest):
    return await scheme_service.run_pre_check(
        scheme_id=scheme_id,
        land_holding_acres=data.landHoldingAcres,
        owns_aadhaar=data.ownsAadhaar,
        is_tenant=data.isTenantFarmer
    )

@router.post("/cases")
async def create_assisted_case(
    data: SchemeCaseCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    return await scheme_service.create_assisted_case(
        farmer_id=current_user["id"],
        farmer_phone=current_user["phone"],
        farmer_name=current_user.get("name", "Farmer"),
        scheme_id=data.schemeId,
        consent_recorded=data.consentRecorded,
        document_checklist=data.documentChecklist,
        notes=data.notes
    )

@router.get("/cases/my")
async def get_my_scheme_cases(current_user: dict = Depends(get_current_user)):
    db = get_database()
    cases = await db.scheme_cases.find({
        "farmerId": current_user["id"]
    }).sort("createdAt", -1).to_list(100)
    return serialize_mongo_docs(cases)

@router.get("/cases/all", dependencies=[Depends(require_help_desk)])
async def get_all_scheme_cases(status_filter: Optional[str] = None):
    db = get_database()
    query = {}
    if status_filter:
        query["status"] = status_filter
    cases = await db.scheme_cases.find(query).sort("createdAt", -1).to_list(100)
    return serialize_mongo_docs(cases)

@router.post("/cases/{case_id}/status")
async def update_case_status(
    case_id: str,
    data: UpdateCaseStatusRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        updated = await record_status_transition(
            collection_name="scheme_cases",
            record_id=case_id,
            module="SCHEME_ASSISTANCE",
            new_status=data.newStatus,
            actor_id=current_user["id"],
            actor_role=current_user.get("role", "HELP_DESK_OPERATOR"),
            actor_name=current_user.get("name", "Operator"),
            notes=data.notes,
            evidence=data.evidence
        )
        return serialize_mongo_doc(updated)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/cases/{case_id}/assign", dependencies=[Depends(require_help_desk)])
async def assign_case_operator(
    case_id: str,
    data: AssignCaseOperatorRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    try:
        case = await db.scheme_cases.find_one({"_id": ObjectId(case_id)})
    except Exception:
        case = await db.scheme_cases.find_one({"id": case_id})

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    await db.scheme_cases.update_one(
        {"_id": case["_id"]},
        {"$set": {"operatorId": data.operatorId, "operatorName": data.operatorName}}
    )

    updated = await record_status_transition(
        collection_name="scheme_cases",
        record_id=str(case["_id"]),
        module="SCHEME_ASSISTANCE",
        new_status="ASSIGNED_TO_OPERATOR",
        actor_id=current_user["id"],
        actor_role=current_user.get("role", "ADMIN"),
        actor_name=current_user.get("name", "Supervisor"),
        notes=f"Assigned to operator {data.operatorName}"
    )

    return serialize_mongo_doc(updated)
