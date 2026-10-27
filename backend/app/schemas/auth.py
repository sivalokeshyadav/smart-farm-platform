from typing import Optional, List
from pydantic import BaseModel, Field

ALL_ROLES = [
    "FARMER",
    "CROP_BUYER",
    "CROP_SELLER",
    "LIVESTOCK_BUYER",
    "LIVESTOCK_SELLER",
    "EQUIPMENT_BUYER",
    "EQUIPMENT_SELLER",
    "VETERINARIAN",
    "MARKET_STAFF",
    "GODOWN_OPERATOR",
    "DELIVERY_WORKER",
    "HELP_DESK_OPERATOR",
    "ADMIN",
]

PRIVILEGED_ROLES = {
    "VETERINARIAN",
    "MARKET_STAFF",
    "GODOWN_OPERATOR",
    "HELP_DESK_OPERATOR",
    "ADMIN",
}

class RequestOtpSchema(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15, description="10-digit mobile number")

class VerifyOtpSchema(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=4, max_length=6)
    name: Optional[str] = Field(default=None)
    role: Optional[str] = Field(default="FARMER")

class RegisterUserSchema(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    name: str = Field(..., min_length=2, max_length=100)
    email: Optional[str] = Field(default=None)
    password: str = Field(..., min_length=6)
    state: str = Field(default="Andhra Pradesh")
    district: str = Field(default="Kurnool")
    mandal: Optional[str] = Field(default="Kurnool Rural")
    village: Optional[str] = Field(default="Nandyal Road")
    preferredLanguage: str = Field(default="te")
    requestedRoles: List[str] = Field(default=["FARMER"])

class LoginWithPasswordSchema(BaseModel):
    phone: str
    password: str

class SwitchRoleSchema(BaseModel):
    role: str

class RoleApprovalSchema(BaseModel):
    userId: str
    role: str
    approved: bool
    rejectionReason: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: str
    phone: str
    name: str
    role: str
    roles: List[str] = []
    pendingRoles: List[str] = []
    state: Optional[str] = None
    district: Optional[str] = None
    preferredLanguage: str = "te"
    isActive: bool = True
