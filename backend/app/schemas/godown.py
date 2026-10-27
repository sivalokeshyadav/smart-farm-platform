from typing import Optional, List
from pydantic import BaseModel, Field

class GodownBase(BaseModel):
    name: str
    nameTe: str
    district: str = "Kurnool"
    mandal: str
    address: str
    totalCapacityBags: int = 50000
    availableCapacityBags: int = 40000
    eligibleCommodities: List[str]
    unitPricePerMonthPerBag: float = 6.50
    operatingHours: str = "08:00 - 18:00"
    contactPhone: str
    isVerified: bool = True

class GodownReservationRequest(BaseModel):
    godownId: str
    commodity: str
    bagsCount: int = Field(gt=0)
    durationMonths: int = Field(ge=1, le=12)
    startDate: str  # YYYY-MM-DD
    idempotencyKey: Optional[str] = None
    inwardSlot: Optional[str] = None
    vehicleType: Optional[str] = None
    estimatedWeightQuintals: Optional[float] = None

class GodownReservationResponse(BaseModel):
    id: str
    reservationReference: str
    farmerId: str
    farmerName: str
    godownId: str
    godownName: str
    commodity: str
    bagsCount: int
    durationMonths: int
    startDate: str
    totalEstimatedCost: float
    status: str
    createdAt: str
