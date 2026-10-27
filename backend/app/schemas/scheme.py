from typing import Optional, List
from pydantic import BaseModel, Field

class SchemeBase(BaseModel):
    schemeCode: str
    title: str
    titleTe: str
    jurisdiction: str # "STATE", "CENTRAL"
    category: str # "FINANCIAL_INCOME_SUPPORT", "CROP_INSURANCE", "IRRIGATION_SUBSIDY", "FARM_MACHINERY"
    eligibilitySummary: str
    eligibilitySummaryTe: str
    maxLandHoldingAcres: Optional[float] = None
    tenantEligible: bool = True
    benefits: str
    benefitsTe: str
    officialSourceUrl: str
    requiredDocuments: List[str]
    lastReviewedDate: str
    isActive: bool = True

class SchemePreCheckRequest(BaseModel):
    landHoldingAcres: float = Field(ge=0)
    ownsAadhaar: bool = True
    isTenantFarmer: bool = False
    district: str = "Kurnool"

class SchemeCaseCreateRequest(BaseModel):
    schemeId: str
    consentRecorded: bool = Field(..., description="Explicit farmer consent for assisted document collection")
    documentChecklist: List[dict] # [{"docName": "Pattadar Passbook", "isCollected": True}]
    notes: Optional[str] = None
