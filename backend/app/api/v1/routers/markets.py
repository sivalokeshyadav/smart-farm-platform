from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends, Query
from bson import ObjectId
from app.db.mongo import get_database, serialize_mongo_docs, serialize_mongo_doc
from app.schemas.market_booking import MarketCreate, MarketSlotCreate
from app.api.deps import require_admin, get_optional_user
from app.core.all_india_locations import ALL_INDIA_LOCATIONS, ALL_INDIA_MARKETS

router = APIRouter(prefix="/markets", tags=["Markets & Slots"])

@router.get("/locations")
async def get_market_locations():
    db = get_database()
    markets = await db.markets.find({"isActive": True}, {"state": 1, "district": 1}).to_list(1000)
    locations: dict[str, set[str]] = {st: set(dist_list) for st, dist_list in ALL_INDIA_LOCATIONS.items()}
    for m in markets:
        st = m.get("state") or "Andhra Pradesh"
        dist = m.get("district")
        if st not in locations:
            locations[st] = set()
        if dist:
            locations[st].add(dist)
    return {st: sorted(list(dist_set)) for st, dist_set in sorted(locations.items())}

@router.get("/")
@router.get("")
async def list_markets(
    state: Optional[str] = None,
    district: Optional[str] = None,
    commodity: Optional[str] = None,
    search: Optional[str] = None,
):
    db = get_database()
    query = {"isActive": True}
    if state and state.upper() != "ALL":
        query["state"] = state
    if district and district.upper() != "ALL":
        query["district"] = district
    if commodity and commodity.upper() != "ALL":
        query["commoditiesSupported"] = commodity
    if search and search.strip():
        term = search.strip()
        query["$or"] = [
            {"name": {"$regex": term, "$options": "i"}},
            {"nameTe": {"$regex": term, "$options": "i"}},
            {"nameHi": {"$regex": term, "$options": "i"}},
            {"district": {"$regex": term, "$options": "i"}},
            {"state": {"$regex": term, "$options": "i"}},
            {"location": {"$regex": term, "$options": "i"}},
        ]

    markets = await db.markets.find(query).to_list(500)
    
    # If DB has no documents for this state yet, fallback to ALL_INDIA_MARKETS and ensure inserted in MongoDB
    if not markets and state and state.upper() != "ALL":
        fallback = []
        for m in ALL_INDIA_MARKETS:
            if m["state"].lower() == state.lower():
                if district and district.upper() != "ALL" and m["district"].lower() != district.lower():
                    continue
                if commodity and commodity.upper() != "ALL" and commodity not in m.get("commoditiesSupported", []):
                    continue
                existing_db = await db.markets.find_one({"name": m["name"]})
                if not existing_db:
                    ins = await db.markets.insert_one(dict(m))
                    m_copy = dict(m)
                    m_copy["id"] = str(ins.inserted_id)
                    fallback.append(m_copy)
                else:
                    fallback.append(serialize_mongo_doc(existing_db))
        if fallback:
            return fallback

    return serialize_mongo_docs(markets)

@router.get("/{market_id}")
async def get_market(market_id: str):
    db = get_database()
    try:
        market = await db.markets.find_one({"_id": ObjectId(market_id)})
    except Exception:
        market = await db.markets.find_one({"_id": market_id})

    if not market:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Market not found")
    return serialize_mongo_doc(market)

@router.get("/{market_id}/availability")
async def get_market_availability(
    market_id: str,
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    commodity: Optional[str] = None
):
    db = get_database()
    query = {"marketId": market_id, "date": date, "isActive": True}
    if commodity:
        query["commodity"] = commodity

    slots = await db.market_slots.find(query).to_list(100)
    
    # If no slots in database yet, dynamically provide available slots based on market definition
    if not slots:
        standard_times = ["07:00-09:00", "09:00-11:00", "11:00-13:00", "14:00-16:00"]
        default_commodities = [commodity] if commodity else ["Cotton", "Paddy", "Groundnut", "Chili"]
        slots = []
        for t in standard_times:
            for c in default_commodities:
                slots.append({
                    "id": f"dyn_{t}_{c}",
                    "marketId": market_id,
                    "date": date,
                    "slotTime": t,
                    "commodity": c,
                    "totalCapacityVehicles": 25,
                    "bookedVehicles": 0,
                    "availableVehicles": 25,
                    "isFull": False
                })
        return slots

    formatted = []
    for s in slots:
        tot = s.get("totalCapacityVehicles", 25)
        bk = s.get("bookedVehicles", 0)
        formatted.append({
            "id": str(s["_id"]),
            "marketId": s["marketId"],
            "date": s["date"],
            "slotTime": s["slotTime"],
            "commodity": s["commodity"],
            "totalCapacityVehicles": tot,
            "bookedVehicles": bk,
            "availableVehicles": max(0, tot - bk),
            "isFull": bk >= tot
        })
    return formatted

@router.post("/", dependencies=[Depends(require_admin)])
async def create_market(data: MarketCreate):
    db = get_database()
    doc = data.model_dump()
    res = await db.markets.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    return doc
