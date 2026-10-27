import secrets
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import HTTPException
from app.db.mongo import get_database
from app.services.booking_service import booking_service
from app.services.audit_service import record_audit_log

logger = logging.getLogger(__name__)

class IVRService:
    @staticmethod
    async def create_or_get_session(caller_phone: str) -> Dict[str, Any]:
        db = get_database()
        session_id = f"IVR-{secrets.token_hex(6).upper()}"
        now_iso = datetime.now(timezone.utc).isoformat()
        
        session_doc = {
            "sessionId": session_id,
            "callerPhone": caller_phone,
            "language": "te", # Default Telugu for Kurnool pilot
            "state": "LANG_SELECT",
            "bookingDraft": {},
            "bookingReference": None,
            "createdAt": now_iso,
            "updatedAt": now_iso
        }
        await db.ivr_sessions.insert_one(session_doc)
        return session_doc

    @staticmethod
    async def process_simulator_step(
        session_id: str,
        caller_phone: str,
        input_digit: Optional[str] = None,
        voice_text: Optional[str] = None,
        consent_sms: bool = False
    ) -> Dict[str, Any]:
        db = get_database()
        session = await db.ivr_sessions.find_one({"sessionId": session_id})
        if not session:
            session = await IVRService.create_or_get_session(caller_phone)

        state = session.get("state", "LANG_SELECT")
        draft = session.get("bookingDraft", {})
        language = session.get("language", "te")

        # State machine implementation
        if state == "LANG_SELECT":
            if input_digit == "1":
                language = "te"
            elif input_digit == "2":
                language = "en"
            
            # Move to main menu
            next_state = "MAIN_MENU"
            await db.ivr_sessions.update_one(
                {"sessionId": session_id},
                {"$set": {"language": language, "state": next_state, "updatedAt": datetime.now(timezone.utc).isoformat()}}
            )
            return {
                "sessionId": session_id,
                "state": next_state,
                "promptEn": "Welcome to Kurnool Smart Farmer Phone Service. Press 1 for Market Status. Press 2 to Book Market Slot. Press 3 for Godown Info. Press 4 for Scheme Guidance. Press 0 for Operator.",
                "promptTe": "కర్నూలు రైతు ఫోన్ సేవకు స్వాగతం. మార్కెట్ వివరాలకు 1 నొక్కండి. మార్కెట్ స్లాట్ బుక్ చేసుకోవడానికి 2 నొక్కండి. గోదాము వివరాలకు 3 నొక్కండి. ప్రభుత్వ పథకాలకు 4 నొక్కండి. సహాయం కొరకు 0 నొక్కండి.",
                "options": {
                    "1": "Market Status (మార్కెట్ స్థితి)",
                    "2": "Book Market Slot (స్లాట్ బుకింగ్)",
                    "3": "Godown Info (గోదాము వివరాలు)",
                    "4": "Scheme Guidance (పథకాల వివరాలు)",
                    "0": "Speak to Operator (ఆపరేటర్)"
                },
                "isCompleted": False
            }

        elif state == "MAIN_MENU":
            if input_digit == "0":
                # Operator transfer
                next_state = "OPERATOR_FORWARD"
                await db.ivr_sessions.update_one(
                    {"sessionId": session_id},
                    {"$set": {"state": next_state}}
                )
                return {
                    "sessionId": session_id,
                    "state": next_state,
                    "promptEn": "Connecting you to Kurnool District Farmer Helpdesk operator. Please stay on the line.",
                    "promptTe": "కర్నూలు జిల్లా రైతు సహాయ కేంద్రం ఆపరేటర్‌కు కలుపుతున్నాము. దయచేసి వేచి ఉండండి.",
                    "options": {},
                    "isCompleted": True,
                    "operatorTransfer": True
                }

            elif input_digit == "2":
                # Book slot -> Select Market
                markets = await db.markets.find({"isActive": True}).to_list(5)
                market_options = {}
                for idx, mkt in enumerate(markets, 1):
                    market_options[str(idx)] = f"{mkt.get('name')} ({mkt.get('nameTe')})"
                
                draft["markets_cache"] = [{ "id": str(m["_id"]), "name": m.get("name"), "commodities": m.get("commoditiesSupported", []) } for m in markets]

                next_state = "MARKET_SELECT"
                await db.ivr_sessions.update_one(
                    {"sessionId": session_id},
                    {"$set": {"state": next_state, "bookingDraft": draft}}
                )
                prompt_en = "Please select market: " + ", ".join([f"Press {k} for {v.split('(')[0].strip()}" for k, v in market_options.items()])
                prompt_te = "దయచేసి మార్కెట్ యార్డును ఎంచుకోండి: " + ", ".join([f"{k} నొక్కండి: {v}" for k, v in market_options.items()])
                return {
                    "sessionId": session_id,
                    "state": next_state,
                    "promptEn": prompt_en,
                    "promptTe": prompt_te,
                    "options": market_options,
                    "isCompleted": False
                }

            elif input_digit == "1":
                # Market Status summary
                return {
                    "sessionId": session_id,
                    "state": "MAIN_MENU",
                    "promptEn": "All 4 Kurnool market-yards (Kurnool AMC, Adoni, Nandyal, Yemmiganur) are active today. Daily average arrivals: 120 vehicles. Press 2 to book slot.",
                    "promptTe": "కర్నూలు, ఆదోని, నంద్యాల, ఎమ్మిగనూరు మార్కెట్ యార్డులు చురుకుగా పనిచేస్తున్నాయి. స్లాట్ బుకింగ్ కోసం 2 నొక్కండి.",
                    "options": {"2": "Book Market Slot", "*": "Main Menu"},
                    "isCompleted": False
                }
            elif input_digit == "3":
                return {
                    "sessionId": session_id,
                    "state": "MAIN_MENU",
                    "promptEn": "Kurnool Central Godown has 40,000 bags storage available. Rate is Rs 6.50 per bag/month with pledge finance eligible. Press * for Main Menu.",
                    "promptTe": "కర్నూలు సెంట్రల్ గోదాములో 40,000 బస్తాల నిల్వ అందుబాటులో ఉంది. నెలకు బస్తాకు రూ. 6.50. మెనూ కొరకు * నొక్కండి.",
                    "options": {"*": "Main Menu"},
                    "isCompleted": False
                }
            elif input_digit == "4":
                return {
                    "sessionId": session_id,
                    "state": "MAIN_MENU",
                    "promptEn": "Current schemes: YSR Rythu Bharosa, PM-KISAN, PMFBY Crop Insurance. Press 0 to talk with an operator for scheme assistance.",
                    "promptTe": "ప్రస్తుత పథకాలు: వైఎస్సార్ రైతు భరోసా, పిఎం-కిసాన్, పంటల బీమా. ఆపరేటర్‌తో మాట్లాడటానికి 0 నొక్కండి.",
                    "options": {"0": "Speak to Operator", "*": "Main Menu"},
                    "isCompleted": False
                }
            else:
                return {
                    "sessionId": session_id,
                    "state": "MAIN_MENU",
                    "promptEn": "Invalid choice. Press 1 for Market Status, 2 to Book Slot, 0 for Operator.",
                    "promptTe": "తప్పు సంఖ్య. మార్కెట్ స్థితికి 1, బుకింగ్‌కు 2, ఆపరేటర్ కోసం 0 నొక్కండి.",
                    "options": {"1": "Status", "2": "Book", "0": "Operator"},
                    "isCompleted": False
                }

        elif state == "MARKET_SELECT":
            markets = draft.get("markets_cache", [])
            idx = int(input_digit or "1") - 1
            if 0 <= idx < len(markets):
                selected_market = markets[idx]
                draft["marketId"] = selected_market["id"]
                draft["marketName"] = selected_market["name"]
                draft["commodities"] = selected_market.get("commodities", ["Paddy", "Cotton", "Groundnut"])

                comm_options = {str(i+1): c for i, c in enumerate(draft["commodities"][:4])}

                next_state = "COMMODITY_SELECT"
                await db.ivr_sessions.update_one(
                    {"sessionId": session_id},
                    {"$set": {"state": next_state, "bookingDraft": draft}}
                )
                return {
                    "sessionId": session_id,
                    "state": next_state,
                    "promptEn": f"Selected {selected_market['name']}. Now choose commodity: " + ", ".join([f"Press {k} for {v}" for k, v in comm_options.items()]),
                    "promptTe": f"{selected_market['name']} ఎంచుకున్నారు. పంటను ఎంచుకోండి: " + ", ".join([f"{k} నొక్కండి: {v}" for k, v in comm_options.items()]),
                    "options": comm_options,
                    "isCompleted": False
                }
            else:
                return {
                    "sessionId": session_id,
                    "state": "MARKET_SELECT",
                    "promptEn": "Invalid market selection. Please choose a valid number.",
                    "promptTe": "సరైన మార్కెట్ సంఖ్యను ఎంచుకోండి.",
                    "options": {},
                    "isCompleted": False
                }

        elif state == "COMMODITY_SELECT":
            commodities = draft.get("commodities", ["Paddy", "Cotton", "Groundnut"])
            c_idx = int(input_digit or "1") - 1
            if 0 <= c_idx < len(commodities):
                draft["commodity"] = commodities[c_idx]
                
                # Slot times
                slot_options = {
                    "1": "07:00 - 09:00 AM",
                    "2": "09:00 - 11:00 AM",
                    "3": "11:00 - 01:00 PM",
                    "4": "02:00 - 04:00 PM"
                }
                draft["date"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")

                next_state = "SLOT_SELECT"
                await db.ivr_sessions.update_one(
                    {"sessionId": session_id},
                    {"$set": {"state": next_state, "bookingDraft": draft}}
                )
                return {
                    "sessionId": session_id,
                    "state": next_state,
                    "promptEn": f"Selected {draft['commodity']}. Today is {draft['date']}. Select arrival slot: Press 1 for 7am, 2 for 9am, 3 for 11am, 4 for 2pm.",
                    "promptTe": f"{draft['commodity']} ఎంపికైంది. సమయం ఎంచుకోండి: 1 ఉదయం 7-9, 2 ఉదయం 9-11, 3 ఉదయం 11-1, 4 మధ్యాహ్నం 2-4.",
                    "options": slot_options,
                    "isCompleted": False
                }
            else:
                return {
                    "sessionId": session_id,
                    "state": "COMMODITY_SELECT",
                    "promptEn": "Invalid commodity. Please choose again.",
                    "promptTe": "సరైన పంటను ఎంచుకోండి.",
                    "options": {},
                    "isCompleted": False
                }

        elif state == "SLOT_SELECT":
            slots_map = {
                "1": "07:00-09:00",
                "2": "09:00-11:00",
                "3": "11:00-13:00",
                "4": "14:00-16:00"
            }
            draft["slotTime"] = slots_map.get(input_digit, "09:00-11:00")
            draft["vehicleType"] = "Tractor"
            draft["quantity"] = 15.0

            next_state = "CONFIRMATION"
            await db.ivr_sessions.update_one(
                {"sessionId": session_id},
                {"$set": {"state": next_state, "bookingDraft": draft}}
            )

            prompt_en = f"You are booking for {draft['marketName']}, crop {draft['commodity']}, on {draft['date']} at slot {draft['slotTime']}. Press 1 to confirm and book. Press 9 to cancel."
            prompt_te = f"మీరు {draft['marketName']} లో {draft['commodity']} కొరకు, తేదీ {draft['date']}, సమయం {draft['slotTime']} కి బుక్ చేస్తున్నారు. ధ్రువీకరించడానికి 1 నొక్కండి. రద్దుకు 9 నొక్కండి."
            return {
                "sessionId": session_id,
                "state": next_state,
                "promptEn": prompt_en,
                "promptTe": prompt_te,
                "options": {"1": "Confirm Booking (ధ్రువీకరించండి)", "9": "Cancel (రద్దు చేయండి)"},
                "isCompleted": False
            }

        elif state == "CONFIRMATION":
            if input_digit == "1":
                # CRITICAL: Call the EXACT same booking_service as the Web frontend!
                try:
                    booking = await booking_service.create_booking(
                        farmer_id=f"IVR_{caller_phone}",
                        farmer_phone=caller_phone,
                        farmer_name="Phone Farmer",
                        market_id=draft["marketId"],
                        date=draft["date"],
                        slot_time=draft["slotTime"],
                        commodity=draft["commodity"],
                        vehicle_type=draft.get("vehicleType", "Tractor"),
                        estimated_quantity_quintals=draft.get("quantity", 15.0),
                        idempotency_key=f"IVR_{session_id}",
                        channel="IVR"
                    )
                    token = booking["bookingReference"]
                    # Format token for voice reading e.g. K N L M K T 7 F 4 2 Q
                    spelled_token = " ".join(list(token.replace("-", " ")))

                    await db.ivr_sessions.update_one(
                        {"sessionId": session_id},
                        {"$set": {"state": "COMPLETED", "bookingReference": token, "updatedAt": datetime.now(timezone.utc).isoformat()}}
                    )

                    # Read aloud twice as required by prompt!
                    prompt_en = f"Booking successful! Your token is {token}. Repeating: {spelled_token}. Again: {token}. Please show or say this token at the market entrance."
                    prompt_te = f"బుకింగ్ విజయవంతమైంది! మీ టోకెన్: {token}. మళ్ళీ వినండి: {spelled_token}. మార్కెట్ గేటు వద్ద ఈ టోకెన్ చెప్పండి."

                    return {
                        "sessionId": session_id,
                        "state": "COMPLETED",
                        "promptEn": prompt_en,
                        "promptTe": prompt_te,
                        "bookingReference": token,
                        "options": {},
                        "isCompleted": True
                    }
                except HTTPException as e:
                    return {
                        "sessionId": session_id,
                        "state": "MAIN_MENU",
                        "promptEn": f"Booking could not be completed: {e.detail}. Please try another slot.",
                        "promptTe": f"స్లాట్ లభ్యం కాలేదు: {e.detail}. వేరే సమయం ప్రయత్నించండి.",
                        "options": {"*": "Main Menu"},
                        "isCompleted": False,
                        "error": str(e.detail)
                    }
            else:
                await db.ivr_sessions.update_one(
                    {"sessionId": session_id},
                    {"$set": {"state": "CANCELLED"}}
                )
                return {
                    "sessionId": session_id,
                    "state": "CANCELLED",
                    "promptEn": "Booking cancelled. Thank you for calling.",
                    "promptTe": "బుకింగ్ రద్దు చేయబడింది. ధన్యవాదాలు.",
                    "options": {},
                    "isCompleted": True
                }

        # Fallback
        return {
            "sessionId": session_id,
            "state": "MAIN_MENU",
            "promptEn": "Please choose an option.",
            "promptTe": "దయచేసి ఒక ఎంపికను ఎంచుకోండి.",
            "options": {"1": "Status", "2": "Book Slot"},
            "isCompleted": False
        }

ivr_service = IVRService()
