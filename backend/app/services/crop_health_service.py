import secrets
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.db.mongo import get_database
from app.services.audit_service import record_audit_log

AI_MODEL_VERSION = "KNL-AGRI-DIAGNOSE-MOCK-v1.4"

# Knowledge base for local Rayalaseema / Kurnool pilot crops
CROP_DISEASE_KNOWLEDGE = {
    "Cotton": [
        {
            "issueName": "Pink Bollworm (Pectinophora gossypiella)",
            "issueNameTe": "గులాబీ రంగు కాయ తొలుచు పురుగు",
            "confidenceScore": 0.88,
            "severity": "HIGH",
            "description": "Rosetted flowers, double seeds inside open bolls, internal lint staining.",
            "recommendedSafeSteps": [
                "Install pheromone traps (5 per acre) for monitoring moth activity.",
                "Erect bird perches across field (10-15 per acre).",
                "Hand-pick and destroy rosetted flowers and dropped bolls in a pit."
            ],
            "organicAlternatives": ["Spray 5% Neem Seed Kernel Extract (NSKE) at dusk."]
        },
        {
            "issueName": "Cotton Leaf Curl Virus (CLCuV)",
            "issueNameTe": "పత్తి ఆకు ముడుత తెగులు",
            "confidenceScore": 0.74,
            "severity": "MEDIUM",
            "description": "Upward or downward leaf curling, vein thickening and enation on lower leaf surface.",
            "recommendedSafeSteps": [
                "Manage whitefly vectors using yellow sticky traps.",
                "Uproot and destroy severely infected stunted plants."
            ],
            "organicAlternatives": ["Neem oil 1500 ppm spray (5ml per litre)."]
        }
    ],
    "Paddy": [
        {
            "issueName": "Rice Blast (Magnaporthe oryzae)",
            "issueNameTe": "వరి అగ్గి తెగులు",
            "confidenceScore": 0.85,
            "severity": "HIGH",
            "description": "Spindle-shaped lesions with brown borders and grey centers on leaf blades and neck.",
            "recommendedSafeSteps": [
                "Avoid excess nitrogenous fertilizer application during humid cloudy weather.",
                "Maintain optimal standing water level without drought stress.",
                "Consult local Rythu Bharosa Kendra (RBK) assistant before chemical intervention."
            ],
            "organicAlternatives": ["Spray Pseudomonas fluorescens @ 10g/litre."]
        },
        {
            "issueName": "Bacterial Leaf Blight (Xanthomonas oryzae)",
            "issueNameTe": "వరి ఎండ తెగులు",
            "confidenceScore": 0.79,
            "severity": "MEDIUM",
            "description": "Water-soaked stripes starting at leaf margins turning wavy yellow to straw colored.",
            "recommendedSafeSteps": [
                "Drain excess field water temporarily to reduce humidity.",
                "Avoid clipping leaf tips during transplanting."
            ],
            "organicAlternatives": ["Fresh cow dung filtrate 20% spray."]
        }
    ],
    "Groundnut": [
        {
            "issueName": "Tikka Leaf Spot (Cercospora arachidicola)",
            "issueNameTe": "వేరుశనగ తిక్కా తెగులు",
            "confidenceScore": 0.91,
            "severity": "MEDIUM",
            "description": "Circular dark brown spots surrounded by prominent yellow chlorotic halos on leaves.",
            "recommendedSafeSteps": [
                "Ensure proper crop spacing to allow air circulation.",
                "Remove and burn plant debris after harvest to prevent spore carryover."
            ],
            "organicAlternatives": ["Panchagavya 3% foliar spray."]
        }
    ],
    "Chili": [
        {
            "issueName": "Chili Leaf Curl (Gemini virus / Thrips complex)",
            "issueNameTe": "మిర్చి బొబ్బర లేదా ఆకు ముడుత తెగులు",
            "confidenceScore": 0.86,
            "severity": "HIGH",
            "description": "Boat-shaped upward cupping due to thrips or downward curling due to mites, puckering.",
            "recommendedSafeSteps": [
                "Install blue sticky traps (for thrips) and yellow traps (for whiteflies).",
                "Grow barrier crops like Maize or Jowar around chili plot."
            ],
            "organicAlternatives": ["Agni Astra or Neem seed kernel extract spray."]
        }
    ]
}

class CropHealthService:
    @staticmethod
    async def analyze_crop_image(
        farmer_id: str,
        crop_type: str,
        growth_stage: str,
        observed_symptoms: Optional[str] = None,
        image_base64: Optional[str] = None
    ) -> Dict[str, Any]:
        db = get_database()
        diagnosis_id = f"DIAG-{secrets.token_hex(5).upper()}"
        now_iso = datetime.now(timezone.utc).isoformat()

        # Retrieve knowledge issues for this crop
        findings = CROP_DISEASE_KNOWLEDGE.get(crop_type, CROP_DISEASE_KNOWLEDGE["Paddy"])

        # Determine if referral is necessary (if confidence < 0.80 or high severity)
        expert_referral = any(f["severity"] == "HIGH" or f["confidenceScore"] < 0.80 for f in findings)
        referral_reason = (
            "High severity fungal/pest pressure identified. Immediate ground inspection by Krishi Vigyan Kendra (KVK) "
            "Yagantipalle / Banavasi or local RBK Agricultural Officer is strongly advised."
            if expert_referral else None
        )

        doc = {
            "diagnosisId": diagnosis_id,
            "farmerId": farmer_id,
            "cropType": crop_type,
            "growthStage": growth_stage,
            "observedSymptoms": observed_symptoms,
            "modelVersion": AI_MODEL_VERSION,
            "isMockInference": True,
            "findings": findings,
            "expertReferralRecommended": expert_referral,
            "referralReason": referral_reason,
            "kurnoolKVKContact": "KVK Yagantipalle, Banavasi Farm, Kurnool: 08518-223456 / Toll-free: 1800-425-3536",
            "disclaimer": (
                "IMPORTANT: This AI screening is an assistive advisory tool in pilot testing. "
                "It does not replace clinical field pathology. Definite prescription requires an authorized agronomist."
            ),
            "disclaimerTe": (
                "గమనిక: ఈ AI పరిశీలన కేవలం ఒక సహాయక సూచన మాత్రమే. ఖచ్చితమైన రసాయన పిచికారీ కొరకు మీ మండల వ్యవసాయ అధికారి లేదా RBK సిబ్బందిని సంప్రదించండి."
            ),
            "createdAt": now_iso
        }

        await db.crop_diagnoses.insert_one(doc)
        doc["id"] = str(doc["_id"])

        await record_audit_log(
            action="AI_CROP_DIAGNOSIS",
            resource="CROP_HEALTH",
            resource_id=diagnosis_id,
            user_id=farmer_id,
            details={"crop": crop_type, "findingsCount": len(findings)}
        )

        return doc

crop_health_service = CropHealthService()
