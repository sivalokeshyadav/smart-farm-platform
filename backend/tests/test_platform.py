import os
import sys
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.db.mongo import connect_to_mongo, close_mongo_connection, get_database
from app.core.security import generate_reference_token, verify_webhook_signature, verify_replay_protection
from app.services.calculator_service import calculator_service
from app.services.booking_service import booking_service
from app.services.ivr_service import ivr_service

@pytest_asyncio.fixture(scope="function", autouse=True)
async def init_test_db():
    await connect_to_mongo()
    yield
    await close_mongo_connection()

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "HEALTHY"
        assert data["district"] == "Kurnool"

@pytest.mark.asyncio
async def test_token_generation_security():
    # Cryptographic random token test
    token1 = generate_reference_token("KNL-MKT", 5)
    token2 = generate_reference_token("KNL-MKT", 5)
    assert token1.startswith("KNL-MKT-")
    assert token2.startswith("KNL-MKT-")
    assert token1 != token2
    # Ensure safe alphabet (no 0, O, 1, I)
    clean_part = token1.replace("KNL-MKT-", "")
    for ch in clean_part:
        assert ch not in ["0", "O", "1", "I"]

@pytest.mark.asyncio
async def test_webhook_signature_and_replay():
    payload = '{"CallSid": "CA12345", "Digits": "1"}'
    secret = "test-webhook-secret"
    import hmac, hashlib
    sig = hmac.new(secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    
    assert verify_webhook_signature(payload, sig, secret) is True
    assert verify_webhook_signature(payload, "invalid_sig", secret) is False

    now_ts = int(datetime.now(timezone.utc).timestamp())
    assert verify_replay_protection(now_ts) is True
    assert verify_replay_protection(now_ts - 500) is False

@pytest.mark.asyncio
async def test_calculator_formulas():
    # 1. Land conversion
    res = calculator_service.convert_land(1.0, "acres")
    assert res["conversions"]["cents"] == 100.0
    assert res["conversions"]["guntas"] == 40.0
    assert abs(res["conversions"]["sq_feet"] - 43560.0) < 1.0

    # 2. Seed & fertilizer
    sf = calculator_service.calculate_seed_fertilizer("Paddy", 2.0, "Traditional")
    assert sf["metrics"]["recommendedSeedKg"] == 50.0

    # 3. Yield & Margin (avoid division by zero)
    ym = calculator_service.calculate_yield_margin(
        crop="Cotton",
        acres=2.0,
        expected_yield_per_acre_quintals=10.0,
        expected_price_per_quintal=7000.0,
        seed_cost_per_acre=1500.0,
        fertilizer_pesticide_cost_per_acre=6000.0,
        labor_machinery_cost_per_acre=12000.0,
        irrigation_cost_per_acre=2500.0
    )
    assert ym["metrics"]["totalEstimatedYieldQuintals"] == 20.0
    assert ym["metrics"]["grossRevenueRs"] == 140000.0
    assert ym["metrics"]["netProfitOrLossRs"] > 0

@pytest.mark.asyncio
async def test_atomic_booking_and_idempotency():
    db = get_database()
    market = await db.markets.find_one({"isActive": True})
    assert market is not None
    m_id = str(market["_id"])

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    idem_key = f"IDEM-TEST-{datetime.now().timestamp()}"

    # Initial booking
    booking1 = await booking_service.create_booking(
        farmer_id="TEST_FARMER_1",
        farmer_phone="9876543210",
        farmer_name="Test Farmer",
        market_id=m_id,
        date=today,
        slot_time="09:00-11:00",
        commodity="Cotton",
        idempotency_key=idem_key
    )
    assert booking1["bookingReference"].startswith("KNL-MKT-")

    # Retry with SAME idempotency key must NOT duplicate booking
    booking2 = await booking_service.create_booking(
        farmer_id="TEST_FARMER_1",
        farmer_phone="9876543210",
        farmer_name="Test Farmer",
        market_id=m_id,
        date=today,
        slot_time="09:00-11:00",
        commodity="Cotton",
        idempotency_key=idem_key
    )
    assert booking1["bookingReference"] == booking2["bookingReference"]

@pytest.mark.asyncio
async def test_ivr_simulator_shared_booking_service():
    # IVR flow testing
    session = await ivr_service.create_or_get_session("9876543299")
    sid = session["sessionId"]

    # Step 1: Lang select (1 for Telugu)
    s1 = await ivr_service.process_simulator_step(sid, "9876543299", input_digit="1")
    assert s1["state"] == "MAIN_MENU"

    # Step 2: Book slot (press 2)
    s2 = await ivr_service.process_simulator_step(sid, "9876543299", input_digit="2")
    assert s2["state"] == "MARKET_SELECT"

    # Step 3: Choose market 1
    s3 = await ivr_service.process_simulator_step(sid, "9876543299", input_digit="1")
    assert s3["state"] == "COMMODITY_SELECT"

    # Step 4: Choose commodity 1
    s4 = await ivr_service.process_simulator_step(sid, "9876543299", input_digit="1")
    assert s4["state"] == "SLOT_SELECT"

    # Step 5: Choose slot 1
    s5 = await ivr_service.process_simulator_step(sid, "9876543299", input_digit="1")
    assert s5["state"] == "CONFIRMATION"

    # Step 6: Confirm (press 1) -> Generates booking token via shared booking service
    s6 = await ivr_service.process_simulator_step(sid, "9876543299", input_digit="1")
    assert s6["isCompleted"] is True
    assert s6["bookingReference"] is not None
    assert s6["bookingReference"].startswith("KNL-MKT-")

@pytest.mark.asyncio
async def test_registration_roles_and_privilege_gate():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        unique_phone = f"998877{datetime.now().microsecond:04d}"[:10]
        reg_payload = {
            "phone": unique_phone,
            "name": "Dr. Test Applicant",
            "password": "securePassword123",
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "preferredLanguage": "te",
            "requestedRoles": ["FARMER", "VETERINARIAN"]
        }
        res = await ac.post("/api/v1/auth/register", json=reg_payload)
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        user = data["user"]
        assert "FARMER" in user["roles"]
        assert "VETERINARIAN" in user["pendingRoles"]

@pytest.mark.asyncio
async def test_state_and_district_scheme_filtering():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Filter by Andhra Pradesh
        res_ap = await ac.get("/api/v1/schemes?state=Andhra Pradesh")
        assert res_ap.status_code == 200
        schemes_ap = res_ap.json()
        assert len(schemes_ap) >= 1

        # Filter by Category LIVESTOCK
        res_livestock = await ac.get("/api/v1/schemes?category=LIVESTOCK")
        assert res_livestock.status_code == 200
        schemes_ls = res_livestock.json()
        assert any(s.get("category") == "LIVESTOCK" for s in schemes_ls)

@pytest.mark.asyncio
async def test_common_status_transition_state_machine():
    from app.services.status_service import record_status_transition
    db = get_database()
    ref_code = f"KNL-STAT-{datetime.now().timestamp()}"
    test_booking = {
        "bookingReference": ref_code,
        "status": "BOOKED",
        "farmerId": "test_farmer_1",
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    ins = await db.bookings.insert_one(test_booking)
    doc_id = str(ins.inserted_id)

    try:
        # Valid transition: BOOKED -> ENTERED
        updated = await record_status_transition(
            collection_name="bookings",
            record_id=doc_id,
            module="MARKET_BOOKING",
            new_status="ENTERED",
            actor_id="staff_1",
            actor_role="MARKET_STAFF",
            actor_name="Gate Staff Srinivasulu"
        )
        assert updated["status"] == "ENTERED"
        assert len(updated.get("statusHistory", [])) == 1

        # Invalid transition: ENTERED -> CANCELLED should raise ValueError
        with pytest.raises(ValueError) as exc_info:
            await record_status_transition(
                collection_name="bookings",
                record_id=doc_id,
                module="MARKET_BOOKING",
                new_status="CANCELLED",
                actor_id="staff_1",
                actor_role="MARKET_STAFF",
                actor_name="Gate Staff Srinivasulu"
            )
        assert "Invalid status transition" in str(exc_info.value)
    finally:
        await db.bookings.delete_one({"_id": ins.inserted_id})

@pytest.mark.asyncio
async def test_feedback_rating_and_duplicate_prevention():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Login as pilot farmer
        login_res = await ac.post("/api/v1/auth/login", json={"phone": "9876543210", "password": "farm1234"})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        tx_id = f"TX-TEST-{datetime.now().microsecond}"
        fb_payload = {
            "module": "MARKET_BOOKING",
            "transactionId": tx_id,
            "targetName": "Kurnool Main Yard",
            "rating": 5,
            "reviewText": "Very transparent weighment.",
            "tags": ["HONEST_WEIGHING", "ON_TIME"]
        }
        res1 = await ac.post("/api/v1/feedbacks", json=fb_payload, headers=headers)
        assert res1.status_code == 200

        # Duplicate submission with same transactionId must be rejected
        res2 = await ac.post("/api/v1/feedbacks", json=fb_payload, headers=headers)
        assert res2.status_code == 400
        assert "already submitted a rating" in res2.json()["detail"]

@pytest.mark.asyncio
async def test_all_india_markets_cascading_and_search():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Test GET /markets/locations returns multi-state hierarchy
        loc_res = await ac.get("/api/v1/markets/locations")
        assert loc_res.status_code == 200
        locations = loc_res.json()
        assert isinstance(locations, dict)
        assert len(locations.keys()) >= 5  # At least 5 Indian states present
        assert "Maharashtra" in locations or "Andhra Pradesh" in locations

        # 2. Test GET /markets returns all-India list
        all_res = await ac.get("/api/v1/markets")
        assert all_res.status_code == 200
        all_markets = all_res.json()
        assert len(all_markets) >= 10

        # 3. Test State filter
        st_res = await ac.get("/api/v1/markets?state=Maharashtra")
        assert st_res.status_code == 200
        mh_markets = st_res.json()
        assert all(m["state"] == "Maharashtra" for m in mh_markets)

        # 4. Test Search filter
        search_res = await ac.get("/api/v1/markets?search=Azadpur")
        assert search_res.status_code == 200
        az_markets = search_res.json()
        assert len(az_markets) >= 1
        assert "Azadpur" in az_markets[0]["name"]

@pytest.mark.asyncio
async def test_data_gov_in_mandi_prices():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Test GET /info/market-prices
        res = await ac.get("/api/v1/info/market-prices")
        assert res.status_code == 200
        data = res.json()
        assert "commodities" in data
        assert "source" in data
        assert "data.gov.in" in data["source"]
        assert len(data["commodities"]) >= 20

        # 2. Test GET /info/market-prices/filters
        filters_res = await ac.get("/api/v1/info/market-prices/filters")
        assert filters_res.status_code == 200
        filters = filters_res.json()
        assert "states" in filters
        assert "categories" in filters
        assert "Andhra Pradesh" in filters["states"]

        # 3. Test filter by category
        cat_res = await ac.get("/api/v1/info/market-prices?category=Cash Crops")
        assert cat_res.status_code == 200
        cat_data = cat_res.json()
        for item in cat_data["commodities"]:
            assert item["category"] == "Cash Crops"

@pytest.mark.asyncio
async def test_gps_land_calculation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # A 4-point polygon (approx 100m x 100m square field)
        payload = {
            "coordinates": [
                {"latitude": 15.8281, "longitude": 78.0373, "label": "Point A (NW)"},
                {"latitude": 15.8281, "longitude": 78.038234, "label": "Point B (NE)"},
                {"latitude": 15.8272, "longitude": 78.038234, "label": "Point C (SE)"},
                {"latitude": 15.8272, "longitude": 78.0373, "label": "Point D (SW)"}
            ],
            "fencePoleSpacingFeet": 10.0,
            "fenceWireStrands": 4
        }
        res = await ac.post("/api/v1/calculators/gps-land-area", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["totalPoints"] == 4
        assert data["areaSqMeters"] > 9000 and data["areaSqMeters"] < 11000
        assert data["areaAcres"] > 2.2 and data["areaAcres"] < 2.7
        assert data["areaCents"] > 220 and data["areaCents"] < 270
        assert data["areaGuntas"] > 88 and data["areaGuntas"] < 108
        assert data["perimeterMeters"] > 350 and data["perimeterMeters"] < 450
        assert len(data["edges"]) == 4
        assert data["fencing"]["totalPolesNeeded"] > 100
        assert data["fencing"]["wireStrands"] == 4
        assert "Field Survey" in data["regionalSummary"]



