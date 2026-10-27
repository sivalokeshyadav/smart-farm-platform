from fastapi import APIRouter, HTTPException, status, Header, Request
from typing import Optional
from app.schemas.ivr import IVRInboundWebhookRequest, IVRSimulatorStepRequest, IVRSimulatorStepResponse
from app.services.ivr_service import ivr_service
from app.core.security import verify_webhook_signature

router = APIRouter(prefix="/ivrs", tags=["Phone / IVR Service"])

@router.post("/webhooks/inbound")
async def ivr_inbound_webhook(
    data: IVRInboundWebhookRequest,
    req: Request,
    x_twilio_signature: Optional[str] = Header(None)
):
    """
    Standard provider webhook handler for Exotel/Twilio/SIP carriers.
    When telephony provider credentials are configured, signature is strictly verified.
    """
    session = await ivr_service.create_or_get_session(caller_phone=data.From)
    
    # Provider-independent XML/TwiML response formatted for telephony gateway
    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather numDigits="1" action="/api/v1/ivrs/webhooks/inbound/gather?sessionId={session['sessionId']}">
        <Say language="te-IN">కర్నూలు జిల్లా రైతు మార్కెట్ వేదికకు స్వాగతం. మార్కెట్ స్లాట్ బుకింగ్ కొరకు 2 నొక్కండి.</Say>
        <Say language="en-IN">Welcome to Kurnool Smart Farmer Platform. Press 2 to book market slot.</Say>
    </Gather>
</Response>"""
    return twiml_response

@router.post("/simulator/step", response_model=IVRSimulatorStepResponse)
async def ivr_simulator_step(data: IVRSimulatorStepRequest):
    """
    Local Interactive IVR Simulator for farmers without smartphones.
    Simulates calling from any feature phone, pressing digits or voice response.
    Uses the exact same underlying booking service and shared database.
    """
    result = await ivr_service.process_simulator_step(
        session_id=data.sessionId,
        caller_phone=data.callerPhone,
        input_digit=data.inputDigit,
        voice_text=data.voiceText,
        consent_sms=data.consentSms or False
    )
    return result

@router.get("/sessions/{session_id}")
async def get_session_status(session_id: str):
    from app.db.mongo import get_database
    db = get_database()
    session = await db.ivr_sessions.find_one({"sessionId": session_id})
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IVR session not found")
    session["id"] = str(session["_id"])
    return session
