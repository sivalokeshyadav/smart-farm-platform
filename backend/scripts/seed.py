import asyncio
import os
import sys
from datetime import datetime, timezone

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import get_password_hash
from app.core.all_india_locations import ALL_INDIA_MARKETS, ALL_INDIA_GODOWNS

async def seed_database():
    print(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    # Clean existing collections
    collections = [
        "users", "farmer_profiles", "markets", "market_slots", "bookings",
        "godowns", "godown_reservations", "sellers", "products", "orders",
        "schemes", "scheme_cases", "crop_diagnoses", "notifications",
        "notification_outbox", "support_cases", "audit_logs",
        "field_services", "feedbacks"
    ]
    for col in collections:
        await db[col].delete_many({})
    print("Cleaned existing pilot collections.")

    hashed_pw = get_password_hash("farm1234")
    now_iso = datetime.now(timezone.utc).isoformat()
    today_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # 1. Seed Users for all 13 Platform Roles + Pending Role Account
    users_data = [
        {
            "phone": "9876543210",
            "name": "Ramesh Reddy",
            "nameTe": "రమేష్ రెడ్డి",
            "role": "FARMER",
            "roles": ["FARMER"],
            "activeRole": "FARMER",
            "pendingRoles": [],
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "mandal": "Kurnool Rural",
            "village": "Ulchala",
            "preferredLanguage": "te",
            "passwordHash": hashed_pw,
            "isActive": True,
            "createdAt": now_iso
        },
        {
            "phone": "9876543220",
            "name": "Suresh Grain Traders (APMC Buyer)",
            "role": "CROP_BUYER",
            "roles": ["CROP_BUYER"],
            "activeRole": "CROP_BUYER",
            "pendingRoles": [],
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "passwordHash": hashed_pw,
            "isActive": True,
            "createdAt": now_iso
        },
        {
            "phone": "9876543221",
            "name": "Mallikarjuna Natural Farm Produces",
            "role": "CROP_SELLER",
            "roles": ["CROP_SELLER", "FARMER"],
            "activeRole": "CROP_SELLER",
            "pendingRoles": [],
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "passwordHash": hashed_pw,
            "isActive": True,
            "createdAt": now_iso
        },
        {
            "phone": "9876543222",
            "name": "Rayalaseema Dairy & Cattle Buyer",
            "role": "LIVESTOCK_BUYER",
            "roles": ["LIVESTOCK_BUYER"],
            "activeRole": "LIVESTOCK_BUYER",
            "pendingRoles": [],
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "passwordHash": hashed_pw,
            "isActive": True,
            "createdAt": now_iso
        },
        {
            "phone": "9876543223",
            "name": "Govardhan Cattle Breeders",
            "role": "LIVESTOCK_SELLER",
            "roles": ["LIVESTOCK_SELLER"],
            "activeRole": "LIVESTOCK_SELLER",
            "pendingRoles": [],
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "passwordHash": hashed_pw,
            "isActive": True,
            "createdAt": now_iso
        },
        {
            "phone": "9876543224",
            "name": "Nagaraju Agri Engineering Works",
            "role": "EQUIPMENT_BUYER",
            "roles": ["EQUIPMENT_BUYER"],
            "activeRole": "EQUIPMENT_BUYER",
            "pendingRoles": [],
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "passwordHash": hashed_pw,
            "isActive": True,
            "createdAt": now_iso
        },
        {
            "phone": "9876543225",
            "name": "Sri Balaji Harvester & Tractor Rentals",
            "role": "EQUIPMENT_SELLER",
            "roles": ["EQUIPMENT_SELLER"],
            "activeRole": "EQUIPMENT_SELLER",
            "pendingRoles": [],
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "passwordHash": hashed_pw,
            "isActive": True,
            "createdAt": now_iso
        },
        {
            "phone": "9876543226",
            "name": "Dr. Chandrasekhar Rao (Senior Veterinarian)",
            "role": "VETERINARIAN",
            "roles": ["VETERINARIAN"],
            "activeRole": "VETERINARIAN",
            "pendingRoles": [],
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "passwordHash": hashed_pw,
            "isActive": True,
            "createdAt": now_iso
        },
        {
            "phone": "9876543211",
            "name": "Srinivasulu (Kurnool AMC Gate Staff)",
            "role": "MARKET_STAFF",
            "roles": ["MARKET_STAFF"],
            "activeRole": "MARKET_STAFF",
            "pendingRoles": [],
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "passwordHash": hashed_pw,
            "isActive": True,
            "createdAt": now_iso
        },
        {
            "phone": "9876543212",
            "name": "Venkatesh (Warehouse Manager APSWC)",
            "role": "GODOWN_OPERATOR",
            "roles": ["GODOWN_OPERATOR"],
            "activeRole": "GODOWN_OPERATOR",
            "pendingRoles": [],
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "passwordHash": hashed_pw,
            "isActive": True,
            "createdAt": now_iso
        },
        {
            "phone": "9876543227",
            "name": "Chiranjeevi (Field Delivery Assistant)",
            "role": "DELIVERY_WORKER",
            "roles": ["DELIVERY_WORKER"],
            "activeRole": "DELIVERY_WORKER",
            "pendingRoles": [],
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "passwordHash": hashed_pw,
            "isActive": True,
            "createdAt": now_iso
        },
        {
            "phone": "9876543214",
            "name": "Padmavathi (RBK / Scheme Help-Desk Operator)",
            "role": "HELP_DESK_OPERATOR",
            "roles": ["HELP_DESK_OPERATOR", "FIELD_AGENT"],
            "activeRole": "HELP_DESK_OPERATOR",
            "pendingRoles": [],
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "passwordHash": hashed_pw,
            "isActive": True,
            "createdAt": now_iso
        },
        {
            "phone": "9876543215",
            "name": "Admin Officer (District Collectorate)",
            "role": "ADMIN",
            "roles": ["ADMIN"],
            "activeRole": "ADMIN",
            "pendingRoles": [],
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "passwordHash": hashed_pw,
            "isActive": True,
            "createdAt": now_iso
        },
        # Demo user with a pending privileged role awaiting verification:
        {
            "phone": "9876543299",
            "name": "Dr. Anitha Reddy (Candidate Vet)",
            "role": "FARMER",
            "roles": ["FARMER"],
            "activeRole": "FARMER",
            "pendingRoles": ["VETERINARIAN"],
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "passwordHash": hashed_pw,
            "isActive": True,
            "createdAt": now_iso
        }
    ]
    inserted_users = await db.users.insert_many(users_data)
    farmer_user_id = str(inserted_users.inserted_ids[0])
    seller_user_id = str(inserted_users.inserted_ids[2])
    vet_user_id = str(inserted_users.inserted_ids[7])
    print(f"Seeded 14 primary and role-specific accounts with password 'farm1234'.")

    # Farmer Profile
    await db.farmer_profiles.insert_one({
        "userId": farmer_user_id,
        "phone": "9876543210",
        "aadhaarLast4": "8921",
        "district": "Kurnool",
        "mandal": "Kurnool Rural",
        "village": "Ulchala",
        "landHoldingAcres": 4.5,
        "primaryCrops": ["Cotton", "Paddy", "Bengal Gram"],
        "bankAccountLinked": True,
        "preferredLanguage": "te"
    })

    # 2. Seed All-India APMC Markets & Major Agricultural Mandis across all 22 states
    markets_data = [dict(m) for m in ALL_INDIA_MARKETS]
    inserted_markets = await db.markets.insert_many(markets_data)
    kurnool_market_id = str(inserted_markets.inserted_ids[0])
    print(f"Seeded {len(markets_data)} All-India APMC market-yards across 22 states.")

    # 3. Seed Slots
    time_windows = [
        "06:00 AM - 08:00 AM", "08:00 AM - 10:00 AM",
        "10:00 AM - 12:00 PM", "12:00 PM - 02:00 PM",
        "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM"
    ]
    slots_data = []
    for m in inserted_markets.inserted_ids:
        for tw in time_windows:
            for commodity in ["Cotton", "Chilli"]:
                slots_data.append({
                    "marketId": str(m),
                    "date": today_date,
                    "slotTime": tw,
                    "commodity": commodity,
                    "totalCapacityVehicles": 25,
                    "bookedVehicles": 2 if tw.startswith("06") else 0,
                    "isActive": True
                })
    await db.market_slots.insert_many(slots_data)
    print(f"Seeded {len(slots_data)} market slots.")

    # 4. Seed All-India Godowns & State/Central Warehousing Facilities across all 22 states
    godowns_data = [dict(g) for g in ALL_INDIA_GODOWNS]
    await db.godowns.insert_many(godowns_data)
    print(f"Seeded {len(godowns_data)} All-India CWC/SWC verified godowns across 22 states.")

    # 5. Seed Real, Authoritative Government Schemes (Agriculture & Livestock)
    schemes_data = [
        {
            "schemeCode": "YSR-RYTHU-BHAROSA",
            "officialName": "Dr. YSR Rythu Bharosa - PM KISAN",
            "title": "Dr. YSR Rythu Bharosa - PM KISAN",
            "titleTe": "డా. వైఎస్సార్ రైతు భరోసా - పిఎం కిసాన్",
            "titleHi": "डॉ. वाईएसआर रायथू भरोसा - पीएम किसान",
            "jurisdiction": "STATE",
            "category": "AGRICULTURE",
            "subCategory": "INCOME_SUPPORT",
            "applicableStates": ["Andhra Pradesh"],
            "applicableDistricts": ["ALL"],
            "eligibilitySummary": "Farmer families owning cultivable land including SC, ST, BC, Minority tenant farmers holding CCRC cards.",
            "eligibilitySummaryTe": "వ్యవసాయ భూమి కలిగిన రైతు కుటుంబాలు మరియు సిసిఆర్సి కార్డు కలిగిన ఎస్సీ, ఎస్టీ, బిసి, మైనారిటీ కౌలు రైతులకు వర్తింపు.",
            "maxLandHoldingAcres": None,
            "tenantEligible": True,
            "benefits": "Financial assistance of Rs 13,500 per farmer family per year (incorporating PM-KISAN Rs 6,000 + AP Govt Rs 7,500).",
            "benefitsTe": "ప్రతి రైతు కుటుంబానికి సంవత్సరానికి రూ. 13,500 పెట్టుబడి సహాయం.",
            "subsidyPercent": "Direct Cash Benefit",
            "officialSourceUrl": "https://pmkisan.gov.in/",
            "backupSourceUrl": "https://apagrisnet.gov.in/",
            "requiredDocuments": ["Pattadar Passbook / CCRC Card", "Aadhaar Card", "Aadhaar-Linked Bank Account", "Crop Booking (e-Panta)"],
            "lastVerifiedDate": "2026-03-01",
            "verificationStatus": "VERIFIED_OFFICIAL",
            "isActive": True
        },
        {
            "schemeCode": "PM-KISAN",
            "officialName": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
            "title": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
            "titleTe": "ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి (PM-KISAN)",
            "titleHi": "प्रधानमंत्री किसान सम्मान निधि (पीएम-किसान)",
            "jurisdiction": "CENTRAL",
            "category": "AGRICULTURE",
            "subCategory": "INCOME_SUPPORT",
            "applicableStates": ["ALL"],
            "applicableDistricts": ["ALL"],
            "eligibilitySummary": "All landholding farmer families with cultivable landholding in their names across India.",
            "eligibilitySummaryTe": "సాగుభూమి కలిగిన సన్నకారు రైతు కుటుంబాలకు కేంద్ర ప్రభుత్వ ప్రత్యక్ష నగదు బదిలీ.",
            "maxLandHoldingAcres": 5.0,
            "tenantEligible": False,
            "benefits": "Rs 6,000 per year in three equal instalments of Rs 2,000 directly into Aadhaar DBT accounts.",
            "benefitsTe": "ప్రతి 4 నెలలకు రూ. 2000 చొప్పున సంవత్సరానికి రూ. 6000 నేరుగా బ్యాంక్ ఖాతాలో జమ.",
            "subsidyPercent": "Direct Cash Transfer",
            "officialSourceUrl": "https://pmkisan.gov.in/",
            "backupSourceUrl": "https://agricoop.nic.in/",
            "requiredDocuments": ["Land Record (1-B Adangal / ROR)", "Aadhaar Card", "Active DBT Bank Account"],
            "lastVerifiedDate": "2026-03-01",
            "verificationStatus": "VERIFIED_OFFICIAL",
            "isActive": True
        },
        {
            "schemeCode": "PMFBY-AP",
            "officialName": "Pradhan Mantri Fasal Bima Yojana / Free Crop Insurance",
            "title": "Dr. YSR Free Crop Insurance / PMFBY",
            "titleTe": "డా. వైఎస్సార్ ఉచిత పంటల బీమా పథకం (PMFBY)",
            "titleHi": "निःशुल्क फसल बीमा योजना (पीएमएफबीवाई)",
            "jurisdiction": "CENTRAL",
            "category": "AGRICULTURE",
            "subCategory": "CROP_INSURANCE",
            "applicableStates": ["Andhra Pradesh", "ALL"],
            "applicableDistricts": ["ALL"],
            "eligibilitySummary": "Farmers cultivating notified crops registered under digital crop booking across India.",
            "eligibilitySummaryTe": "ఈ-పంట ద్వారా నమోదైన రైతులందరికీ ప్రీమియం భారం లేకుండా పంట నష్టపరిహార రక్షణ.",
            "maxLandHoldingAcres": None,
            "tenantEligible": True,
            "benefits": "100% state-sponsored premium for notified crops. Complete claim coverage against drought, excess rainfall, pests.",
            "benefitsTe": "రైతుల తరఫున ప్రభుత్వమే పూర్తి బీమా ప్రీమియం చెల్లిస్తుంది.",
            "subsidyPercent": "100% Premium Paid",
            "officialSourceUrl": "https://pmfby.gov.in/",
            "backupSourceUrl": "https://agri-insurance.gov.in/",
            "requiredDocuments": ["e-Crop / e-Panta Booking Receipt", "Aadhaar", "Village Agriculture Assistant Verification"],
            "lastVerifiedDate": "2026-03-01",
            "verificationStatus": "VERIFIED_OFFICIAL",
            "isActive": True
        },
        {
            "schemeCode": "APMIP-DRIP",
            "officialName": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) - Micro Irrigation",
            "title": "AP Micro Irrigation Project (PMKSY Drip Subsidy)",
            "titleTe": "ఆంధ్రప్రదేశ్ సూక్ష్మ నీటిపారుదల ప్రాజెక్ట్ (బిందు సేద్య రాయితీ)",
            "titleHi": "सूक्ष्म सिंचाई परियोजना (ड्रिप और स्प्रिंकलर सब्सिडी)",
            "jurisdiction": "STATE",
            "category": "AGRICULTURE",
            "subCategory": "IRRIGATION",
            "applicableStates": ["Andhra Pradesh", "ALL"],
            "applicableDistricts": ["ALL"],
            "eligibilitySummary": "Farmers with valid borewell or water source. 90% subsidy for SC/ST, 70% for BC, 50% for general farmers.",
            "eligibilitySummaryTe": "రైతులకు 50% నుండి 90% వరకు రాయితీతో డ్రిప్ లేదా స్ప్రింక్లర్ పరికరాల పంపిణీ.",
            "maxLandHoldingAcres": 12.5,
            "tenantEligible": False,
            "benefits": "High quality ISI marked drip irrigation and sprinkler systems with 5 years free maintenance warranty.",
            "benefitsTe": "నాణ్యమైన డ్రిప్ పైపులు మరియు 5 సంవత్సరాల ఉచిత వారంటీ సౌకర్యం.",
            "subsidyPercent": "50% to 90% Subsidy",
            "officialSourceUrl": "https://pmksy.gov.in/",
            "backupSourceUrl": "https://apagrisnet.gov.in/",
            "requiredDocuments": ["Land 1-B", "Adangal", "Aadhaar", "Water Source Certificate", "Passport Photo"],
            "lastVerifiedDate": "2026-03-01",
            "verificationStatus": "VERIFIED_OFFICIAL",
            "isActive": True
        },
        {
            "schemeCode": "NLM-LIVESTOCK",
            "officialName": "National Livestock Mission (NLM Entrepreneurship Scheme)",
            "title": "National Livestock Mission (NLM Subsidy)",
            "titleTe": "జాతీయ పశుసంవర్థక మిషన్ (మేకలు, గొర్రెలు, కోళ్ల పెంపకం రాయితీ)",
            "titleHi": "राष्ट्रीय पशुधन मिशन (पशुपालन और कुक्कुट पालन सब्सिडी)",
            "jurisdiction": "CENTRAL",
            "category": "LIVESTOCK",
            "subCategory": "SHEEP_GOAT_POULTRY",
            "applicableStates": ["ALL"],
            "applicableDistricts": ["ALL"],
            "eligibilitySummary": "Individual farmers, SHGs, FPOs, and entrepreneurs setting up sheep/goat breeding farms or poultry units.",
            "eligibilitySummaryTe": "మేకలు, గొర్రెల పెంపకం మరియు దాణా తయారీ యూనిట్ల ఏర్పాటుకు 50% మూలధన సబ్సిడీ.",
            "maxLandHoldingAcres": None,
            "tenantEligible": True,
            "benefits": "50% capital subsidy up to Rs 50 Lakhs for sheep/goat breeding units (500 females + 25 males) and fodder seed production.",
            "benefitsTe": "ప్రాజెక్ట్ వ్యయంలో 50% వరకు సబ్సిడీ కేంద్ర ప్రభుత్వం ద్వారా నేరుగా మంజూరు.",
            "subsidyPercent": "50% Capital Subsidy",
            "officialSourceUrl": "https://dahd.nic.in/schemes/programmes/national-livestock-mission",
            "backupSourceUrl": "https://nlm.udyamimitra.in/",
            "requiredDocuments": ["Project Report", "Land Lease / Ownership Proof", "Aadhaar", "Bank In-principle Loan Sanction"],
            "lastVerifiedDate": "2026-03-01",
            "verificationStatus": "VERIFIED_OFFICIAL",
            "isActive": True
        },
        {
            "schemeCode": "AP-PASU-KRANTI",
            "officialName": "Animal Husbandry & Dairy Development Subsidy",
            "title": "YSR Pasu Kranti / Dairy Induction Scheme",
            "titleTe": "వైఎస్సార్ పశు క్రాంతి (పాడి గేదెలు, ఆవుల కొనుగోలు రాయితీ)",
            "titleHi": "दुग्ध विकास एवं पशुधन सहायता योजना",
            "jurisdiction": "STATE",
            "category": "LIVESTOCK",
            "subCategory": "DAIRY_DEVELOPMENT",
            "applicableStates": ["Andhra Pradesh", "ALL"],
            "applicableDistricts": ["Kurnool", "Nandyal", "Anantapur", "Kadapa"],
            "eligibilitySummary": "Small and marginal farmers, women SHG members taking up mini dairy units (2 animals).",
            "eligibilitySummaryTe": "మహిళా స్వయం సహాయక సంఘాలు మరియు రైతులకు పాడి పశువుల కొనుగోలుపై సబ్సిడీ.",
            "maxLandHoldingAcres": None,
            "tenantEligible": True,
            "benefits": "75% subsidy for SC/ST beneficiaries and 50% subsidy for BC beneficiaries towards purchase of high-yielding milch animals.",
            "benefitsTe": "ఎస్సీ, ఎస్టీలకు 75%, బీసీలకు 50% రాయితీతో పాడి పశువుల పంపిణీ.",
            "subsidyPercent": "50% - 75% Subsidy",
            "officialSourceUrl": "https://dahd.nic.in/",
            "backupSourceUrl": "https://apagrisnet.gov.in/",
            "requiredDocuments": ["Ration Card", "Caste Certificate", "Aadhaar", "Bank Passbook"],
            "lastVerifiedDate": "2026-03-01",
            "verificationStatus": "VERIFIED_OFFICIAL",
            "isActive": True
        },
        {
            "schemeCode": "TG-RYTHU-BANDHU",
            "officialName": "Telangana Rythu Bharosa / Agriculture Support",
            "title": "Telangana Agriculture Investment Support",
            "titleTe": "తెలంగాణ వ్యవసాయ పెట్టుబడి మద్దతు పథకం",
            "titleHi": "तेलंगाना कृषि निवेश सहायता योजना",
            "jurisdiction": "STATE",
            "category": "AGRICULTURE",
            "subCategory": "INCOME_SUPPORT",
            "applicableStates": ["Telangana"],
            "applicableDistricts": ["ALL"],
            "eligibilitySummary": "Resident farmers of Telangana holding Dharani pattadar passbooks.",
            "eligibilitySummaryTe": "ధరణి పాస్‌బుక్ కలిగిన తెలంగాణ పట్టాదారు రైతులకు పెట్టుబడి సాయం.",
            "maxLandHoldingAcres": None,
            "tenantEligible": False,
            "benefits": "Direct investment support per acre per season deposited directly into farmer bank accounts.",
            "benefitsTe": "ఎకరానికి సీజన్‌కు నేరుగా బ్యాంక్ ఖాతాలో జమ అయ్యే పెట్టుబడి మద్దతు.",
            "subsidyPercent": "Per Acre Investment Support",
            "officialSourceUrl": "https://dharani.telangana.gov.in/",
            "backupSourceUrl": "https://telangana.gov.in/",
            "requiredDocuments": ["Dharani Passbook", "Aadhaar", "Bank Account"],
            "lastVerifiedDate": "2026-03-01",
            "verificationStatus": "VERIFIED_OFFICIAL",
            "isActive": True
        }
    ]
    await db.schemes.insert_many(schemes_data)
    print(f"Seeded {len(schemes_data)} comprehensive government schemes across Agriculture and Livestock.")

    # 5.1 Seed Authorized Agri-Input Seller Profile
    seller_profile = {
        "userId": seller_user_id,
        "businessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
        "businessNameTe": "మల్లికార్జున కృషి ఇన్‌పుట్ కేంద్రం & ఆగ్రో కెమికల్స్",
        "registrationNumber": "AP/KNL/AGRO/2023/10892",
        "contactPhone": "9876543221",
        "address": "Shop No. 14, AMC Market Yard Complex, Kurnool - 518003",
        "isVerified": True,
        "verificationStatus": "VERIFIED",
        "licenses": [
            {
                "licenseType": "INSECTICIDE_LICENSE",
                "licenseNumber": "AP-KNL-INS-2023-4512",
                "issuingAuthority": "Department of Agriculture, AP",
                "validUntil": "2029-12-31",
                "isVerified": True
            },
            {
                "licenseType": "PESTICIDE_DEALER",
                "licenseNumber": "AP-KNL-PEST-2023-8891",
                "issuingAuthority": "Directorate of Plant Protection",
                "validUntil": "2029-12-31",
                "isVerified": True
            },
            {
                "licenseType": "FERTILIZER_DEALER",
                "licenseNumber": "AP-KNL-FERT-2023-1102",
                "issuingAuthority": "Directorate of Agriculture, Guntur",
                "validUntil": "2028-06-30",
                "isVerified": True
            },
            {
                "licenseType": "SEED_DEALER",
                "licenseNumber": "AP-KNL-SEED-2022-7714",
                "issuingAuthority": "AP Seeds Certification Agency",
                "validUntil": "2027-10-15",
                "isVerified": True
            }
        ],
        "createdAt": now_iso
    }
    await db.sellers.insert_one(seller_profile)

    # 5.2 Seed Realistic Agricultural Products with Verified Sample Images
    products_data = [
        # --- PESTICIDES & BIO-CONTROL ---
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "PESTICIDES",
            "name": "Chlorpyrifos 20% EC Broad-Spectrum Insecticide",
            "nameTe": "క్లోర్‌పైరిఫాస్ 20% EC క్రిమిసంహారక మందు",
            "brand": "Tata Rallis / Tafaban",
            "price": 420.0,
            "originalPrice": 520.0,
            "unit": "1 Litre Bottle",
            "stockQuantity": 85,
            "imageUrl": "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&auto=format&fit=crop&q=80",
            "description": "Effective against termites, stem borers, leaf folders, bollworms, and soil insects in Cotton, Paddy and vegetables.",
            "rating": 4.8,
            "reviewsCount": 54,
            "requiresLicense": True,
            "licenseTypeRequired": "INSECTICIDE_LICENSE",
            "isApproved": True,
            "createdAt": now_iso
        },
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "PESTICIDES",
            "name": "Organic Neem Oil 10,000 PPM Bio-Pesticide",
            "nameTe": "సేంద్రీయ వేప నూనె 10,000 PPM బయో-పురుగుమందు",
            "brand": "Kisan Bio-Agri",
            "price": 380.0,
            "originalPrice": 460.0,
            "unit": "1 Litre Can",
            "stockQuantity": 120,
            "imageUrl": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80",
            "description": "100% cold-pressed Azadirachtin organic bio-pesticide. Controls whiteflies, aphids, thrips, and mites with zero chemical residue.",
            "rating": 4.9,
            "reviewsCount": 82,
            "requiresLicense": False,
            "licenseTypeRequired": None,
            "isApproved": True,
            "createdAt": now_iso
        },
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "PESTICIDES",
            "name": "Mancozeb 75% WP Broad Spectrum Fungicide",
            "nameTe": "మాంకోజెబ్ 75% WP శిలీంద్ర సంహారిణి (Dithane M-45)",
            "brand": "Indofil Dithane M-45",
            "price": 290.0,
            "originalPrice": 350.0,
            "unit": "500 Grams Pack",
            "stockQuantity": 95,
            "imageUrl": "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80",
            "description": "Gold standard protective contact fungicide for early/late blight, downy mildew, leaf spots and fruit rot in chilli and groundnut.",
            "rating": 4.7,
            "reviewsCount": 46,
            "requiresLicense": True,
            "licenseTypeRequired": "INSECTICIDE_LICENSE",
            "isApproved": True,
            "createdAt": now_iso
        },
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "PESTICIDES",
            "name": "Imidacloprid 17.8% SL Systemic Insecticide",
            "nameTe": "ఇమిడాక్లోప్రిడ్ 17.8% SL దైహిక పురుగుమందు (Confidor)",
            "brand": "Bayer Confidor",
            "price": 490.0,
            "originalPrice": 599.0,
            "unit": "250 ml Bottle",
            "stockQuantity": 60,
            "imageUrl": "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600&auto=format&fit=crop&q=80",
            "description": "Rapid systemic control against sucking pests: brown plant hopper (BPH) in paddy, whitefly, jassids and aphids in cotton.",
            "rating": 4.9,
            "reviewsCount": 94,
            "requiresLicense": True,
            "licenseTypeRequired": "INSECTICIDE_LICENSE",
            "isApproved": True,
            "createdAt": now_iso
        },
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "PESTICIDES",
            "name": "Trichoderma Viride Bio-Fungicide Powder (1% WP)",
            "nameTe": "ట్రైకోడెర్మా విరిడే బయో-శిలీంద్రనాశిని",
            "brand": "AP Seed Biotech",
            "price": 180.0,
            "originalPrice": 220.0,
            "unit": "1 Kg Pouch",
            "stockQuantity": 150,
            "imageUrl": "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&auto=format&fit=crop&q=80",
            "description": "Eco-friendly bio-agent for seed treatment and soil application. Prevents collar rot, root rot, damping off and Fusarium wilt.",
            "rating": 4.6,
            "reviewsCount": 38,
            "requiresLicense": False,
            "licenseTypeRequired": None,
            "isApproved": True,
            "createdAt": now_iso
        },
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "PESTICIDES",
            "name": "Emamectin Benzoate 5% SG Caterpillar Killer",
            "nameTe": "ఎమామెక్టిన్ బెంజోయేట్ 5% SG పురుగుమందు (Proclaim)",
            "brand": "Syngenta Proclaim",
            "price": 370.0,
            "originalPrice": 440.0,
            "unit": "100 Grams Pack",
            "stockQuantity": 75,
            "imageUrl": "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=80",
            "description": "Modern insecticide with stomach action for Fall Armyworm in Maize, Helicoverpa bollworm in Cotton, and DBM in vegetables.",
            "rating": 4.8,
            "reviewsCount": 61,
            "requiresLicense": True,
            "licenseTypeRequired": "INSECTICIDE_LICENSE",
            "isApproved": True,
            "createdAt": now_iso
        },
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "PESTICIDES",
            "name": "Glyphosate 41% SL Non-Selective Herbicide (Weed Killer)",
            "nameTe": "గ్లైఫోసేట్ 41% SL కలుపు నివారిణి (Roundup)",
            "brand": "Bayer Roundup",
            "price": 450.0,
            "originalPrice": 530.0,
            "unit": "1 Litre Can",
            "stockQuantity": 65,
            "imageUrl": "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&auto=format&fit=crop&q=80",
            "description": "Systemic herbicide for clearance of stubborn grasses, broadleaved weeds and sedges in non-cropped bunds and plantation channels.",
            "rating": 4.7,
            "reviewsCount": 49,
            "requiresLicense": True,
            "licenseTypeRequired": "INSECTICIDE_LICENSE",
            "isApproved": True,
            "createdAt": now_iso
        },
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "PESTICIDES",
            "name": "Lambda-Cyhalothrin 5% EC Fast Action Spray",
            "nameTe": "లాంబ్డా-సైహలోత్రిన్ 5% EC శీఘ్ర చర్య స్ప్రే (Karate)",
            "brand": "Syngenta Karate",
            "price": 340.0,
            "originalPrice": 410.0,
            "unit": "500 ml Bottle",
            "stockQuantity": 90,
            "imageUrl": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
            "description": "Quick knockdown synthetic pyrethroid insecticide against bollworms, thrips, stem borers and leaf folders in paddy and cotton.",
            "rating": 4.8,
            "reviewsCount": 57,
            "requiresLicense": True,
            "licenseTypeRequired": "INSECTICIDE_LICENSE",
            "isApproved": True,
            "createdAt": now_iso
        },

        # --- SEEDS ---
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "SEEDS",
            "name": "Certified Bt Cotton Hybrid Seeds (BG-II Bollgard)",
            "nameTe": "ప్రమాణీకరించిన బిటి పత్తి హైబ్రిడ్ విత్తనాలు",
            "brand": "Rasi RCH-659 BG-II",
            "price": 864.0,
            "originalPrice": 950.0,
            "unit": "475 Grams Packet",
            "stockQuantity": 200,
            "imageUrl": "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop&q=80",
            "description": "Top performing high-yield hybrid cotton seed with in-built bollworm resistance for Andhra Pradesh & Telangana soils.",
            "rating": 4.9,
            "reviewsCount": 110,
            "requiresLicense": False,
            "licenseTypeRequired": None,
            "isApproved": True,
            "createdAt": now_iso
        },
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "SEEDS",
            "name": "BPT-5204 Samba Masuri Certified Paddy Seeds",
            "nameTe": "సాంబ మసూరి BPT-5204 వరి విత్తనాలు (సర్టిఫైడ్)",
            "brand": "AP State Seeds Corp (APSSDCL)",
            "price": 1150.0,
            "originalPrice": 1300.0,
            "unit": "30 Kg Bag",
            "stockQuantity": 140,
            "imageUrl": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
            "description": "Premium quality fine grain rice seeds with 98% germination rate. High market price fetcher in Rayalaseema mandis.",
            "rating": 4.8,
            "reviewsCount": 73,
            "requiresLicense": False,
            "licenseTypeRequired": None,
            "isApproved": True,
            "createdAt": now_iso
        },
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "SEEDS",
            "name": "Kadiri-6 (K-6) Certified Groundnut Kernel Seeds",
            "nameTe": "కదిరి-6 (K-6) వేరుశనగ విత్తనాలు",
            "brand": "ANGRAU Certified Seed",
            "price": 3200.0,
            "originalPrice": 3600.0,
            "unit": "40 Kg Bag",
            "stockQuantity": 50,
            "imageUrl": "https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=600&auto=format&fit=crop&q=80",
            "description": "Drought-hardy, high oil percentage (49%) groundnut seeds ideally suited for rainfed cultivation in Kurnool and Anantapur.",
            "rating": 4.9,
            "reviewsCount": 65,
            "requiresLicense": False,
            "licenseTypeRequired": None,
            "isApproved": True,
            "createdAt": now_iso
        },

        # --- FERTILIZERS ---
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "FERTILIZERS",
            "name": "IFFCO Neem Coated Urea (46% Nitrogen)",
            "nameTe": "ఇఫ్కో వేప పూత పూసిన యూరియా (46% నత్రజని)",
            "brand": "IFFCO Cooperative",
            "price": 266.50,
            "originalPrice": 290.0,
            "unit": "45 Kg Bag",
            "stockQuantity": 350,
            "imageUrl": "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&auto=format&fit=crop&q=80",
            "description": "Government subsidized neem coated urea with slow nitrogen release for maximum plant uptake and minimum leaching.",
            "rating": 4.9,
            "reviewsCount": 210,
            "requiresLicense": False,
            "licenseTypeRequired": None,
            "isApproved": True,
            "createdAt": now_iso
        },
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "FERTILIZERS",
            "name": "Di-Ammonium Phosphate (DAP 18:46:0)",
            "nameTe": "డి-అమ్మోనియం ఫాస్ఫేట్ DAP (18:46:0)",
            "brand": "IFFCO DAP",
            "price": 1350.0,
            "originalPrice": 1450.0,
            "unit": "50 Kg Bag",
            "stockQuantity": 180,
            "imageUrl": "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=600&auto=format&fit=crop&q=80",
            "description": "Essential basal fertilizer providing concentrated phosphorus (46%) and nitrogen (18%) for vigorous root development.",
            "rating": 4.8,
            "reviewsCount": 140,
            "requiresLicense": False,
            "licenseTypeRequired": None,
            "isApproved": True,
            "createdAt": now_iso
        },
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "FERTILIZERS",
            "name": "100% Pure Organic Vermicompost Soil Conditioner",
            "nameTe": "100% స్వచ్ఛమైన వానపాముల ఎరువు (వర్మీ కంపోస్ట్)",
            "brand": "Rayalaseema Bio-Organics",
            "price": 450.0,
            "originalPrice": 550.0,
            "unit": "40 Kg Bag",
            "stockQuantity": 90,
            "imageUrl": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80",
            "description": "Enriched with beneficial soil microbes, humic acid, and earthworm castings. Enhances water retention and organic carbon.",
            "rating": 4.9,
            "reviewsCount": 88,
            "requiresLicense": False,
            "licenseTypeRequired": None,
            "isApproved": True,
            "createdAt": now_iso
        },

        # --- TOOLS & EQUIPMENT ---
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "TOOLS",
            "name": "16L Battery Operated 2-in-1 Knapsack Power Sprayer",
            "nameTe": "16 లీటర్ల బ్యాటరీ ఆధారిత పవర్ స్ప్రేయర్",
            "brand": "Balwaan Agri Tools",
            "price": 2850.0,
            "originalPrice": 3499.0,
            "unit": "1 Unit (Complete Kit)",
            "stockQuantity": 35,
            "imageUrl": "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=80",
            "description": "Heavy duty 12V 12AH battery sprayer with telescopic brass lance, 4 nozzle attachments, and 6 hours non-stop run time.",
            "rating": 4.8,
            "reviewsCount": 42,
            "requiresLicense": False,
            "licenseTypeRequired": None,
            "isApproved": True,
            "createdAt": now_iso
        },
        {
            "sellerId": seller_user_id,
            "sellerBusinessName": "Mallikarjuna Krishi Input Kendra & Agro Chemicals",
            "category": "TOOLS",
            "name": "Digital 4-in-1 Soil pH, Moisture & Sunlight Meter",
            "nameTe": "డిజిటల్ భూసార & తేమ కొలత పరికరం",
            "brand": "AgroSense Labs",
            "price": 890.0,
            "originalPrice": 1199.0,
            "unit": "1 Piece",
            "stockQuantity": 45,
            "imageUrl": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
            "description": "Instant digital readout for soil pH level, moisture percentage, soil temperature and sunlight intensity for precision farming.",
            "rating": 4.6,
            "reviewsCount": 29,
            "requiresLicense": False,
            "licenseTypeRequired": None,
            "isApproved": True,
            "createdAt": now_iso
        }
    ]
    await db.products.insert_many(products_data)
    print(f"Seeded 1 verified agricultural seller profile and {len(products_data)} input products (with pesticides images).")

    # 6. Seed Sample Field Service Visits (Veterinarian visit, Equipment inspection)
    field_services_data = [
        {
            "serviceType": "VETERINARY",
            "title": "Cattle Pregnancy Diagnosis & Foot-and-Mouth Vaccination",
            "description": "2 Murrah buffaloes require PD check and preventative FMD vaccination booster in Ulchala village.",
            "scheduledDate": today_date,
            "scheduledTime": "11:00 AM - 01:00 PM",
            "farmLocation": "Survey No 142/B, Ulchala Village, Kurnool Rural",
            "mandal": "Kurnool Rural",
            "district": "Kurnool",
            "state": "Andhra Pradesh",
            "contactPhone": "9876543210",
            "customerId": farmer_user_id,
            "customerName": "Ramesh Reddy",
            "customerPhone": "9876543210",
            "status": "ACCEPTED",
            "assignedProviderId": vet_user_id,
            "assignedProviderName": "Dr. Chandrasekhar Rao",
            "assignedProviderRole": "VETERINARIAN",
            "statusHistory": [
                {
                    "fromStatus": None,
                    "toStatus": "REQUESTED",
                    "timestamp": now_iso,
                    "actorId": farmer_user_id,
                    "actorRole": "FARMER",
                    "actorName": "Ramesh Reddy",
                    "notes": "Appointment requested",
                    "evidence": {}
                },
                {
                    "fromStatus": "REQUESTED",
                    "toStatus": "ASSIGNED",
                    "timestamp": now_iso,
                    "actorId": "system",
                    "actorRole": "ADMIN",
                    "actorName": "Kurnool Veterinary Sub-centre",
                    "notes": "Assigned to Dr. Chandrasekhar Rao",
                    "evidence": {}
                },
                {
                    "fromStatus": "ASSIGNED",
                    "toStatus": "ACCEPTED",
                    "timestamp": now_iso,
                    "actorId": vet_user_id,
                    "actorRole": "VETERINARIAN",
                    "actorName": "Dr. Chandrasekhar Rao",
                    "notes": "Accepted visit request for today afternoon.",
                    "evidence": {}
                }
            ],
            "createdAt": now_iso,
            "updatedAt": now_iso
        }
    ]
    await db.field_services.insert_many(field_services_data)
    print("Seeded sample field service appointment.")

    # 7. Seed Sample Feedbacks across Modules
    feedbacks_data = [
        {
            "module": "MARKET_BOOKING",
            "transactionId": "KNL-MKT-SAMPLE-1",
            "targetId": kurnool_market_id,
            "targetName": "Agricultural Market Committee Kurnool (Main Yard)",
            "raterId": farmer_user_id,
            "raterName": "Ramesh Reddy",
            "raterRole": "FARMER",
            "rating": 5,
            "reviewText": "Zero waiting time at the gate! The token check-in was verified in 30 seconds and our cotton tractor entered directly without road congestion.",
            "tags": ["ON_TIME", "HONEST_WEIGHING", "FAST_GATE_ENTRY"],
            "status": "PUBLISHED",
            "createdAt": now_iso,
            "updatedAt": now_iso
        },
        {
            "module": "VETERINARY",
            "transactionId": "VET-VISIT-SAMPLE-1",
            "targetId": vet_user_id,
            "targetName": "Dr. Chandrasekhar Rao",
            "raterId": farmer_user_id,
            "raterName": "Ramesh Reddy",
            "raterRole": "FARMER",
            "rating": 5,
            "reviewText": "Prompt visit to our farm. Proper medical diagnosis and genuine medication administered to our cattle.",
            "tags": ["PROFESSIONAL", "ON_TIME", "ACCURATE_DIAGNOSIS"],
            "status": "PUBLISHED",
            "createdAt": now_iso,
            "updatedAt": now_iso
        }
    ]
    await db.feedbacks.insert_many(feedbacks_data)
    print("Seeded sample customer feedbacks.")

    print("\nSUCCESS: Database seeded successfully for Smart Farmer Platform!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
