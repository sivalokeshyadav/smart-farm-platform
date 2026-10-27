from typing import Optional, List
from pydantic import BaseModel, Field

class MarketBase(BaseModel):
    name: str
    nameTe: str
    district: str = "Kurnool"
    mandal: str
    location: str
    operatingHours: str = "06:00 - 18:00"
    commoditiesSupported: List[str]
    maxDailyVehicles: int = 150
    isActive: bool = True

class MarketCreate(MarketBase):
    pass

class MarketSlotCreate(BaseModel):
    marketId: str
    date: str  # YYYY-MM-DD
    slotTime: str # e.g. "07:00-09:00"
    commodity: str
    totalCapacityVehicles: int = 20

class BookingCreateRequest(BaseModel):
    marketId: str
    date: str  # YYYY-MM-DD
    slotTime: str
    commodity: str
    vehicleType: str = Field(default="Tractor", description="Tractor, Mini Truck, Bullock Cart, Auto")
    estimatedQuantityQuintals: float = Field(gt=0, description="Estimated quantity in quintals")
    idempotencyKey: Optional[str] = None
    channel: str = Field(default="WEB", description="WEB, IVR, FIELD_AGENT")
    farmerName: Optional[str] = None
    farmerPhone: Optional[str] = None

class BookingCheckInRequest(BaseModel):
    verificationNotes: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    bookingReference: str
    farmerId: str
    farmerPhone: str
    farmerName: str
    marketId: str
    marketName: str
    date: str
    slotTime: str
    commodity: str
    vehicleType: str
    estimatedQuantityQuintals: float
    status: str
    channel: str
    bookedAt: str
    checkedInAt: Optional[str] = None
