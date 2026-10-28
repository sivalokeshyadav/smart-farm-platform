# Smart Farmer Platform (Rayalaseema Pilot & APMC Mandis)

A unified digital agriculture platform designed for APMC market yard slot booking, state godown storage management, GPS land area & fencing calculations, agronomic seed & nutrient calculators, crop health AI diagnostics, doorstep veterinary services, and inclusive phone IVR access.

---

## 📖 Complete Documentation
For the full comprehensive user and developer guide, please read:  
👉 **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)**

---

## ⚡ Quick Start

### 1. Backend (FastAPI + MongoDB)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python scripts/seed.py
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
- API Docs: [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)

### 2. Frontend (React + Vite + Chakra UI)
```powershell
cd frontend
npm install
npm run dev -- --host
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Demo Accounts (Default Password: `farm1234`)

| Name | Mobile | Role | Description |
|---|---|---|---|
| **Ramesh Reddy** | `9876543210` | `FARMER` | Primary farmer in Ulchala, Kurnool. Books slots, calculates GPS land area, requests vet visits. |
| **Suresh Grain Traders** | `9876543220` | `CROP_BUYER` | Licensed APMC mandi grain trader and commission agent. |
| **Mallikarjuna Natural Produces** | `9876543221` | `CROP_SELLER` | Certified input dealer selling seeds & fertilizers. |
| **Dr. Chandrasekhar Rao** | `9876543226` | `VETERINARIAN` | Senior veterinarian managing farm visits & cattle health. |
| **Srinivasulu** | `9876543211` | `MARKET_STAFF` | Mandi gatekeeper with QR code scanner and check-in portal. |
| **Venkatesh** | `9876543212` | `GODOWN_OPERATOR` | Warehouse manager at APSWC Godown managing e-NWR storage. |
| **Padmavathi** | `9876543214` | `HELP_DESK_OPERATOR` | Rythu Bharosa Kendra (RBK) operator helping with schemes. |
| **Admin Officer** | `9876543215` | `ADMIN` | District administrator with audit logs, capacity override, and role approvals. |