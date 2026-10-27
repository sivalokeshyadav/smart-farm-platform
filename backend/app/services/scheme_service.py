from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from app.db.mongo import get_database, serialize_mongo_docs, serialize_mongo_doc
from app.core.security import generate_reference_token
from app.services.audit_service import record_audit_log
from app.services.status_service import record_status_transition

OFFICIAL_DISCLAIMER_EN = (
    "OFFICIAL DISCLAIMER: This eligibility assessment is indicative only and does NOT guarantee scheme sanction or subsidy disbursement. "
    "Final eligibility, verification and sanction decisions rest exclusively with the Government of Andhra Pradesh, Government of Telangana, "
    "and Central Ministries under respective statutory guidelines. This platform is not an official government sanctioning body."
)

OFFICIAL_DISCLAIMER_TE = (
    "అధికారిక హెచ్చరిక: ఈ ముందస్తు అర్హత పరీక్ష సూచనాత్మకమైనది మాత్రమే. పథకం మంజూరును లేదా రాయితీని ఇది ఖచ్చితంగా ధ్రువీకరించదు. "
    "తుది అర్హత మరియు మంజూరు నిర్ణయాలు సంబంధిత ప్రభుత్వ శాఖల అధికార పరిధిలోని నిబంధనలకు లోబడి ఉంటాయి."
)

OFFICIAL_DISCLAIMER_HI = (
    "आधिकारिक अस्वीकरण: यह पात्रता आकलन केवल सांकेतिक है और किसी योजना की मंजूरी या सब्सिडी वितरण की गारंटी नहीं देता है। "
    "अंतिम पात्रता और स्वीकृति का निर्णय संबंधित सरकारी विभागों के आधिकारिक नियमों के अधीन है।"
)

class SchemeService:
    @staticmethod
    async def list_schemes(
        jurisdiction: Optional[str] = None,
        category: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        db = get_database()
        query: Dict[str, Any] = {"isActive": True}
        
        if jurisdiction and jurisdiction != "ALL":
            query["jurisdiction"] = jurisdiction
        if category and category != "ALL":
            query["category"] = category
        if state and state != "ALL":
            query["$or"] = [
                {"applicableStates": state},
                {"applicableStates": "ALL"},
                {"jurisdiction": "CENTRAL"}
            ]
        if district and district != "ALL":
            query["$or"] = [
                {"applicableDistricts": district},
                {"applicableDistricts": "ALL"},
                {"applicableStates": "ALL"}
            ]
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"titleTe": {"$regex": search, "$options": "i"}},
                {"titleHi": {"$regex": search, "$options": "i"}},
                {"officialName": {"$regex": search, "$options": "i"}},
                {"eligibilitySummary": {"$regex": search, "$options": "i"}}
            ]
        
        schemes = await db.schemes.find(query).to_list(100)
        return serialize_mongo_docs(schemes)

    @staticmethod
    async def run_pre_check(scheme_id: str, land_holding_acres: float, owns_aadhaar: bool, is_tenant: bool) -> Dict[str, Any]:
        db = get_database()
        try:
            scheme = await db.schemes.find_one({"_id": ObjectId(scheme_id)})
        except Exception:
            scheme = await db.schemes.find_one({"schemeCode": scheme_id})

        if not scheme:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")

        is_eligible = True
        unmet_criteria = []

        if not owns_aadhaar:
            is_eligible = False
            unmet_criteria.append("Aadhaar linkage with bank account (DBT enabled) is required.")

        max_land = scheme.get("maxLandHoldingAcres")
        if max_land is not None and land_holding_acres > max_land:
            is_eligible = False
            unmet_criteria.append(f"Land holding exceeds {max_land} acres limit for this component.")

        if is_tenant and not scheme.get("tenantEligible", True):
            is_eligible = False
            unmet_criteria.append("This scheme requires pattadar land ownership passbook (1B/ROR).")

        return {
            "schemeId": str(scheme["_id"]),
            "schemeTitle": scheme.get("title"),
            "officialName": scheme.get("officialName", scheme.get("title")),
            "indicativeEligibility": is_eligible,
            "unmetCriteria": unmet_criteria,
            "officialSourceUrl": scheme.get("officialSourceUrl"),
            "requiredDocuments": scheme.get("requiredDocuments", []),
            "lastVerifiedDate": scheme.get("lastVerifiedDate", "2026-03-01"),
            "verificationStatus": scheme.get("verificationStatus", "VERIFIED_OFFICIAL"),
            "disclaimer": OFFICIAL_DISCLAIMER_EN,
            "disclaimerTe": OFFICIAL_DISCLAIMER_TE,
            "disclaimerHi": OFFICIAL_DISCLAIMER_HI
        }

    @staticmethod
    async def create_assisted_case(
        farmer_id: str,
        farmer_phone: str,
        farmer_name: str,
        scheme_id: str,
        consent_recorded: bool,
        document_checklist: List[dict],
        notes: Optional[str] = None,
        operator_id: Optional[str] = None
    ) -> Dict[str, Any]:
        if not consent_recorded:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Farmer explicit consent is legally required before initiating an assisted scheme guidance case."
            )

        db = get_database()
        try:
            scheme = await db.schemes.find_one({"_id": ObjectId(scheme_id)})
        except Exception:
            scheme = await db.schemes.find_one({"schemeCode": scheme_id})

        if not scheme:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")

        case_ref = generate_reference_token("KNL-SCH", 5)
        now_iso = datetime.now(timezone.utc).isoformat()

        case_doc = {
            "caseReference": case_ref,
            "farmerId": farmer_id,
            "farmerPhone": farmer_phone,
            "farmerName": farmer_name,
            "schemeId": str(scheme["_id"]),
            "schemeTitle": scheme.get("title"),
            "officialName": scheme.get("officialName", scheme.get("title")),
            "operatorId": operator_id,
            "consentRecorded": True,
            "status": "ASSISTANCE_REQUESTED",
            "documentChecklist": document_checklist,
            "notes": notes,
            "officialPortal": scheme.get("officialSourceUrl"),
            "statusHistory": [
                {
                    "fromStatus": None,
                    "toStatus": "ASSISTANCE_REQUESTED",
                    "timestamp": now_iso,
                    "actorId": farmer_id,
                    "actorRole": "FARMER",
                    "actorName": farmer_name,
                    "notes": f"Assistance requested for {scheme.get('title')}",
                    "evidence": {}
                }
            ],
            "createdAt": now_iso,
            "updatedAt": now_iso
        }

        res = await db.scheme_cases.insert_one(case_doc)
        case_doc["id"] = str(res.inserted_id)

        # Notify Farmer
        await db.notifications.insert_one({
            "userId": farmer_id,
            "type": "SCHEME_ASSISTANCE_CREATED",
            "title": f"Assistance Case Logged: {case_ref}",
            "message": f"Your assistance request for {scheme.get('title')} has been assigned reference {case_ref}.",
            "recordId": case_doc["id"],
            "module": "SCHEME_ASSISTANCE",
            "read": False,
            "createdAt": now_iso
        })

        await record_audit_log(
            action="CREATE_SCHEME_CASE",
            resource="SCHEME_CASE",
            resource_id=case_ref,
            user_id=farmer_id,
            details={"scheme": scheme.get("title")}
        )

        return case_doc

scheme_service = SchemeService()
