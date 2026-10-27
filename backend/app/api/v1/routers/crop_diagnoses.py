from fastapi import APIRouter, HTTPException, status, Depends
from app.db.mongo import get_database
from app.schemas.crop_diagnosis import CropDiagnosisRequest, CropDiagnosisResponse
from app.services.crop_health_service import crop_health_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/crop-diagnoses", tags=["AI Crop-Health Screening"])

@router.post("/analyze", response_model=CropDiagnosisResponse)
async def analyze_crop_health(
    data: CropDiagnosisRequest,
    current_user: dict = Depends(get_current_user)
):
    if not data.consentRecorded:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent is required for image-based diagnostic processing."
        )

    result = await crop_health_service.analyze_crop_image(
        farmer_id=current_user["id"],
        crop_type=data.cropType,
        growth_stage=data.growthStage,
        observed_symptoms=data.observedSymptoms,
        image_base64=data.imageBase64
    )
    return result

@router.get("/my")
async def get_my_diagnoses(current_user: dict = Depends(get_current_user)):
    db = get_database()
    items = await db.crop_diagnoses.find({"farmerId": current_user["id"]}).sort("createdAt", -1).to_list(50)
    for it in items:
        it["id"] = str(it["_id"])
    return items
