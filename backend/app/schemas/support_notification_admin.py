from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class SupportCaseCreateRequest(BaseModel):
    category: str # "BOOKING_ISSUE", "SCHEME_HELP", "MARKETPLACE", "IVR_HELP", "GENERAL"
    subject: str
    description: str
    priority: str = "MEDIUM" # "LOW", "MEDIUM", "HIGH"

class SupportCaseResponse(BaseModel):
    id: str
    caseNumber: str
    farmerId: str
    farmerPhone: str
    category: str
    subject: str
    description: str
    priority: str
    status: str # "OPEN", "IN_PROGRESS", "RESOLVED"
    assignedAgentId: Optional[str] = None
    resolutionNotes: Optional[str] = None
    createdAt: str

class NotificationItem(BaseModel):
    id: str
    recipientPhone: str
    channel: str
    message: str
    messageTe: Optional[str] = None
    status: str
    attempts: int
    createdAt: str

class AdminSummaryKPIs(BaseModel):
    totalBookingsToday: int
    checkedInBookingsToday: int
    slotUtilizationPercent: float
    totalGodownReservations: int
    marketplaceOrdersCount: int
    pendingSellerApprovals: int
    openSupportCases: int
    notificationOutboxPending: int
    pilotDistrict: str = "Kurnool"

class AuditLogItem(BaseModel):
    id: str
    timestamp: str
    userId: Optional[str] = None
    userRole: Optional[str] = None
    action: str
    resource: str
    resourceId: Optional[str] = None
    details: Dict[str, Any]
    ipAddress: Optional[str] = None
