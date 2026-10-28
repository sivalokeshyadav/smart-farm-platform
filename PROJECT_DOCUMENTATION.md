# Smart Farmer Platform — Complete Project Documentation & User Guide

**Project Repository:** `smart-farm-platform`  
**Target Region:** Kurnool District, Andhra Pradesh (Rayalaseema Pilot) & All-India APMC Integration  
**Technical Architecture:** FastAPI (Python 3.11+) Backend + React 18 / TypeScript / Chakra UI Frontend + MongoDB Database  

---

## Table of Contents
1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [How to Run the Project Locally](#2-how-to-run-the-project-locally)
3. [User Accounts, Roles & Authentication](#3-user-accounts-roles--authentication)
   - [Default Credentials & Quick Login](#default-credentials--quick-login)
   - [All 14 Demo Accounts Table](#all-14-demo-accounts-table)
   - [Login Methods (Password & OTP)](#login-methods-password--otp)
   - [Multi-Role Switching & Privileged Approvals](#multi-role-switching--privileged-approvals)
4. [What Different Users See (Role-Based Access Control)](#4-what-different-users-see-role-based-access-control)
   - [Role Matrix & Permission Table](#role-matrix--permission-table)
   - [Detailed Experience by Role](#detailed-experience-by-role)
5. [Mandi Slot Booking & Token Lifecycle](#5-mandi-slot-booking--token-lifecycle)
   - [Farmer Booking Workflow](#farmer-booking-workflow)
   - [QR Code Entry Pass](#qr-code-entry-pass)
   - [Gate Verification & Status Transitions](#gate-verification--status-transitions)
6. [Godown Storage Reservation System](#6-godown-storage-reservation-system)
   - [Warehouse Space Reservation](#warehouse-space-reservation)
   - [WDRA Accreditation & e-NWR Receipt](#wdra-accreditation--e-nwr-receipt)
7. [Agri Calculators & Land Measurement](#7-agri-calculators--land-measurement)
   - [GPS Land Area & Boundary Measurement](#gps-land-area--boundary-measurement)
   - [Fencing Estimation & Material Breakdown](#fencing-estimation--material-breakdown)
   - [Land Unit Converter (Cents, Guntas, Acres)](#land-unit-converter-cents-guntas-acres)
   - [Seed & Fertilizer Requirement Calculator](#seed--fertilizer-requirement-calculator)
   - [Yield, Cost & Profit Margin Calculator](#yield-cost--profit-margin-calculator)
8. [Additional Integrated Platform Modules](#8-additional-integrated-platform-modules)
   - [Daily Mandi Prices & MSP Radar](#daily-mandi-prices--msp-radar)
   - [Crop Health AI Screening](#crop-health-ai-screening)
   - [Field Services & Veterinary Appointments](#field-services--veterinary-appointments)
   - [Government Schemes & Subsidies](#government-schemes--subsidies)
   - [Interactive Phone / IVR Simulator](#interactive-phone--ivr-simulator)
   - [Admin Oversight & Capacity Control](#admin-oversight--capacity-control)
   - [Customer Support & Grievance Redressal](#customer-support--grievance-redressal)
9. [REST API Directory](#9-rest-api-directory)
10. [Troubleshooting & FAQ](#10-troubleshooting--faq)

---

## 1. Project Overview & Architecture

The **Smart Farmer Platform** is a unified, inclusive digital agriculture ecosystem designed to eliminate congestion at APMC regulated market yards (*mandis*), democratize scientific farm calculation tools, streamline warehouse storage (*godowns*), connect farmers with licensed inputs and veterinarians, and bridge the digital divide through multilingual support and phone IVR access.

```
                           +-------------------------------------+
                           |    Web Browser / Mobile PWA / IVR   |
                           +-------------------------------------+
                                              |
                       HTTP / REST (JSON)     |     Phone DTMF / XML
                                              v
                           +-------------------------------------+
                           |       FastAPI Backend Server        |
                           |       (Port 8001: /api/v1)          |
                           +-------------------------------------+
                             |         |           |          |
            +----------------+         |           |          +----------------+
            v                          v           v                           v
     [ Auth & RBAC ]           [ Calculators ]  [ Bookings & Godowns ]    [ Field & Admin ]
     - JWT & Sessions          - Shoelace GPS   - Atomic Reservations     - Vet Appointments
     - OTP Simulation          - Haversine Dist - Status Timelines        - Role Approvals
     - Role Gates              - ANGRAU Norms   - QR Code Verification    - Feedback System
            \                          |           |                           /
             +-------------------------+-----------+--------------------------+
                                       |
                                       v
                           +-------------------------------------+
                           |         MongoDB Database            |
                           |    (Collections: users, bookings,   |
                           |     godowns, field_services, etc.)  |
                           +-------------------------------------+
```

### Key Technology Stack:
- **Backend**: Python 3.11+, FastAPI, Motor (Async MongoDB Driver), Pydantic v2, PyJWT, Passlib (bcrypt).
- **Frontend**: React 18, TypeScript, Chakra UI, Vite, Redux Toolkit & RTK Query, Lucide Icons, jsQR (browser QR scanner).
- **Database**: MongoDB (Local or MongoDB Atlas Cluster).
- **Telephony & Inclusive Access**: TwiML-compatible IVR simulator for feature-phone users.

---

## 2. How to Run the Project Locally

To run the platform locally on Windows PowerShell, follow these steps:

### Step 1: Start Backend
```powershell
# Navigate to backend directory
cd c:\Users\rajas\Downloads\Farm\backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# (Optional - First time setup) Seed demo users, markets, and godowns
python scripts/seed.py

# Launch FastAPI with auto-reload on port 8001
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
*Backend Swagger API Documentation:* `http://127.0.0.1:8001/docs`

### Step 2: Start Frontend
Open a second PowerShell window:
```powershell
# Navigate to frontend directory
cd c:\Users\rajas\Downloads\Farm\frontend

# Install dependencies if not already done
npm install

# Start Vite dev server
npm run dev -- --host
```
*Frontend Application URL:* `http://localhost:5173`

---

## 3. User Accounts, Roles & Authentication

### Default Credentials & Quick Login
- **Default Password for all seeded demo accounts:** `farm1234`
- **Default OTP for pilot phone verification:** `123456`
- **Backend API Base URL:** `http://127.0.0.1:8001/api/v1`
- **Frontend UI:** `http://localhost:5173`

### All 14 Demo Accounts Table

| # | User Name | Phone Number | Password | Primary Role | Core Description & Capabilities |
|---|-----------|--------------|----------|--------------|---------------------------------|
| **01** | **Ramesh Reddy** | `9876543210` | `farm1234` | `FARMER` | Primary farmer account based in Ulchala, Kurnool. Can book APMC market slots, reserve godown storage, calculate GPS field area, buy seeds/fertilizers, and request vet visits. |
| **02** | **Suresh Grain Traders** | `9876543220` | `farm1234` | `CROP_BUYER` | Licensed APMC commission agent & grain trader at Kurnool Mandi. Tracks arrivals and daily modal rates. |
| **03** | **Mallikarjuna Natural Produces** | `9876543221` | `farm1234` | `CROP_SELLER` | Certified agricultural input dealer and seed/fertilizer merchant with valid state licenses. |
| **04** | **Rayalaseema Dairy & Cattle** | `9876543222` | `farm1234` | `LIVESTOCK_BUYER` | Dairy cooperative and commercial livestock procurement buyer. |
| **05** | **Govardhan Cattle Breeders** | `9876543223` | `farm1234` | `LIVESTOCK_SELLER` | Certified Murrah buffalo and indigenous cattle breeder. |
| **06** | **Nagaraju Agri Engineering** | `9876543224` | `farm1234` | `EQUIPMENT_BUYER` | Farm implements, drone spraying, and machinery lessee. |
| **07** | **Sri Balaji Harvester & Tractor**| `9876543225` | `farm1234` | `EQUIPMENT_SELLER` | Tractor, rotavator, and combine harvester rental provider. |
| **08** | **Dr. Chandrasekhar Rao** | `9876543226` | `farm1234` | `VETERINARIAN` | Senior veterinarian accepting farm door-step visits and cattle health appointments. |
| **09** | **Srinivasulu** | `9876543211` | `farm1234` | `MARKET_STAFF` | APMC Market Yard gatekeeper verifying QR codes, tokens, weighbridge entries, and lot inspection. |
| **10** | **Venkatesh** | `9876543212` | `farm1234` | `GODOWN_OPERATOR` | Warehouse Manager at APSWC Kurnool managing capacity, moisture inspection, and e-NWR issuance. |
| **11** | **Chiranjeevi** | `9876543227` | `farm1234` | `DELIVERY_WORKER` | Last-mile agricultural input and field delivery specialist. |
| **12** | **Padmavathi** | `9876543214` | `farm1234` | `HELP_DESK_OPERATOR` | Rythu Bharosa Kendra (RBK) operator assisting farmers with welfare schemes and grievances. |
| **13** | **Admin Officer** | `9876543215` | `farm1234` | `ADMIN` | District Collectorate administrator with full audit, capacity override, and role verification privileges. |
| **14** | **Dr. Anitha Reddy** | `9876543299` | `farm1234` | `FARMER (Pending VET)`| Registered candidate requesting a privileged role (`VETERINARIAN`) awaiting admin audit approval. |

---

### Login Methods (Password & OTP)

The application provides two flexible ways to login on the `/login` page:

1. **Password Login (Quick Demo Mode)**:
   - Enter any demo phone number (e.g. `9876543210`) and password: `farm1234`.
   - Click **Login with Password**.
   - The system immediately issues a secure JWT bearer token and redirects you to the personalized role dashboard.

2. **Mobile OTP Login (Field Friendly)**:
   - Enter your 10-digit mobile number and click **Send OTP**.
   - In pilot mode, the OTP is automatically pre-filled as `123456` (displayed in an informational toast).
   - Click **Verify & Sign In**. If the mobile number is new, a registered farmer profile is automatically created.

---

### Multi-Role Switching & Privileged Approvals

1. **Multi-Role Switching**:
   - A single user account can hold multiple roles (for example, a user who is both a `FARMER` and a `CROP_SELLER`).
   - The current role is displayed at the top right of the navigation bar.
   - Clicking on the role badge opens the **Switch Active Role** modal, allowing instant role switching without logging out.

2. **Privileged Roles Security Gate**:
   - **Self-Serve Public Roles**: `FARMER`, `CROP_BUYER`, `CROP_SELLER`, `LIVESTOCK_BUYER`, `LIVESTOCK_SELLER`, `EQUIPMENT_BUYER`, `EQUIPMENT_SELLER`, `DELIVERY_WORKER`. Anyone can register for these immediately.
   - **Privileged Administrative Roles**: `VETERINARIAN`, `MARKET_STAFF`, `GODOWN_OPERATOR`, `HELP_DESK_OPERATOR`, `ADMIN`.
   - When registering for a privileged role, the request goes into `pendingRoles`. The user operates as a `FARMER` until the District Administrator verifies credentials and approves the role in the **Admin Console**.

---

## 4. What Different Users See (Role-Based Access Control)

The platform dynamically adjusts navigation items, hero titles, dashboard widgets, quick actions, and data access based on the logged-in user's active role.

### Role Matrix & Permission Table

| Platform Module | Route | FARMER | MARKET STAFF | GODOWN OPERATOR | HELP DESK (RBK) | VETERINARIAN | TRADERS (BUY/SELL) | DISTRICT ADMIN |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Personalized Dashboard** | `/` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Mandi Slot Booking** | `/markets` | Yes (Book) | Yes (Manage) | No | No | No | Yes (View) | Yes (Full) |
| **Daily Mandi Prices** | `/market-prices` | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Staff Gate Pass Scanner** | `/staff` | No | Yes (Gate) | Yes (Inward) | Yes (Verify) | No | No | Yes (Audit) |
| **Godown Storage** | `/godowns` | Yes (Reserve) | No | Yes (Manage) | No | No | Yes (Reserve) | Yes (Full) |
| **Agri Marketplace** | `/marketplace` | Yes (Shop) | No | No | No | No | Yes (Sell/Buy) | Yes (Full) |
| **Government Schemes** | `/schemes` | Yes (Apply) | No | No | Yes (Assist) | No | No | Yes (Full) |
| **Agri & GPS Calculators** | `/calculators` | Yes (Full) | No | No | No | No | Yes (Margin) | Yes (Full) |
| **Crop Health AI** | `/crop-health` | Yes (Screen) | No | No | Yes (Assist) | No | No | Yes (Audit) |
| **Field Services & Vets** | `/field-services`| Yes (Request)| No | No | No | Yes (Manage) | Yes (Rent) | Yes (Full) |
| **Phone / IVR Simulator** | `/ivr` | Yes | No | No | Yes (Assist) | No | No | Yes (Audit) |
| **Support & Grievances** | `/support` | Yes (Submit) | Yes | Yes | Yes | Yes | Yes | Yes (Resolve) |
| **District Admin Console** | `/admin` | No | No | No | No | No | No | Yes (Full) |

---

### Detailed Experience by Role

#### 1. FARMER (`Ramesh Reddy` - `9876543210`)
- **Dashboard Banner**: *"Welcome back, Ramesh Reddy | Ulchala, Kurnool"*.
- **Quick Actions**: "Book Market Slot", "Today's Mandi Rates", "GPS Land Area", "Phone IVR".
- **Real-Time Weather Widget**: Shows live temperature, rainfall, humidity, and agro-met advisory from IMD.
- **My Bookings Widget**: Displays active mandi arrival tokens (`KNL-MKT-XXXXX`) and godown passes (`APSWC-XXXXX`) with live status badges.
- **Calculators Access**: Full access to Walk-GPS Land Measuring, ANGRAU Seed/Fertilizer calculator, and Crop Profit Margins.

#### 2. MARKET_STAFF (`Srinivasulu` - `9876543211`)
- **Dashboard Banner**: *"APMC Mandi Gate & Check-in Portal | Kurnool APMC Market Yard"*.
- **Quick Action**: "Open QR Gate Scanner" and "Today's Mandi Rates".
- **Quick Pass Verification Box**: An on-dashboard input to paste tokens directly and hit **Verify** or open **Camera Scanner**.
- **Gate Pass Page (`/staff`)**:
  - Live webcam / device camera feed that scans farmer QR entry passes in real time using `jsQR`.
  - Manual lookup for tokens like `KNL-MKT-38291`.
  - **Status Action Pipeline**: Advance tokens through `CHECKED_IN`, `WEIGHED`, `LOT_INSPECTED`, `RATE_NEGOTIATION`, and `SOLD`.
  - Rate negotiation recorder to log the buyer trader's name and final auction price per quintal.

#### 3. GODOWN_OPERATOR (`Venkatesh` - `9876543212`)
- **Dashboard Banner**: *"APSWC State Warehouse Storage Portal | Warehouse Manager"*.
- **Quick Action**: "Manage Warehouses" and "Verify Storage Pass".
- **Godown Operations (`/godowns` & `/staff`)**:
  - View warehouse capacity utilization bar (e.g. 82% occupied, 1,800 bags remaining).
  - Inspect farmer inward reservations (`APSWC-KNL-XXXXX`).
  - Update storage lifecycle: `VEHICLE_INWARD` -> `QUALITY_CHECK` -> `STACKED_STORAGE` -> `eNWR_ISSUED`.
  - Issue electronic Negotiable Warehouse Receipts (e-NWR) enabling farmers to take bank loans against stored grains.

#### 4. HELP_DESK_OPERATOR (`Padmavathi` - `9876543214`)
- **Dashboard Banner**: *"Rythu Bharosa Kendra (RBK) Citizen Assistance Desk"*.
- **Quick Action**: "Review Schemes & Subsidies" and "Verify Citizen Pass".
- **Schemes Module (`/schemes`)**:
  - Filter Central & State schemes (PM-KISAN, YSR Rythu Bharosa, Solar Ag Pumpset Scheme, Dairy Infrastructure Fund).
  - Run **Instant Eligibility Pre-Checks** based on land holding size, Aadhaar status, and tenant status.
  - Log assisted welfare applications on behalf of rural farmers who lack digital literacy.

#### 5. DISTRICT ADMIN (`Admin Officer` - `9876543215`)
- **Dashboard Banner**: *"District Administration & Oversight Console | District Collectorate"*.
- **Quick Action**: "District Admin Console" and "Mandi Price Radar".
- **Admin Console (`/admin`)**:
  - **Live District KPIs**: Total farmers registered, active slot bookings, godown occupancy rate, open support cases, pending privileged role verifications.
  - **Dynamic Slot Capacity Override**: During bumper harvests or unseasonal rains, admin can increase hourly gate capacity from 25 to 50 vehicles with an audit justification.
  - **Privileged Role Approvals**: Approve or reject pending applications for veterinarians, gatekeepers, and warehouse managers.
  - **Feedback & Review Moderation**: Inspect star ratings and farmer reviews for market yards, godowns, and field services.
  - **System Audit Trail**: Tamper-proof security audit log recording every check-in, status change, and capacity override with actor IP and timestamps.

#### 6. VETERINARIAN (`Dr. Chandrasekhar Rao` - `9876543226`)
- **Dashboard Banner**: *"Veterinary Care & Farm Health Portal | Senior Veterinarian"*.
- **Quick Action**: "Farm Visits & Cattle Care" and "Livestock Market".
- **Field Services Module (`/field-services`)**:
  - View assigned cattle check-up and vaccination appointments.
  - Update visit status: `ACCEPTED` -> `ON_THE_WAY` -> `REACHED_LOCATION` -> `IN_PROGRESS` -> `COMPLETED`.
  - Enter diagnosis, prescription, and treatment notes.

#### 7. CROP_BUYER / TRADER (`Suresh Grain Traders` - `9876543220`)
- **Dashboard Banner**: *"Agricultural Produce Trading Portal | APMC Grain Trader"*.
- **Quick Action**: "Agri Marketplace" and "Daily Mandi Prices".
- **Trading Tools**: Monitor live APMC market arrivals, view daily minimum/maximum/modal prices across 25+ commodities, participate in rate settlements.

---

## 5. Mandi Slot Booking & Token Lifecycle

The **Slot Booking System** (`/markets`) solves the problem of long queues, traffic congestion, and distress sales at APMC market yards by assigning farmers confirmed, atomic arrival time slots.

```
+-----------------------------------------------------------------------------------+
|                        MANDI SLOT BOOKING LIFECYCLE                                |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ 1. FARMER BOOKS ]         [ 2. GATE ARRIVAL ]         [ 3. WEIGHBRIDGE ]       |
|  Selects Market, Commodity,  Staff scans QR Code         Gross & Tare vehicle     |
|  Date, Vehicle & Slot Time.  or enters Token.            weight is recorded.      |
|  STATUS: "REQUESTED"         STATUS: "CHECKED_IN"        STATUS: "WEIGHED"        |
|            |                              |                           |           |
|            v                              v                           v           |
|  [ 4. LOT INSPECTION ]       [ 5. RATE AUCTION ]         [ 6. SETTLEMENT ]        |
|  Quality, moisture &         Trader bids & price is      Produce sold, payment    |
|  grade are certified.        agreed per quintal.         token completed.         |
|  STATUS: "LOT_INSPECTED"     STATUS: "RATE_NEGOTIATION"  STATUS: "SOLD / SETTLED" |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

### Farmer Booking Workflow:
1. Navigate to **Slot Booking** (`/markets`).
2. **Cascading Location Filter**: Select State (e.g. *Andhra Pradesh*) and District (e.g. *Kurnool*).
3. **Select Market Yard**: Choose from local APMC yards (e.g. *Kurnool APMC Market Yard - C-Camp*, *Yemmiganur Cotton Yard*, *Nandyal Mandi*).
4. **Choose Commodity**: Cotton, Chilli, Paddy, Groundnut, Bengal Gram, Maize, Sunflower, Onion, etc.
5. **Select Arrival Date & Slot**: Pick a convenient date and time window (e.g. `09:00 - 11:00 AM`, `11:00 - 01:00 PM`).
6. **Vehicle & Estimated Quantity**: Select vehicle type (Tractor, Mini Truck, Auto, Bullock Cart) and quantity in quintals (e.g. `15 Quintals`).
7. Click **Confirm Slot Booking**.

### QR Code Entry Pass & Token
- Upon successful booking, the platform generates a unique token reference (e.g., `KNL-MKT-83921`).
- An interactive **Booking Pass Modal** displays:
  - High-resolution scannable QR Code containing the encrypted booking reference.
  - Farmer name, contact number, commodity, slot time, and market gate details.
  - Buttons to **Copy Token**, **Print Pass**, or save for gate entry.
- The booking is permanently recorded in **My Active Bookings** with an expandable **Audit Timeline**.

### Gate Verification & Status Transitions:
- At the market gate, APMC staff open `/staff` or the camera scanner.
- Scanning the QR code pulls up the farmer's complete consignment details.
- Staff click **Check In Farmer** to transition status to `CHECKED_IN`.
- As the vehicle moves through the yard, staff log **Weighment**, **Lot Grading**, and **Rate Negotiation** (entering trader name and final price).
- Once the sale is finalized, the booking transitions to `SOLD` and prompts the farmer to submit an optional 5-star rating and review.

---

## 6. Godown Storage Reservation System

The **Godown Storage Module** (`/godowns`) allows farmers to store harvest grains safely in state warehouses (APSWC) during price drops, preventing pest damage and distress sales.

### Warehouse Space Reservation:
1. Navigate to **Godown Storage** (`/godowns`).
2. Filter facilities by State, District, or Search keyword (e.g. *Kurnool Central Godown*, *Dhone Warehouse*).
3. Review facility specifications:
   - Total & available capacity in standard bags (e.g. 50kg bags).
   - Monthly rental rate (e.g., `₹5.50 / bag / month`).
   - Insurance coverage and WDRA accreditation status.
4. Fill the reservation form:
   - **Commodity**: Paddy, Bengal Gram, Maize, Groundnut.
   - **Number of Bags**: e.g., `120 Bags`.
   - **Storage Duration**: 1 to 12 Months.
   - **Inward Date & Slot**: Estimated date of arrival.
5. Review the automated financial summary (Estimated Monthly Rent + Insurance).
6. Click **Confirm Storage Reservation**.

### WDRA Accreditation & e-NWR Receipt:
- Generates a storage reservation token (e.g., `APSWC-KNL-74192`) and storage entry QR pass.
- **Operator Verification**: The warehouse manager at `/staff` verifies the incoming truck, logs moisture content (must be ≤ 12%), and marks `STACKED_STORAGE`.
- **e-NWR Issuance**: Once stacked, the operator marks `eNWR_ISSUED`. This electronic Negotiable Warehouse Receipt serves as legal proof of deposit, allowing farmers to apply for pledge loans from commercial and cooperative banks.

---

## 7. Agri Calculators & Land Measurement

The **Agri Calculators Module** (`/calculators`) is a premier, scientific suite built specifically for regional farming realities.

```
+-----------------------------------------------------------------------------------+
|                        AGRI CALCULATORS SUITE (/calculators)                      |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Tab 0: Land Unit Converter ]       [ Tab 1: GPS Land Area & Fencing ]          |
|  Instant conversion between           Walk perimeter with live phone GPS or plot  |
|  Acres, Cents, Guntas, Hectares,      corners. Calculates Acres, Cents, Perimeter |
|  Sq Feet, and Sq Yards.               and wire fencing materials.                 |
|                                                                                   |
|  [ Tab 2: Seed & Fertilizer Norms ]   [ Tab 3: Yield & Profit Margins ]           |
|  ANGRAU university recommended doses  Enter expected yield & expenses. Calculates |
|  of seeds, Urea, DAP, and Potash      Gross revenue, Net profit, and Break-even   |
|  based on crop and farming method.    selling price.                              |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```

### GPS Land Area & Boundary Measurement (`GpsLandCalculator`)

The GPS Land Area Calculator allows farmers and field staff to determine the exact acreage and boundary perimeter of irregular agricultural plots without expensive surveying equipment.

#### 3 Flexible Ways to Measure:
1. **Mode 1: Walk / Drive Perimeter (Live Phone GPS)**:
   - Farmer clicks **Start Walking / Live GPS**.
   - As they walk around the field boundary, the app records high-accuracy GPS breadcrumbs at regular distance intervals.
   - Live GPS accuracy indicator displays current precision in meters (e.g., `Accuracy: ± 2.8 m`).
   - When finished walking the boundary, click **Stop & Calculate Area**.
2. **Mode 2: Preset Sample Fields**:
   - For demonstrations or quick testing, choose from realistic Rayalaseema farm plots:
     - *2.45 Acres Rectangular Farm* (approx. 100m × 100m 4-corner field)
     - *1.25 Acres Wet Paddy Field* (5-corner canal ayacut bund plot)
     - *3.82 Acres Irregular Dryland* (6-corner red soil plot with natural borders)
     - *1.00 Acre Triangular Plot* (3-corner chilli patch)
3. **Mode 3: Manual Coordinate / Corner Entry**:
   - Add GPS latitude and longitude coordinates point-by-point with custom labels (e.g., *Gate*, *Borewell*, *East Bund*).

#### Mathematical Algorithms:
- **Local Equirectangular Metric Projection**: Converts spherical coordinates (WGS84) to local metric Cartesian coordinates $(x, y)$ centered at the centroid, minimizing distortion for farm-scale plots.
- **Shoelace Formula (Gauss's Area Formula)**:
  $$\text{Area} = \frac{1}{2} \left| \sum_{i=1}^{n} (x_i y_{i+1} - x_{i+1} y_i) \right|$$
- **Haversine Formula**: Computes precise great-circle distance between each adjacent boundary marker to determine individual boundary edge lengths and total perimeter:
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$

#### Interactive Visualizer:
- Renders an interactive SVG polygon preview of the farm plot.
- Shows numbered corner markers ($P_1, P_2, P_3 \dots$), centroid pin, and distances between corners in both meters and feet.

---

### Fencing Estimation & Material Breakdown

The calculator automatically calculates fencing supplies needed to secure the surveyed plot:
- **Fence Pole Spacing**: Adjustable (default: `10 Feet` between posts).
- **Wire Strands**: Choose 1 to 10 strands (e.g., 4 strands for standard barbed or solar fencing).
- **Calculated Results**:
  - **Total Boundary Perimeter**: in Meters and Feet.
  - **Total Fence Poles Required**: Calculated based on spacing plus corner reinforcement poles.
  - **Total Wire Length**: Total meters of wire needed across all strands.
  - **Estimated Wire Rolls**: Based on standard 400-meter commercial barbed wire reels.

---

### Land Unit Converter (Cents, Guntas, Acres)

In Andhra Pradesh and South India, revenue records use local units such as **Cents** and **Guntas**. The platform provides instant, standardized conversion:

$$\begin{aligned}
1\text{ Acre} &= 100\text{ Cents} = 40\text{ Guntas} \\
1\text{ Acre} &= 4,046.86\text{ Sq. Meters} = 43,560\text{ Sq. Feet} = 4,840\text{ Sq. Yards} \\
1\text{ Hectare} &= 2.471\text{ Acres} = 10,000\text{ Sq. Meters} \\
1\text{ Cent} &= 435.6\text{ Sq. Feet} \approx 40.47\text{ Sq. Meters} \\
1\text{ Gunta} &= 1,089\text{ Sq. Feet} \approx 101.17\text{ Sq. Meters}
\end{aligned}$$

#### 1-Click Bridge to Other Calculators:
From the GPS measurement results, the user can click:
- **"Apply to Seed & Nutrients"**: Automatically transfers the surveyed acreage into Tab 2.
- **"Apply to Profit Margins"**: Automatically transfers the acreage into Tab 3.

---

### Seed & Fertilizer Requirement Calculator

Formulated according to **ANGRAU (Acharya N.G. Ranga Agricultural University)** regional package of practices:
1. Select Crop: **Paddy, Cotton, Groundnut, Chili, Bengal Gram, or Maize**.
2. Select Land Holding: in Acres (or populated from GPS measurement).
3. Select Farming Method: **Traditional, Direct Seeded, or SRI (System of Rice Intensification)**.
4. **Calculated Output**:
   - Total certified seed needed (in kg).
   - **Urea Bags** (45 kg bags, 46% Nitrogen content).
   - **DAP Bags** (50 kg bags, 46% Phosphorus content).
   - **MOP Bags** (Muriate of Potash, 60% Potassium content).
   - Split application schedule: Basal dose at sowing, First top dressing (20–25 days), Second top dressing (flowering stage).

---

### Yield, Cost & Profit Margin Calculator

Enables farmers to conduct pre-sowing and pre-harvest economic viability analysis:
1. **Inputs**:
   - Crop and Cultivated Acres.
   - Expected Yield per Acre (in quintals).
   - Expected Mandi Selling Price (in ₹ per quintal).
   - Operational Costs per Acre: Seed cost, Fertilizer & pesticide cost, Labor & machinery/tractor rental, Irrigation & electricity, Miscellaneous costs.
2. **Calculated Output**:
   - **Total Estimated Yield**: in Quintals.
   - **Gross Realizable Revenue**: $\text{Yield} \times \text{Price}$.
   - **Total Production Cost**: Sum of all operational costs.
   - **Net Profit or Loss**: $\text{Gross Revenue} - \text{Total Cost}$.
   - **Net Profit Margin %**: $\frac{\text{Net Profit}}{\text{Gross Revenue}} \times 100$.
   - **Cost of Production per Quintal**: Minimum price required to avoid losses.
   - **Break-even Yield**: Minimum quintals per acre required to cover all costs.

---

## 8. Additional Integrated Platform Modules

### Daily Mandi Prices & MSP Radar (`/market-prices`)
- Live APMC commodity rates tracking daily Minimum, Maximum, and Modal prices across 25+ crops.
- Real-time comparison with Government Minimum Support Price (MSP).
- Filter by Commodity, Market Yard, and Date.

### Crop Health AI Screening (`/crop-health`)
- Early detection of leaf blights, fungal spots, stem borers, and nutrient deficiencies.
- Farmers upload a leaf photo or describe symptoms.
- Yields immediate diagnosis, confidence score, and chemical/organic management guidelines aligned with regional Krishi Vigyan Kendra (KVK) advisories.

### Field Services & Veterinary Appointments (`/field-services`)
- Book door-step appointments for:
  - **Veterinary Care**: Cattle illness, Murrah buffalo artificial insemination, vaccination.
  - **Agri Equipment Delivery**: Tractor attachment delivery, drone spraying booking.
  - **Soil & Field Inspection**: Soil sample collection by agricultural extension officers.
- Real-time status tracking with provider contact details and completion confirmation.

### Government Schemes & Subsidies (`/schemes`)
- Curated repository of Central and State agricultural schemes:
  - **PM-KISAN** (₹6,000 annual income support).
  - **YSR Rythu Bharosa** (Input assistance for farmers & tenant farmers).
  - **PM KUSUM Solar Pump Scheme** (60% to 90% subsidy on solar borewells).
  - **National Livestock Mission** (Subsidies on dairy and sheep breeding units).
- Instant Eligibility Pre-Check: Checks eligibility criteria before submitting an application.

### Interactive Phone / IVR Simulator (`/ivr`)
- Recognizes that many marginal farmers use basic keypad phones without 4G internet.
- Features a dial-in phone simulator with audio prompts in **Telugu** and **English**.
- Farmers dial digits (DTMF tones) or speak to book mandi slots, check daily market rates, or request a callback.
- Directly creates confirmed bookings in the same central MongoDB database.

### Admin Oversight & Capacity Control (`/admin`)
- District-wide analytics: active bookings, godown occupancy, pending grievances.
- **Dynamic Slot Capacity Override**: Permits administrators to increase hourly arrival slots at specific market yards during harvest arrivals.
- Review and moderation of user ratings and reviews.
- Tamper-proof audit logs recording all sensitive operations.

### Customer Support & Grievance Redressal (`/support`)
- Farmers and traders can log support tickets for weighing discrepancies, gate delays, or payment issues.
- Tracks ticket priority (Low, Medium, High, Emergency) with ticket numbers (`KNL-SUP-XXXXX`).

---

## 9. REST API Directory

The FastAPI backend exposes interactive OpenAPI documentation at `http://127.0.0.1:8001/docs`. Key routes include:

| Tag | Method | Endpoint | Description |
|---|:---:|---|---|
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate using phone number & password. |
| **Auth** | `POST` | `/api/v1/auth/request-otp` | Request mobile verification OTP. |
| **Auth** | `POST` | `/api/v1/auth/verify-otp` | Verify OTP and issue JWT access token. |
| **Auth** | `POST` | `/api/v1/auth/switch-role` | Switch active role for multi-role accounts. |
| **Bookings** | `POST` | `/api/v1/bookings/` | Create a confirmed APMC market slot booking. |
| **Bookings** | `GET` | `/api/v1/bookings/my` | Retrieve bookings for current farmer. |
| **Bookings** | `GET` | `/api/v1/bookings/reference/{ref}` | Look up booking details by token reference. |
| **Bookings** | `POST` | `/api/v1/bookings/{id}/status` | Update booking lifecycle status. |
| **Godowns** | `GET` | `/api/v1/godowns` | List warehouse facilities with availability. |
| **Godowns** | `POST` | `/api/v1/godowns/reservations` | Reserve warehouse storage space. |
| **Godowns** | `POST` | `/api/v1/godowns/reference/{ref}/status` | Update godown inward/eNWR status. |
| **Calculators**| `POST` | `/api/v1/calculators/gps-land-area` | Calculate GPS polygon area & fencing. |
| **Calculators**| `POST` | `/api/v1/calculators/land-convert` | Convert land measurement units. |
| **Calculators**| `POST` | `/api/v1/calculators/seed-fertilizer`| Calculate seed & fertilizer dosages. |
| **Calculators**| `POST` | `/api/v1/calculators/yield-margin` | Calculate economics, net profit & ROI. |
| **Field** | `POST` | `/api/v1/field-services` | Request vet or equipment field service. |
| **Field** | `POST` | `/api/v1/field-services/{id}/status`| Provider updates service progress. |
| **Admin** | `GET` | `/api/v1/admin/kpis` | Fetch district operations KPIs. |
| **Admin** | `POST` | `/api/v1/admin/capacity-override` | Override market yard gate slot capacity. |
| **Admin** | `POST` | `/api/v1/admin/users/approve-role`| Approve/reject privileged role application. |
| **Prices** | `GET` | `/api/v1/weather-prices/mandi-prices`| Daily APMC commodity rates. |
| **IVR** | `POST` | `/api/v1/ivrs/simulator/step` | Process interactive phone IVR steps. |

---

## 10. Troubleshooting & FAQ

### 1. Backend Port Conflict (`Port 8001 already in use`)
If port 8001 is occupied, locate and terminate the existing process in PowerShell:
```powershell
Get-NetTCPConnection -LocalPort 8001 -ErrorAction SilentlyContinue | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

### 2. Frontend Not Connecting to Backend
Ensure that the backend is running at `http://127.0.0.1:8001`. Verify that `frontend/.env` or the default RTK Query base URL points to `http://127.0.0.1:8001/api/v1`.

### 3. Database Connection Issues
The project defaults to MongoDB Atlas connection string in `backend/app/core/config.py` or a local MongoDB service (`mongodb://localhost:27017`). Ensure internet connectivity if connecting to MongoDB Atlas.

### 4. Camera Scanner Permissions
When using the QR Gate Scanner at `/staff`, your browser will prompt for camera access. Click **Allow**. If testing on a desktop without a webcam, you can use the manual token search box (`KNL-MKT-XXXXX`) to verify passes.

### 5. Resetting Seed Data
To restore all 14 demo accounts, clean transactions, and reset warehouse capacities to initial defaults, run:
```powershell
cd c:\Users\rajas\Downloads\Farm\backend
.\venv\Scripts\Activate.ps1
python scripts/seed.py
```

---
*Created for the Smart Farmer Platform Pilot Project.*
