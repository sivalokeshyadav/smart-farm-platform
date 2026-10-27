from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class IVRInboundWebhookRequest(BaseModel):
    CallSid: str = Field(..., description="Unique Call Session ID from telephony provider")
    From: str = Field(..., description="Caller Phone Number")
    To: Optional[str] = None
    CallStatus: Optional[str] = "ringing"
    Digits: Optional[str] = None

class IVRSimulatorStepRequest(BaseModel):
    sessionId: str
    callerPhone: str
    inputDigit: Optional[str] = None
    voiceText: Optional[str] = None
    consentSms: Optional[bool] = False

class IVRMenuPrompt(BaseModel):
    state: str
    promptEn: str
    promptTe: str
    audioKey: Optional[str] = None
    expectedInputType: str # "DTMF", "VOICE", "NONE"
    validDigits: list[str]

class IVRSimulatorStepResponse(BaseModel):
    sessionId: str
    state: str
    promptEn: str
    promptTe: str
    bookingReference: Optional[str] = None
    options: Dict[str, str]
    isCompleted: bool = False
    operatorTransfer: bool = False
    error: Optional[str] = None
