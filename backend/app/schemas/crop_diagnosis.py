from typing import Optional, List
from pydantic import BaseModel, Field

class CropDiagnosisRequest(BaseModel):
    cropType: str = Field(..., description="Paddy, Cotton, Groundnut, Chili, Bengal Gram, Maize")
    growthStage: str = Field(..., description="Seedling, Vegetative, Flowering, Fruiting, Maturity")
    observedSymptoms: Optional[str] = None
    consentRecorded: bool = Field(..., description="Explicit farmer consent for image analysis")
    imageBase64: Optional[str] = None # Base64 encoded JPEG/PNG

class IssueFinding(BaseModel):
    issueName: str
    issueNameTe: str
    confidenceScore: float
    severity: str # "LOW", "MEDIUM", "HIGH"
    description: str
    recommendedSafeSteps: List[str]
    organicAlternatives: List[str]

class CropDiagnosisResponse(BaseModel):
    diagnosisId: str
    cropType: str
    growthStage: str
    modelVersion: str
    isMockInference: bool
    findings: List[IssueFinding]
    expertReferralRecommended: bool
    referralReason: Optional[str] = None
    kurnoolKVKContact: str
    disclaimer: str
    disclaimerTe: str
    createdAt: str
