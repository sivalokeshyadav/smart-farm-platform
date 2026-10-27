from typing import Optional, List
from pydantic import BaseModel, Field

class SellerLicense(BaseModel):
    licenseType: str  # e.g., "FERTILIZER_DEALER", "INSECTICIDE_LICENSE", "SEED_DEALER"
    licenseNumber: str
    issuingAuthority: str
    validUntil: str
    isVerified: bool = False

class SellerOnboardRequest(BaseModel):
    businessName: str
    businessNameTe: str
    registrationNumber: str
    contactPhone: str
    address: str
    licenses: List[SellerLicense] = []

class ProductCreateRequest(BaseModel):
    category: str = Field(..., description="SEEDS, FERTILIZERS, TOOLS, PESTICIDES")
    name: str
    nameTe: str
    brand: str
    price: float = Field(gt=0)
    unit: str # "Kg", "Bags", "Litre", "Piece"
    stockQuantity: int = Field(ge=0)
    requiresLicense: bool = False
    licenseTypeRequired: Optional[str] = None
    description: str

class OrderItem(BaseModel):
    productId: str
    quantity: int = Field(gt=0)

class OrderCreateRequest(BaseModel):
    sellerId: str
    items: List[OrderItem]
    deliveryAddress: str
    paymentMethod: str = "SANDBOX_UPI" # SANDBOX_UPI, CASH_ON_DELIVERY

class OrderResponse(BaseModel):
    id: str
    orderReference: str
    farmerId: str
    sellerId: str
    sellerName: str
    items: List[dict]
    totalAmount: float
    paymentStatus: str
    fulfillmentStatus: str
    deliveryAddress: str
    paymentTxnId: Optional[str] = None
    createdAt: str
