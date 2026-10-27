from datetime import datetime, timezone
from fastapi import APIRouter, Query
from typing import Optional
from app.services.mandi_price_service import mandi_price_service

router = APIRouter(prefix="/info", tags=["Weather & Mandi Prices"])

@router.get("/weather")
async def get_kurnool_weather(mandal: Optional[str] = "Kurnool"):
    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "district": "Kurnool",
        "state": "Andhra Pradesh",
        "mandal": mandal or "Kurnool",
        "source": "IMD (India Meteorological Department) Adapter / Open-Meteo Sandbox",
        "isSimulatedPilotFeed": True,
        "lastUpdated": now_iso,
        "current": {
            "temperatureC": 31.5,
            "condition": "Partly Cloudy",
            "conditionTe": "పాక్షికంగా మేఘావృతం",
            "humidityPercent": 62,
            "windSpeedKmh": 14,
            "rainfallMm": 0.0
        },
        "forecast": [
            {"day": "Today", "dayTe": "ఈ రోజు", "tempMax": 33, "tempMin": 24, "rainChance": "10%"},
            {"day": "Tomorrow", "dayTe": "రేపు", "tempMax": 34, "tempMin": 23, "rainChance": "20%"},
            {"day": "Day 3", "dayTe": "ఎల్లుండి", "tempMax": 32, "tempMin": 24, "rainChance": "60% (Scattered showers)"}
        ],
        "advisory": "Favorable conditions for cotton boll development and paddy tiller growth. Maintain canal irrigation schedule."
    }

@router.get("/market-prices")
async def get_mandi_prices(
    state: Optional[str] = None,
    district: Optional[str] = None,
    commodity: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    force_live_sync: bool = False
):
    """
    Returns updated market prices everyday for every crop using data.gov.in
    Resource: 9ef84268-d588-465a-a308-a864a43d0070 (Agmarknet Live APMC Prices)
    """
    return await mandi_price_service.get_daily_market_prices(
        state=state,
        district=district,
        commodity=commodity,
        category=category,
        search=search,
        force_live_sync=force_live_sync
    )

@router.get("/market-prices/filters")
async def get_mandi_price_filters():
    """Returns available states, districts, and crop category filters for data.gov.in mandi prices."""
    return mandi_price_service.get_filter_options()

@router.post("/market-prices/sync")
async def trigger_mandi_prices_sync(
    state: Optional[str] = None,
    district: Optional[str] = None,
    commodity: Optional[str] = None
):
    """Triggers an on-demand sync from data.gov.in Agmarknet API endpoint."""
    return await mandi_price_service.get_daily_market_prices(
        state=state,
        district=district,
        commodity=commodity,
        force_live_sync=True
    )
