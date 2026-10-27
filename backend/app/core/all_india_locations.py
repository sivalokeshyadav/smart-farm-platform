"""
Master All-India Agricultural Directory:
Locations, APMC Markets, and CWC/SWC Warehouses across all 22 major agricultural states of India.
Provides comprehensive cross-platform consistency for Market Booking, Godown Storage, and Mandi Prices.
"""

from typing import Dict, List, Any

ALL_INDIA_LOCATIONS: Dict[str, List[str]] = {
    "Andhra Pradesh": [
        "Kurnool", "Nandyal", "Guntur", "Krishna", "Anantapur", 
        "Chittoor", "Visakhapatnam", "East Godavari", "West Godavari", 
        "Kadapa", "Nellore", "Prakasam", "Srikakulam", "Vizianagaram"
    ],
    "Telangana": [
        "Hyderabad", "Warangal", "Khammam", "Nizamabad", "Karimnagar", 
        "Nalgonda", "Mahbubnagar", "Medak", "Adilabad", "Ranga Reddy"
    ],
    "Karnataka": [
        "Raichur", "Dharwad", "Mandya", "Belagavi", "Ballari", 
        "Mysuru", "Bengaluru Rural", "Davanagere", "Shimoga", "Kalaburagi"
    ],
    "Maharashtra": [
        "Nashik", "Thane", "Latur", "Pune", "Nagpur", 
        "Jalgaon", "Ahmednagar", "Kolhapur", "Solapur", "Amravati"
    ],
    "Gujarat": [
        "Mehsana", "Rajkot", "Ahmedabad", "Surat", "Vadodara", 
        "Junagadh", "Banaskantha", "Bhavnagar", "Amreli", "Patan"
    ],
    "Madhya Pradesh": [
        "Neemuch", "Indore", "Ujjain", "Bhopal", "Gwalior", 
        "Dewas", "Mandsaur", "Jabalpur", "Sagar", "Dhar"
    ],
    "Punjab": [
        "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", 
        "Firozpur", "Sangrur", "Hoshiarpur", "Moga"
    ],
    "Haryana": [
        "Karnal", "Kurukshetra", "Ambala", "Hisar", "Rohtak", 
        "Sirsa", "Panipat", "Sonipat", "Fatehabad"
    ],
    "Rajasthan": [
        "Kota", "Jaipur", "Jodhpur", "Bikaner", "Sri Ganganagar", 
        "Alwar", "Nagaur", "Baran", "Hanumangarh"
    ],
    "Tamil Nadu": [
        "Erode", "Coimbatore", "Madurai", "Salem", "Thanjavur", 
        "Tiruchirappalli", "Tirunelveli", "Dindigul"
    ],
    "Uttar Pradesh": [
        "Muzaffarnagar", "Meerut", "Agra", "Aligarh", "Bareilly", 
        "Varanasi", "Kanpur Nagar", "Prayagraj", "Gorakhpur", "Mathura"
    ],
    "Bihar": [
        "Patna", "Muzaffarpur", "Bhagalpur", "Gaya", "Purnia", 
        "Begusarai", "Samastipur", "Nalanda"
    ],
    "West Bengal": [
        "Burdwan", "Hooghly", "Nadia", "Murshidabad", "North 24 Parganas", 
        "Malda", "Jalpaiguri"
    ],
    "Odisha": [
        "Bargarh", "Cuttack", "Sambalpur", "Balasore", "Ganjam", 
        "Kalahandi", "Bolangir"
    ],
    "Kerala": [
        "Wayanad", "Palakkad", "Kozhikode", "Thrissur", "Ernakulam", 
        "Idukki", "Kottayam"
    ],
    "Assam": [
        "Kamrup", "Nagaon", "Sonitpur", "Cachar", "Dibrugarh", "Barpeta"
    ],
    "Chhattisgarh": [
        "Raipur", "Durg", "Bilaspur", "Rajnandgaon", "Dhamtari"
    ],
    "Jharkhand": [
        "Ranchi", "Dhanbad", "Bokaro", "Jamshedpur", "Hazaribagh"
    ],
    "Uttarakhand": [
        "Dehradun", "Haridwar", "Udham Singh Nagar", "Nainital"
    ],
    "Himachal Pradesh": [
        "Shimla", "Kullu", "Mandi", "Kangra", "Solan"
    ],
    "Jammu & Kashmir": [
        "Srinagar", "Jammu", "Anantnag", "Baramulla", "Pulwama"
    ],
    "Delhi": [
        "North Delhi", "South Delhi", "West Delhi", "East Delhi", "Central Delhi"
    ],
}

ALL_INDIA_GODOWNS: List[Dict[str, Any]] = [
    # 1. Andhra Pradesh
    {
        "name": "APSWC State Warehouse - Kurnool Central",
        "nameTe": "ఆంధ్రప్రదేశ్ రాష్ట్ర గిడ్డంగుల సంస్థ - కర్నూలు సెంట్రల్",
        "state": "Andhra Pradesh",
        "district": "Kurnool",
        "mandal": "Kurnool Rural",
        "address": "Industrial Estate, Bellary Road, Kurnool - 518003",
        "totalCapacityBags": 50000,
        "availableCapacityBags": 18500,
        "eligibleCommodities": ["Paddy", "Bengal Gram", "Maize", "Groundnut", "Cotton Bales"],
        "unitPricePerMonthPerBag": 6.50,
        "operatingHours": "08:00 AM - 06:00 PM",
        "contactPhone": "08518-228741",
        "isVerified": True
    },
    {
        "name": "APSWC Warehouse - Adoni Cotton & Grain Unit",
        "nameTe": "ఆంధ్రప్రదేశ్ రాష్ట్ర గిడ్డంగి - ఆదోని యూనిట్",
        "state": "Andhra Pradesh",
        "district": "Kurnool",
        "mandal": "Adoni",
        "address": "Near Railway Goods Shed, Adoni - 518301",
        "totalCapacityBags": 40000,
        "availableCapacityBags": 12000,
        "eligibleCommodities": ["Cotton Bales", "Groundnut", "Bengal Gram"],
        "unitPricePerMonthPerBag": 7.00,
        "operatingHours": "08:00 AM - 05:00 PM",
        "contactPhone": "08512-251490",
        "isVerified": True
    },
    {
        "name": "APSWC Grain Storage Facility - Nandyal",
        "nameTe": "ఆంధ్రప్రదేశ్ రాష్ట్ర గిడ్డంగి - నంద్యాల",
        "state": "Andhra Pradesh",
        "district": "Nandyal",
        "mandal": "Nandyal",
        "address": "Sanjiva Nagar Extension, Nandyal - 518501",
        "totalCapacityBags": 35000,
        "availableCapacityBags": 9200,
        "eligibleCommodities": ["Paddy", "Bengal Gram", "Maize"],
        "unitPricePerMonthPerBag": 6.00,
        "operatingHours": "08:00 AM - 06:00 PM",
        "contactPhone": "08514-242390",
        "isVerified": True
    },
    {
        "name": "CWC Central Warehouse - Guntur Chilli Complex",
        "nameTe": "సెంట్రల్ వేర్‌హౌసింగ్ కార్పొరేషన్ - గుంటూరు కాంప్లెక్స్",
        "state": "Andhra Pradesh",
        "district": "Guntur",
        "mandal": "Guntur Urban",
        "address": "Industrial Development Area, Guntur - 522001",
        "totalCapacityBags": 65000,
        "availableCapacityBags": 24000,
        "eligibleCommodities": ["Chilli", "Turmeric", "Paddy", "Cotton Bales"],
        "unitPricePerMonthPerBag": 8.00,
        "operatingHours": "08:00 AM - 07:00 PM",
        "contactPhone": "0863-2245890",
        "isVerified": True
    },
    {
        "name": "APSWC Multi-Commodity Cold Storage - Vijayawada",
        "nameTe": "ఆంధ్రప్రదేశ్ రాష్ట్ర కోల్డ్ స్టోరేజ్ - విజయవాడ",
        "state": "Andhra Pradesh",
        "district": "Krishna",
        "mandal": "Vijayawada Rural",
        "address": "Gollapudi Bypass Road, Krishna - 521225",
        "totalCapacityBags": 45000,
        "availableCapacityBags": 16000,
        "eligibleCommodities": ["Paddy", "Pulses", "Mango", "Vegetables"],
        "unitPricePerMonthPerBag": 7.50,
        "operatingHours": "08:00 AM - 06:00 PM",
        "contactPhone": "0866-2419800",
        "isVerified": True
    },

    # 2. Telangana
    {
        "name": "CWC Mega Grain Silos - Warangal Enumamula",
        "nameTe": "సిడబ్ల్యుసి మెగా గిడ్డంగులు - వరంగల్ ఎనుమాముల",
        "state": "Telangana",
        "district": "Warangal",
        "mandal": "Enumamula",
        "address": "Mandi Bypass Road, Warangal - 506006",
        "totalCapacityBags": 75000,
        "availableCapacityBags": 31000,
        "eligibleCommodities": ["Paddy", "Cotton Bales", "Maize", "Chilli"],
        "unitPricePerMonthPerBag": 7.50,
        "operatingHours": "07:30 AM - 06:30 PM",
        "contactPhone": "0870-2458120",
        "isVerified": True
    },
    {
        "name": "TSWC State Warehousing Complex - Bowenpally Hyderabad",
        "nameTe": "తెలంగాణ రాష్ట్ర గిడ్డంగులు - బోయిన్‌పల్లి హైదరాబాద్",
        "state": "Telangana",
        "district": "Hyderabad",
        "mandal": "Secunderabad",
        "address": "Military Dairy Farm Road, Bowenpally, Hyderabad - 500011",
        "totalCapacityBags": 60000,
        "availableCapacityBags": 19500,
        "eligibleCommodities": ["Paddy", "Wheat", "Pulses", "Millets"],
        "unitPricePerMonthPerBag": 8.50,
        "operatingHours": "07:00 AM - 07:00 PM",
        "contactPhone": "040-27764120",
        "isVerified": True
    },
    {
        "name": "TSWC Spices & Grain Unit - Nizamabad",
        "nameTe": "తెలంగాణ గిడ్డంగి - నిజామాబాద్ పసుపు యూనిట్",
        "state": "Telangana",
        "district": "Nizamabad",
        "mandal": "Nizamabad",
        "address": "Armoor Road Industrial Area, Nizamabad - 503001",
        "totalCapacityBags": 48000,
        "availableCapacityBags": 15000,
        "eligibleCommodities": ["Turmeric", "Paddy", "Soybean", "Maize"],
        "unitPricePerMonthPerBag": 7.20,
        "operatingHours": "08:00 AM - 06:00 PM",
        "contactPhone": "08462-224500",
        "isVerified": True
    },

    # 3. Karnataka
    {
        "name": "KSWC State Storage Unit - Raichur Cotton & Grains",
        "nameTe": "కర్ణాటక రాష్ట్ర గిడ్డంగి - రాయచూర్",
        "state": "Karnataka",
        "district": "Raichur",
        "mandal": "Raichur",
        "address": "Industrial Area, Station Road, Raichur - 584101",
        "totalCapacityBags": 55000,
        "availableCapacityBags": 22000,
        "eligibleCommodities": ["Paddy", "Cotton Bales", "Bengal Gram"],
        "unitPricePerMonthPerBag": 6.80,
        "operatingHours": "08:00 AM - 06:00 PM",
        "contactPhone": "08532-239100",
        "isVerified": True
    },
    {
        "name": "CWC Central Agro Logistics Hub - Dharwad Hubli",
        "nameTe": "సిడబ్ల్యుసి అగ్రో లాజిస్టిక్స్ - ధార్వాడ్ హుబ్లీ",
        "state": "Karnataka",
        "district": "Dharwad",
        "mandal": "Hubli",
        "address": "Amargol APMC Complex, Hubli - 580025",
        "totalCapacityBags": 70000,
        "availableCapacityBags": 29000,
        "eligibleCommodities": ["Cotton Bales", "Chilli", "Onion", "Maize"],
        "unitPricePerMonthPerBag": 7.50,
        "operatingHours": "07:30 AM - 06:30 PM",
        "contactPhone": "0836-2228900",
        "isVerified": True
    },

    # 4. Maharashtra
    {
        "name": "MSWC Agro Warehouse - Lasalgaon Onion Hub",
        "nameTe": "మహారాష్ట్ర అగ్రో వేర్‌హౌస్ - లసల్‌గావ్",
        "state": "Maharashtra",
        "district": "Nashik",
        "mandal": "Niphad",
        "address": "Railway Station Road, Lasalgaon, Nashik - 422306",
        "totalCapacityBags": 85000,
        "availableCapacityBags": 38000,
        "eligibleCommodities": ["Onion Baskets", "Soybean", "Wheat", "Maize"],
        "unitPricePerMonthPerBag": 7.00,
        "operatingHours": "07:00 AM - 06:00 PM",
        "contactPhone": "02550-267110",
        "isVerified": True
    },
    {
        "name": "CWC Central Logistics Park - Vashi Navi Mumbai",
        "nameTe": "సిడబ్ల్యుసి ఆగ్రో లాజిస్టిక్స్ పార్క్ - వాషి నవీ ముంబై",
        "state": "Maharashtra",
        "district": "Thane",
        "mandal": "Navi Mumbai",
        "address": "Sector 19-C, APMC Market Yard, Vashi - 400703",
        "totalCapacityBags": 120000,
        "availableCapacityBags": 45000,
        "eligibleCommodities": ["Paddy", "Wheat", "Pulses", "Sugar", "Spices"],
        "unitPricePerMonthPerBag": 9.50,
        "operatingHours": "06:00 AM - 08:00 PM",
        "contactPhone": "022-27891230",
        "isVerified": True
    },
    {
        "name": "MSWC Pulses & Oilseed Terminal - Latur",
        "nameTe": "మహారాష్ట్ర పప్పుధాన్యాల వేర్‌హౌస్ - లాతూర్",
        "state": "Maharashtra",
        "district": "Latur",
        "mandal": "Latur",
        "address": "MIDC Industrial Phase 2, Latur - 413512",
        "totalCapacityBags": 62000,
        "availableCapacityBags": 25000,
        "eligibleCommodities": ["Soybean", "Tur", "Urad", "Bengal Gram"],
        "unitPricePerMonthPerBag": 7.20,
        "operatingHours": "08:00 AM - 06:00 PM",
        "contactPhone": "02382-228400",
        "isVerified": True
    },

    # 5. Gujarat
    {
        "name": "GSWC Spices & Seed Warehouse - Unjha",
        "nameTe": "గుజరాత్ స్పైసెస్ గిడ్డంగి - ఉంఝా",
        "state": "Gujarat",
        "district": "Mehsana",
        "mandal": "Unjha",
        "address": "Highway Yard, Unjha, Mehsana - 384170",
        "totalCapacityBags": 70000,
        "availableCapacityBags": 28000,
        "eligibleCommodities": ["Cumin", "Mustard", "Fennel", "Castor Seed"],
        "unitPricePerMonthPerBag": 8.00,
        "operatingHours": "07:30 AM - 06:30 PM",
        "contactPhone": "02767-253400",
        "isVerified": True
    },
    {
        "name": "CWC Cotton & Groundnut Logistics Center - Rajkot",
        "nameTe": "సిడబ్ల్యుసి పత్తి & వేరుశనగ గిడ్డంగి - రాజ్‌కోట్",
        "state": "Gujarat",
        "district": "Rajkot",
        "mandal": "Rajkot",
        "address": "Bedi APMC Yard Road, Rajkot - 360003",
        "totalCapacityBags": 65000,
        "availableCapacityBags": 23000,
        "eligibleCommodities": ["Cotton Bales", "Groundnut", "Sesame", "Wheat"],
        "unitPricePerMonthPerBag": 7.80,
        "operatingHours": "08:00 AM - 06:00 PM",
        "contactPhone": "0281-2708900",
        "isVerified": True
    },

    # 6. Madhya Pradesh
    {
        "name": "MPWLC Central Grain Silos - Choithram Indore",
        "nameTe": "మధ్యప్రదేశ్ వేర్‌హౌస్ - ఇండోర్",
        "state": "Madhya Pradesh",
        "district": "Indore",
        "mandal": "Indore",
        "address": "Mandi Parisar, Choithram, Indore - 452014",
        "totalCapacityBags": 90000,
        "availableCapacityBags": 35000,
        "eligibleCommodities": ["Wheat", "Soybean", "Bengal Gram", "Maize"],
        "unitPricePerMonthPerBag": 7.20,
        "operatingHours": "07:00 AM - 07:00 PM",
        "contactPhone": "0731-2405800",
        "isVerified": True
    },
    {
        "name": "MPWLC Herbal & Spices Warehouse - Neemuch",
        "nameTe": "మధ్యప్రదేశ్ సుగంధ ద్రవ్యాల గిడ్డంగి - నీమచ్",
        "state": "Madhya Pradesh",
        "district": "Neemuch",
        "mandal": "Neemuch",
        "address": "Krishi Upaj Mandi Area, Neemuch - 458441",
        "totalCapacityBags": 50000,
        "availableCapacityBags": 18000,
        "eligibleCommodities": ["Soybean", "Garlic", "Coriander", "Mustard"],
        "unitPricePerMonthPerBag": 7.00,
        "operatingHours": "08:00 AM - 06:00 PM",
        "contactPhone": "07423-229200",
        "isVerified": True
    },

    # 7. Punjab
    {
        "name": "PSWC Mega Wheat & Paddy Silos - Khanna",
        "nameTe": "పంజాబ్ రాష్ట్ర గిడ్డంగుల సంస్థ - ఖన్నా",
        "state": "Punjab",
        "district": "Ludhiana",
        "mandal": "Khanna",
        "address": "GT Road Grain Mandi Hub, Khanna - 141401",
        "totalCapacityBags": 150000,
        "availableCapacityBags": 62000,
        "eligibleCommodities": ["Wheat", "Paddy", "Basmati Rice"],
        "unitPricePerMonthPerBag": 6.50,
        "operatingHours": "06:30 AM - 07:30 PM",
        "contactPhone": "01628-221900",
        "isVerified": True
    },
    {
        "name": "CWC Basmati Logistics Complex - Amritsar",
        "nameTe": "సిడబ్ల్యుసి బాస్మతి వేర్‌హౌస్ - అమృత్‌సర్",
        "state": "Punjab",
        "district": "Amritsar",
        "mandal": "Amritsar",
        "address": "Near Railway Freight Terminal, Amritsar - 143001",
        "totalCapacityBags": 85000,
        "availableCapacityBags": 32000,
        "eligibleCommodities": ["Basmati Rice", "Paddy", "Wheat"],
        "unitPricePerMonthPerBag": 7.00,
        "operatingHours": "07:00 AM - 06:00 PM",
        "contactPhone": "0183-2287100",
        "isVerified": True
    },

    # 8. Haryana
    {
        "name": "HWC State Modern Silos - Karnal",
        "nameTe": "హర్యానా వేర్‌హౌసింగ్ సంస్థ - కర్నాల్",
        "state": "Haryana",
        "district": "Karnal",
        "mandal": "Karnal",
        "address": "New Grain Market Sector 3, Karnal - 132001",
        "totalCapacityBags": 95000,
        "availableCapacityBags": 38000,
        "eligibleCommodities": ["Basmati", "Paddy", "Wheat", "Mustard"],
        "unitPricePerMonthPerBag": 6.70,
        "operatingHours": "07:00 AM - 06:30 PM",
        "contactPhone": "0184-2258900",
        "isVerified": True
    },
    {
        "name": "CWC Grain & Cotton Warehouse - Hisar",
        "nameTe": "సిడబ్ల్యుసి పత్తి & ధాన్యపు వేర్‌హౌస్ - హిసార్",
        "state": "Haryana",
        "district": "Hisar",
        "mandal": "Hisar",
        "address": "Industrial Area, Delhi Road, Hisar - 125001",
        "totalCapacityBags": 65000,
        "availableCapacityBags": 26000,
        "eligibleCommodities": ["Wheat", "Mustard", "Cotton Bales", "Bajra"],
        "unitPricePerMonthPerBag": 6.90,
        "operatingHours": "08:00 AM - 06:00 PM",
        "contactPhone": "01662-234800",
        "isVerified": True
    },

    # 9. Rajasthan
    {
        "name": "RSWC Agro Storage Facility - Kota",
        "nameTe": "రాజస్థాన్ వేర్‌హౌస్ సంస్థ - కోట",
        "state": "Rajasthan",
        "district": "Kota",
        "mandal": "Kota",
        "address": "Bhamashah Krishi Mandi Road, Kota - 324005",
        "totalCapacityBags": 90000,
        "availableCapacityBags": 36000,
        "eligibleCommodities": ["Soybean", "Mustard", "Wheat", "Coriander"],
        "unitPricePerMonthPerBag": 6.80,
        "operatingHours": "07:00 AM - 06:30 PM",
        "contactPhone": "0744-2498200",
        "isVerified": True
    },
    {
        "name": "CWC Oilseed & Guar Gum Warehouse - Jodhpur",
        "nameTe": "సిడబ్ల్యుసి గ్వార్ గమ్ & నూనెగింజల గిడ్డంగి - జోధ్‌పూర్",
        "state": "Rajasthan",
        "district": "Jodhpur",
        "mandal": "Jodhpur",
        "address": "Basni Industrial Area, Jodhpur - 342005",
        "totalCapacityBags": 70000,
        "availableCapacityBags": 27000,
        "eligibleCommodities": ["Bajra", "Moong", "Guar Seed", "Mustard"],
        "unitPricePerMonthPerBag": 7.10,
        "operatingHours": "08:00 AM - 06:00 PM",
        "contactPhone": "0291-2741200",
        "isVerified": True
    },

    # 10. Tamil Nadu
    {
        "name": "TNWC Modern Spices Warehouse - Erode",
        "nameTe": "తమిళనాడు వేర్‌హౌస్ సంస్థ - ఈరోడ్ పసుపు గిడ్డంగి",
        "state": "Tamil Nadu",
        "district": "Erode",
        "mandal": "Perundurai",
        "address": "SIPCOT Industrial Complex, Perundurai, Erode - 638052",
        "totalCapacityBags": 60000,
        "availableCapacityBags": 24000,
        "eligibleCommodities": ["Turmeric", "Paddy", "Coconut", "Groundnut"],
        "unitPricePerMonthPerBag": 7.50,
        "operatingHours": "07:30 AM - 06:00 PM",
        "contactPhone": "0424-2259100",
        "isVerified": True
    },
    {
        "name": "CWC Multi-Storage Terminal - Coimbatore",
        "nameTe": "సిడబ్ల్యుసి మల్టీ-స్టోరేజ్ టెర్మినల్ - కోయంబత్తూర్",
        "state": "Tamil Nadu",
        "district": "Coimbatore",
        "mandal": "Coimbatore",
        "address": "Peelamedu Goods Shed Road, Coimbatore - 641004",
        "totalCapacityBags": 75000,
        "availableCapacityBags": 29000,
        "eligibleCommodities": ["Cotton Bales", "Paddy", "Pulses", "Spices"],
        "unitPricePerMonthPerBag": 8.00,
        "operatingHours": "08:00 AM - 06:30 PM",
        "contactPhone": "0422-2578100",
        "isVerified": True
    },

    # 11. Uttar Pradesh
    {
        "name": "UPWC Mega Food Grain Complex - Muzaffarnagar",
        "nameTe": "ఉత్తర ప్రదేశ్ వేర్‌హౌస్ - ముజఫర్‌నగర్",
        "state": "Uttar Pradesh",
        "district": "Muzaffarnagar",
        "mandal": "Muzaffarnagar",
        "address": "Naveen Mandi Sthal Road, Muzaffarnagar - 251001",
        "totalCapacityBags": 100000,
        "availableCapacityBags": 41000,
        "eligibleCommodities": ["Wheat", "Sugarcane Jaggery", "Mustard", "Paddy"],
        "unitPricePerMonthPerBag": 6.80,
        "operatingHours": "07:00 AM - 07:00 PM",
        "contactPhone": "0131-2438900",
        "isVerified": True
    },
    {
        "name": "CWC Potato Cold Storage & Grain Silo - Agra",
        "nameTe": "సిడబ్ల్యుసి బంగాళాదుంప కోల్డ్ స్టోరేజ్ - ఆగ్రా",
        "state": "Uttar Pradesh",
        "district": "Agra",
        "mandal": "Agra",
        "address": "Foundry Nagar Industrial Area, Agra - 282006",
        "totalCapacityBags": 80000,
        "availableCapacityBags": 31000,
        "eligibleCommodities": ["Potato Baskets", "Wheat", "Mustard", "Paddy"],
        "unitPricePerMonthPerBag": 7.50,
        "operatingHours": "07:30 AM - 06:30 PM",
        "contactPhone": "0562-2281900",
        "isVerified": True
    },

    # 12. Bihar
    {
        "name": "BSWC State Central Warehouse - Patna",
        "nameTe": "బీహార్ వేర్‌హౌసింగ్ సంస్థ - పాట్నా",
        "state": "Bihar",
        "district": "Patna",
        "mandal": "Patna",
        "address": "Digha Ghat Industrial Road, Patna - 800011",
        "totalCapacityBags": 85000,
        "availableCapacityBags": 34000,
        "eligibleCommodities": ["Paddy", "Wheat", "Maize", "Pulses"],
        "unitPricePerMonthPerBag": 6.60,
        "operatingHours": "07:30 AM - 06:30 PM",
        "contactPhone": "0612-2268100",
        "isVerified": True
    },
    {
        "name": "CWC Grain & Maize Silos - Muzaffarpur",
        "nameTe": "సిడబ్ల్యుసి మొక్కజొన్న వేర్‌హౌస్ - ముజఫర్‌పూర్",
        "state": "Bihar",
        "district": "Muzaffarpur",
        "mandal": "Muzaffarpur",
        "address": "Bela Industrial Estate, Muzaffarpur - 842005",
        "totalCapacityBags": 65000,
        "availableCapacityBags": 26000,
        "eligibleCommodities": ["Maize", "Paddy", "Wheat", "Litchi Boxes"],
        "unitPricePerMonthPerBag": 6.70,
        "operatingHours": "08:00 AM - 06:00 PM",
        "contactPhone": "0621-2274100",
        "isVerified": True
    },

    # 13. West Bengal
    {
        "name": "WBSWC Paddy & Jute Mega Storage - Burdwan",
        "nameTe": "పశ్చిమ బెంగాల్ వేర్‌హౌస్ - బర్ద్వాన్ వరి నిల్వ",
        "state": "West Bengal",
        "district": "Burdwan",
        "mandal": "Burdwan",
        "address": "Memari Industrial Area, Burdwan - 713146",
        "totalCapacityBags": 110000,
        "availableCapacityBags": 44000,
        "eligibleCommodities": ["Paddy", "Rice", "Potato", "Jute Bales"],
        "unitPricePerMonthPerBag": 6.90,
        "operatingHours": "07:00 AM - 07:00 PM",
        "contactPhone": "0342-2258100",
        "isVerified": True
    },

    # 14. Odisha
    {
        "name": "OSWC Grain & Paddy Storage - Bargarh",
        "nameTe": "ఒడిశా వేర్‌హౌసింగ్ సంస్థ - బర్‌గఢ్ (వరి బౌల్)",
        "state": "Odisha",
        "district": "Bargarh",
        "mandal": "Bargarh",
        "address": "Attabira Road, Bargarh - 768028",
        "totalCapacityBags": 75000,
        "availableCapacityBags": 30000,
        "eligibleCommodities": ["Paddy", "Pulses", "Groundnut"],
        "unitPricePerMonthPerBag": 6.50,
        "operatingHours": "07:30 AM - 06:00 PM",
        "contactPhone": "06646-234100",
        "isVerified": True
    },

    # 15. Kerala
    {
        "name": "KSWC Spices & Plantation Warehouse - Wayanad",
        "nameTe": "కేరళ స్పైసెస్ గిడ్డంగి - వాయనాడ్",
        "state": "Kerala",
        "district": "Wayanad",
        "mandal": "Kalpetta",
        "address": "APMC Road, Kalpetta, Wayanad - 673121",
        "totalCapacityBags": 40000,
        "availableCapacityBags": 16000,
        "eligibleCommodities": ["Pepper", "Cardamom", "Ginger", "Coffee Beans", "Paddy"],
        "unitPricePerMonthPerBag": 8.50,
        "operatingHours": "08:00 AM - 05:30 PM",
        "contactPhone": "04936-202100",
        "isVerified": True
    },

    # 16. Assam
    {
        "name": "ASWC Tea & Grain Storage Unit - Kamrup Guwahati",
        "nameTe": "అస్సాం వేర్‌హౌస్ - కామరూప్ గౌహతి",
        "state": "Assam",
        "district": "Kamrup",
        "mandal": "Guwahati",
        "address": "Amingaon Industrial Park, Guwahati - 781031",
        "totalCapacityBags": 60000,
        "availableCapacityBags": 24000,
        "eligibleCommodities": ["Paddy", "Tea Chests", "Jute", "Mustard"],
        "unitPricePerMonthPerBag": 7.40,
        "operatingHours": "08:00 AM - 06:00 PM",
        "contactPhone": "0361-2681400",
        "isVerified": True
    },

    # 17. Chhattisgarh
    {
        "name": "CGSWC Modern Rice Silos - Raipur",
        "nameTe": "ఛత్తీస్‌గఢ్ వేర్‌హౌసింగ్ సంస్థ - రాయ్‌పూర్",
        "state": "Chhattisgarh",
        "district": "Raipur",
        "mandal": "Raipur",
        "address": "Bhanpuri Industrial Area, Raipur - 492003",
        "totalCapacityBags": 80000,
        "availableCapacityBags": 32000,
        "eligibleCommodities": ["Paddy", "Rice", "Maize", "Soybean"],
        "unitPricePerMonthPerBag": 6.50,
        "operatingHours": "07:30 AM - 06:30 PM",
        "contactPhone": "0771-2489100",
        "isVerified": True
    },

    # 18. Jharkhand
    {
        "name": "JSWC Agro Produce Terminal - Ranchi",
        "nameTe": "జార్ఖండ్ వేర్‌హౌస్ సంస్థ - రాంచీ",
        "state": "Jharkhand",
        "district": "Ranchi",
        "mandal": "Ranchi",
        "address": "Tupudana Industrial Estate, Ranchi - 834003",
        "totalCapacityBags": 50000,
        "availableCapacityBags": 20000,
        "eligibleCommodities": ["Paddy", "Maize", "Vegetables", "Pulses"],
        "unitPricePerMonthPerBag": 6.80,
        "operatingHours": "08:00 AM - 06:00 PM",
        "contactPhone": "0651-2258400",
        "isVerified": True
    },

    # 19. Uttarakhand
    {
        "name": "UKSWC Grain & Basmati Warehouse - Udham Singh Nagar",
        "nameTe": "ఉత్తరాఖండ్ వేర్‌హౌస్ - ఉధమ్ సింగ్ నగర్",
        "state": "Uttarakhand",
        "district": "Udham Singh Nagar",
        "mandal": "Rudrapur",
        "address": "SIDCUL Industrial Area, Rudrapur - 263153",
        "totalCapacityBags": 65000,
        "availableCapacityBags": 26000,
        "eligibleCommodities": ["Basmati", "Wheat", "Paddy", "Sugarcane"],
        "unitPricePerMonthPerBag": 6.90,
        "operatingHours": "08:00 AM - 06:00 PM",
        "contactPhone": "05944-245100",
        "isVerified": True
    },

    # 20. Himachal Pradesh
    {
        "name": "HPSWC Apple CA Cold Store - Shimla",
        "nameTe": "హిమాచల్ ఆపిల్ కోల్డ్ స్టోరేజ్ - సిమ్లా",
        "state": "Himachal Pradesh",
        "district": "Shimla",
        "mandal": "Kotkhai",
        "address": "HPMC CA Complex, Parwanoo / Shimla - 171202",
        "totalCapacityBags": 45000,
        "availableCapacityBags": 17000,
        "eligibleCommodities": ["Apple Crates", "Stone Fruits", "Potato"],
        "unitPricePerMonthPerBag": 9.20,
        "operatingHours": "08:00 AM - 06:00 PM",
        "contactPhone": "0177-2804100",
        "isVerified": True
    },

    # 21. Jammu & Kashmir
    {
        "name": "CWC Cold Chain Terminal - Srinagar",
        "nameTe": "సిడబ్ల్యుసి ఆపిల్ కోల్డ్ చైన్ - శ్రీనగర్",
        "state": "Jammu & Kashmir",
        "district": "Srinagar",
        "mandal": "Parimpora",
        "address": "Fruit Mandi Complex, Parimpora, Srinagar - 190017",
        "totalCapacityBags": 50000,
        "availableCapacityBags": 19000,
        "eligibleCommodities": ["Apple Boxes", "Walnuts", "Saffron", "Almonds"],
        "unitPricePerMonthPerBag": 9.50,
        "operatingHours": "08:00 AM - 05:30 PM",
        "contactPhone": "0194-2498100",
        "isVerified": True
    },

    # 22. Delhi
    {
        "name": "CWC Food Grain Terminal - Narela Delhi",
        "nameTe": "సిడబ్ల్యుసి ఫుడ్ గ్రెయిన్ టెర్మినల్ - నరేలా ఢిల్లీ",
        "state": "Delhi",
        "district": "North Delhi",
        "mandal": "Narela",
        "address": "DSIDC Industrial Complex, Narela, Delhi - 110040",
        "totalCapacityBags": 110000,
        "availableCapacityBags": 42000,
        "eligibleCommodities": ["Wheat", "Rice", "Pulses", "Sugar", "Spices"],
        "unitPricePerMonthPerBag": 9.00,
        "operatingHours": "06:00 AM - 08:00 PM",
        "contactPhone": "011-27781450",
        "isVerified": True
    }
]

ALL_INDIA_MARKETS: List[Dict[str, Any]] = [
    # 1. Andhra Pradesh
    {
        "name": "Kurnool Agricultural Market Yard (AMC)",
        "nameTe": "కర్నూలు వ్యవసాయ మార్కెట్ యార్డు (AMC)",
        "state": "Andhra Pradesh",
        "district": "Kurnool",
        "mandal": "Kurnool Urban",
        "location": "Near Nandyal Checkpost, Bellary Road, Kurnool",
        "operatingHours": "06:00 AM - 06:00 PM",
        "commoditiesSupported": ["Cotton", "Chilli", "Onion", "Bengal Gram", "Groundnut", "Paddy", "Maize", "Castor"],
        "maxDailyVehicles": 150,
        "contactPhone": "08518-220145",
        "isActive": True
    },
    {
        "name": "Adoni Market Yard (Cotton Hub)",
        "nameTe": "ఆదోని మార్కెట్ యార్డు (పత్తి హబ్)",
        "state": "Andhra Pradesh",
        "district": "Kurnool",
        "mandal": "Adoni",
        "location": "Yemmiganur Road, Adoni",
        "operatingHours": "06:00 AM - 05:00 PM",
        "commoditiesSupported": ["Cotton", "Groundnut", "Castor", "Sunflower"],
        "maxDailyVehicles": 200,
        "contactPhone": "08512-252110",
        "isActive": True
    },
    {
        "name": "Nandyal Market Yard",
        "nameTe": "నంద్యాల మార్కెట్ యార్డు",
        "state": "Andhra Pradesh",
        "district": "Nandyal",
        "mandal": "Nandyal",
        "location": "Sanjiva Nagar, Nandyal",
        "operatingHours": "07:00 AM - 06:00 PM",
        "commoditiesSupported": ["Paddy", "Bengal Gram", "Maize", "Jowar"],
        "maxDailyVehicles": 120,
        "contactPhone": "08514-245330",
        "isActive": True
    },
    {
        "name": "Guntur Chilli Yard (Asia's Largest Chilli Hub)",
        "nameTe": "గుంటూరు మిర్చి యార్డు (ఆసియా అతిపెద్ద మిర్చి మార్కెట్)",
        "state": "Andhra Pradesh",
        "district": "Guntur",
        "mandal": "Guntur Urban",
        "location": "Autonagar, GT Road, Guntur",
        "operatingHours": "05:00 AM - 07:00 PM",
        "commoditiesSupported": ["Chilli", "Cotton", "Turmeric", "Tobacco"],
        "maxDailyVehicles": 350,
        "contactPhone": "0863-2234500",
        "isActive": True
    },
    {
        "name": "Anantapur Groundnut & Millet APMC",
        "nameTe": "అనంతపురం వేరుశనగ మార్కెట్ యార్డు",
        "state": "Andhra Pradesh",
        "district": "Anantapur",
        "mandal": "Anantapur",
        "location": "Bellary Bypass Road, Anantapur",
        "operatingHours": "07:00 AM - 05:00 PM",
        "commoditiesSupported": ["Groundnut", "Millets", "Castor", "Sunflower"],
        "maxDailyVehicles": 180,
        "contactPhone": "08554-278120",
        "isActive": True
    },

    # 2. Telangana
    {
        "name": "Enumamula Agricultural Market Yard (Warangal)",
        "nameTe": "ఎనుమాముల వ్యవసాయ మార్కెట్ యార్డు (వరంగల్)",
        "state": "Telangana",
        "district": "Warangal",
        "mandal": "Enumamula",
        "location": "Enumamula, Warangal",
        "operatingHours": "06:00 AM - 06:00 PM",
        "commoditiesSupported": ["Cotton", "Paddy", "Chilli", "Maize", "Turmeric"],
        "maxDailyVehicles": 400,
        "contactPhone": "0870-2441200",
        "isActive": True
    },
    {
        "name": "Nizamabad Turmeric & Grains APMC",
        "nameTe": "నిజామాబాద్ పసుపు మార్కెట్ యార్డు",
        "state": "Telangana",
        "district": "Nizamabad",
        "mandal": "Nizamabad",
        "location": "Armoor Road, Nizamabad",
        "operatingHours": "07:00 AM - 06:00 PM",
        "commoditiesSupported": ["Turmeric", "Paddy", "Soybean", "Maize"],
        "maxDailyVehicles": 200,
        "contactPhone": "08462-221800",
        "isActive": True
    },
    {
        "name": "Bowenpally Agricultural Market Yard",
        "nameTe": "బోయిన్‌పల్లి వ్యవసాయ మార్కెట్ యార్డు",
        "state": "Telangana",
        "district": "Hyderabad",
        "mandal": "Secunderabad",
        "location": "Bowenpally, Secunderabad, Hyderabad",
        "operatingHours": "04:00 AM - 06:00 PM",
        "commoditiesSupported": ["Vegetables", "Onion", "Potato", "Fruits"],
        "maxDailyVehicles": 300,
        "contactPhone": "040-27751230",
        "isActive": True
    },

    # 3. Karnataka
    {
        "name": "Raichur Cotton & Grains APMC Yard",
        "nameTe": "రాయచూర్ పత్తి & వరి మార్కెట్ యార్డు",
        "state": "Karnataka",
        "district": "Raichur",
        "mandal": "Raichur",
        "location": "Station Road, Raichur",
        "operatingHours": "06:00 AM - 06:00 PM",
        "commoditiesSupported": ["Cotton", "Paddy", "Groundnut", "Bengal Gram"],
        "maxDailyVehicles": 220,
        "contactPhone": "08532-238410",
        "isActive": True
    },
    {
        "name": "Hubli-Dharwad Commercial APMC",
        "nameTe": "హుబ్లీ-ధార్వాడ్ ఎపిఎంసి యార్డు",
        "state": "Karnataka",
        "district": "Dharwad",
        "mandal": "Hubli",
        "location": "Amargol, Hubli",
        "operatingHours": "07:00 AM - 06:00 PM",
        "commoditiesSupported": ["Cotton", "Chilli", "Onion", "Maize"],
        "maxDailyVehicles": 250,
        "contactPhone": "0836-2223400",
        "isActive": True
    },

    # 4. Maharashtra
    {
        "name": "Lasalgaon Onion APMC (Asia's Largest Onion Market)",
        "nameTe": "లసల్‌గావ్ ఉల్లిపాయ మార్కెట్ యార్డు",
        "state": "Maharashtra",
        "district": "Nashik",
        "mandal": "Niphad",
        "location": "Lasalgaon, Nashik",
        "operatingHours": "06:00 AM - 05:00 PM",
        "commoditiesSupported": ["Onion", "Tomato", "Grapes", "Soybean"],
        "maxDailyVehicles": 500,
        "contactPhone": "02550-266020",
        "isActive": True
    },
    {
        "name": "Vashi Navi Mumbai Central APMC",
        "nameTe": "వాషి నవీ ముంబై సెంట్రల్ ఎపిఎంసి",
        "state": "Maharashtra",
        "district": "Thane",
        "mandal": "Navi Mumbai",
        "location": "Sector 19, Vashi, Navi Mumbai",
        "operatingHours": "05:00 AM - 08:00 PM",
        "commoditiesSupported": ["Grains", "Pulses", "Spices", "Onion", "Potato"],
        "maxDailyVehicles": 600,
        "contactPhone": "022-27881000",
        "isActive": True
    },

    # 5. Gujarat
    {
        "name": "Unjha APMC Yard (Spices Capital)",
        "nameTe": "ఉంఝా జీలకర్ర & సుగంధ ద్రవ్యాల మార్కెట్",
        "state": "Gujarat",
        "district": "Mehsana",
        "mandal": "Unjha",
        "location": "APMC Yard, Unjha",
        "operatingHours": "07:00 AM - 06:00 PM",
        "commoditiesSupported": ["Cumin", "Fennel", "Mustard", "Isabgol", "Castor"],
        "maxDailyVehicles": 350,
        "contactPhone": "02767-252100",
        "isActive": True
    },
    {
        "name": "Rajkot Cotton & Groundnut Mandi",
        "nameTe": "రాజ్‌కోట్ పత్తి & వేరుశనగ మార్కెట్",
        "state": "Gujarat",
        "district": "Rajkot",
        "mandal": "Rajkot",
        "location": "Bedi Yard, Rajkot",
        "operatingHours": "06:00 AM - 06:00 PM",
        "commoditiesSupported": ["Cotton", "Groundnut", "Sesame", "Wheat"],
        "maxDailyVehicles": 280,
        "contactPhone": "0281-2701400",
        "isActive": True
    },

    # 6. Madhya Pradesh
    {
        "name": "Indore Choithram Mandi",
        "nameTe": "ఇండోర్ చోయిత్‌రామ్ మార్కెట్",
        "state": "Madhya Pradesh",
        "district": "Indore",
        "mandal": "Indore",
        "location": "Choithram Square, Indore",
        "operatingHours": "05:00 AM - 07:00 PM",
        "commoditiesSupported": ["Soybean", "Wheat", "Potato", "Onion", "Garlic"],
        "maxDailyVehicles": 450,
        "contactPhone": "0731-2401200",
        "isActive": True
    },

    # 7. Punjab
    {
        "name": "Khanna Grain Market (Asia's Largest Grain Mandi)",
        "nameTe": "ఖన్నా ధాన్యపు మార్కెట్ (ఆసియా అతిపెద్ద ధాన్యపు మండీ)",
        "state": "Punjab",
        "district": "Ludhiana",
        "mandal": "Khanna",
        "location": "GT Road, Khanna, Ludhiana",
        "operatingHours": "06:00 AM - 07:00 PM",
        "commoditiesSupported": ["Wheat", "Paddy", "Basmati", "Maize"],
        "maxDailyVehicles": 600,
        "contactPhone": "01628-220450",
        "isActive": True
    },

    # 8. Haryana
    {
        "name": "Karnal Basmati Rice APMC Mandi",
        "nameTe": "కర్నాల్ బాస్మతి బియ్యం మార్కెట్",
        "state": "Haryana",
        "district": "Karnal",
        "mandal": "Karnal",
        "location": "Sector 3, New Grain Market, Karnal",
        "operatingHours": "06:00 AM - 06:00 PM",
        "commoditiesSupported": ["Basmati", "Paddy", "Wheat", "Mustard"],
        "maxDailyVehicles": 350,
        "contactPhone": "0184-2251200",
        "isActive": True
    },

    # 9. Rajasthan
    {
        "name": "Kota Bhamashah Krishi Upaj Mandi",
        "nameTe": "కోట భామాషా వ్యవసాయ మండీ",
        "state": "Rajasthan",
        "district": "Kota",
        "mandal": "Kota",
        "location": "Anantpura, Kota",
        "operatingHours": "06:00 AM - 06:00 PM",
        "commoditiesSupported": ["Soybean", "Mustard", "Wheat", "Paddy", "Coriander"],
        "maxDailyVehicles": 400,
        "contactPhone": "0744-2490100",
        "isActive": True
    },

    # 10. Tamil Nadu
    {
        "name": "Erode Turmeric & Agri Market Complex",
        "nameTe": "ఈరోడ్ పసుపు & వ్యవసాయ మార్కెట్",
        "state": "Tamil Nadu",
        "district": "Erode",
        "mandal": "Perundurai",
        "location": "Semmampalayam, Erode",
        "operatingHours": "07:00 AM - 05:00 PM",
        "commoditiesSupported": ["Turmeric", "Paddy", "Coconut", "Groundnut"],
        "maxDailyVehicles": 250,
        "contactPhone": "0424-2258400",
        "isActive": True
    },

    # 11. Uttar Pradesh
    {
        "name": "Muzaffarnagar Gur & Wheat Mandi",
        "nameTe": "ముజఫర్‌నగర్ బెల్లం & గోధుమ మండీ",
        "state": "Uttar Pradesh",
        "district": "Muzaffarnagar",
        "mandal": "Muzaffarnagar",
        "location": "Naveen Mandi Sthal, Muzaffarnagar",
        "operatingHours": "06:00 AM - 06:00 PM",
        "commoditiesSupported": ["Wheat", "Sugarcane", "Jaggery (Gur)", "Mustard"],
        "maxDailyVehicles": 380,
        "contactPhone": "0131-2432800",
        "isActive": True
    },

    # 12. Bihar
    {
        "name": "Patna Agricultural Produce Market",
        "nameTe": "పాట్నా వ్యవసాయ మార్కెట్ యార్డు",
        "state": "Bihar",
        "district": "Patna",
        "mandal": "Patna",
        "location": "Bazar Samiti, Musallahpur, Patna",
        "operatingHours": "06:00 AM - 06:00 PM",
        "commoditiesSupported": ["Paddy", "Wheat", "Maize", "Pulses", "Potato"],
        "maxDailyVehicles": 320,
        "contactPhone": "0612-2261200",
        "isActive": True
    },

    # 13. West Bengal
    {
        "name": "Burdwan Rice & Grains APMC",
        "nameTe": "బర్ద్వాన్ వరి & ధాన్యపు మార్కెట్",
        "state": "West Bengal",
        "district": "Burdwan",
        "mandal": "Burdwan",
        "location": "Grain Mandi Hub, Burdwan",
        "operatingHours": "06:30 AM - 06:00 PM",
        "commoditiesSupported": ["Paddy", "Rice", "Potato", "Jute", "Mustard"],
        "maxDailyVehicles": 360,
        "contactPhone": "0342-2251400",
        "isActive": True
    },

    # 14. Odisha
    {
        "name": "Bargarh Regulated Market Committee (RMC)",
        "nameTe": "బర్‌గఢ్ వ్యవసాయ మార్కెట్ యార్డు",
        "state": "Odisha",
        "district": "Bargarh",
        "mandal": "Bargarh",
        "location": "RMC Complex, Bargarh",
        "operatingHours": "07:00 AM - 05:30 PM",
        "commoditiesSupported": ["Paddy", "Rice", "Groundnut", "Pulses"],
        "maxDailyVehicles": 260,
        "contactPhone": "06646-234200",
        "isActive": True
    },

    # 15. Kerala
    {
        "name": "Kalpetta Spices & Plantation APMC",
        "nameTe": "కల్పట్టా సుగంధ ద్రవ్యాల మార్కెట్",
        "state": "Kerala",
        "district": "Wayanad",
        "mandal": "Kalpetta",
        "location": "Kalpetta Market Yard, Wayanad",
        "operatingHours": "07:30 AM - 05:00 PM",
        "commoditiesSupported": ["Pepper", "Cardamom", "Ginger", "Coffee Beans"],
        "maxDailyVehicles": 150,
        "contactPhone": "04936-202400",
        "isActive": True
    },

    # 16. Assam
    {
        "name": "Guwahati Central Agricultural Market",
        "nameTe": "గౌహతి సెంట్రల్ వ్యవసాయ మార్కెట్",
        "state": "Assam",
        "district": "Kamrup",
        "mandal": "Guwahati",
        "location": "Pamohi, Garchuk, Guwahati",
        "operatingHours": "05:00 AM - 05:00 PM",
        "commoditiesSupported": ["Paddy", "Tea", "Jute", "Mustard", "Vegetables"],
        "maxDailyVehicles": 280,
        "contactPhone": "0361-2682100",
        "isActive": True
    },

    # 17. Chhattisgarh
    {
        "name": "Raipur Krishi Upaj Mandi",
        "nameTe": "రాయ్‌పూర్ వ్యవసాయ మార్కెట్",
        "state": "Chhattisgarh",
        "district": "Raipur",
        "mandal": "Raipur",
        "location": "Pandri Mandi Road, Raipur",
        "operatingHours": "06:30 AM - 06:00 PM",
        "commoditiesSupported": ["Paddy", "Rice", "Maize", "Pulses"],
        "maxDailyVehicles": 310,
        "contactPhone": "0771-2481200",
        "isActive": True
    },

    # 18. Jharkhand
    {
        "name": "Ranchi Bazar Samiti APMC",
        "nameTe": "రాంచీ బజార్ సమితి మార్కెట్",
        "state": "Jharkhand",
        "district": "Ranchi",
        "mandal": "Ranchi",
        "location": "Pandra, Ratu Road, Ranchi",
        "operatingHours": "06:00 AM - 06:00 PM",
        "commoditiesSupported": ["Paddy", "Maize", "Vegetables", "Tomato"],
        "maxDailyVehicles": 240,
        "contactPhone": "0651-2251200",
        "isActive": True
    },

    # 19. Uttarakhand
    {
        "name": "Rudrapur Krishi Mandi Yard",
        "nameTe": "రుద్రపూర్ వ్యవసాయ మార్కెట్",
        "state": "Uttarakhand",
        "district": "Udham Singh Nagar",
        "mandal": "Rudrapur",
        "location": "Kashipur Bypass, Rudrapur",
        "operatingHours": "07:00 AM - 06:00 PM",
        "commoditiesSupported": ["Wheat", "Paddy", "Basmati", "Sugarcane"],
        "maxDailyVehicles": 290,
        "contactPhone": "05944-245800",
        "isActive": True
    },

    # 20. Himachal Pradesh
    {
        "name": "Shimla Apple & Fruit APMC Yard",
        "nameTe": "సిమ్లా ఆపిల్ & పండ్ల మార్కెట్",
        "state": "Himachal Pradesh",
        "district": "Shimla",
        "mandal": "Shimla",
        "location": "Bhattakufer Fruit Mandi, Shimla",
        "operatingHours": "05:00 AM - 06:00 PM",
        "commoditiesSupported": ["Apple", "Stone Fruits", "Potato", "Garlic"],
        "maxDailyVehicles": 420,
        "contactPhone": "0177-2805200",
        "isActive": True
    },

    # 21. Jammu & Kashmir
    {
        "name": "Parimpora Fruit & Agri Terminal (Srinagar)",
        "nameTe": "పరింపొర పండ్ల మార్కెట్ (శ్రీనగర్)",
        "state": "Jammu & Kashmir",
        "district": "Srinagar",
        "mandal": "Parimpora",
        "location": "National Highway Bypass, Parimpora, Srinagar",
        "operatingHours": "06:00 AM - 06:00 PM",
        "commoditiesSupported": ["Apple", "Walnut", "Almond", "Saffron", "Paddy"],
        "maxDailyVehicles": 450,
        "contactPhone": "0194-2495100",
        "isActive": True
    },

    # 22. Delhi
    {
        "name": "Azadpur Wholesale Mandi (Asia's Largest F&V Market)",
        "nameTe": "ఆజాద్‌పూర్ హోల్‌సేల్ మార్కెట్ (ఢిల్లీ)",
        "state": "Delhi",
        "district": "North Delhi",
        "mandal": "Azadpur",
        "location": "Azadpur, New Delhi",
        "operatingHours": "04:00 AM - 08:00 PM",
        "commoditiesSupported": ["Fruits", "Vegetables", "Onion", "Potato", "Apple"],
        "maxDailyVehicles": 800,
        "contactPhone": "011-27671200",
        "isActive": True
    }
]
