import secrets
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from pydantic import BaseModel
from app.db.mongo import get_database
from app.core.security import get_password_hash, verify_password, create_access_token
from app.schemas.auth import (
    RequestOtpSchema,
    VerifyOtpSchema,
    LoginWithPasswordSchema,
    RegisterUserSchema,
    SwitchRoleSchema,
    TokenResponse,
    ALL_ROLES,
    PRIVILEGED_ROLES,
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory OTP store for pilot development (mocked SMS delivery)
ACTIVE_OTPS = {}

class UpdateProfileSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    preferredLanguage: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    mandal: Optional[str] = None
    village: Optional[str] = None

@router.post("/request-otp")
async def request_otp(data: RequestOtpSchema):
    phone = data.phone.strip()
    otp = "123456" if phone.startswith("98") or phone.startswith("99") else f"{secrets.randbelow(900000) + 100000}"
    ACTIVE_OTPS[phone] = {
        "otp": otp,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    return {
        "success": True,
        "message": f"OTP sent to {phone} (Pilot Mode: {otp})",
        "mockOtp": otp
    }

@router.post("/register", response_model=TokenResponse)
async def register_user(data: RegisterUserSchema):
    db = get_database()
    phone = data.phone.strip()

    existing = await db.users.find_one({"phone": phone})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this mobile number already exists. Please login."
        )

    # Validate and categorize requested roles
    requested = [r for r in data.requestedRoles if r in ALL_ROLES]
    if not requested:
        requested = ["FARMER"]

    # Public self-approved roles vs Privileged roles needing admin approval
    approved_roles = [r for r in requested if r not in PRIVILEGED_ROLES]
    pending_roles = [r for r in requested if r in PRIVILEGED_ROLES]

    # Ensure user has at least one active role (fallback to FARMER if all requested are pending)
    if not approved_roles:
        approved_roles = ["FARMER"]

    active_role = approved_roles[0]
    now_iso = datetime.now(timezone.utc).isoformat()
    password_hash = get_password_hash(data.password)

    new_user = {
        "phone": phone,
        "name": data.name.strip(),
        "email": data.email.strip() if data.email else None,
        "passwordHash": password_hash,
        "role": active_role,
        "roles": approved_roles,
        "activeRole": active_role,
        "pendingRoles": pending_roles,
        "state": data.state.strip(),
        "district": data.district.strip(),
        "mandal": (data.mandal or "Kurnool Rural").strip(),
        "village": (data.village or "Kurnool").strip(),
        "preferredLanguage": data.preferredLanguage if data.preferredLanguage in ["te", "en", "hi"] else "en",
        "isActive": True,
        "createdAt": now_iso
    }

    res = await db.users.insert_one(new_user)
    user_id = str(res.inserted_id)

    # Automatically create farmer profile if FARMER role requested
    if "FARMER" in approved_roles:
        await db.farmer_profiles.insert_one({
            "userId": user_id,
            "phone": phone,
            "district": data.district.strip(),
            "mandal": (data.mandal or "Kurnool Rural").strip(),
            "preferredLanguage": new_user["preferredLanguage"],
            "landHoldingAcres": 2.5,
            "primaryCrops": ["Cotton", "Chilli"]
        })

    # If pending roles exist, log an audit notification for administrators
    if pending_roles:
        await db.notifications.insert_one({
            "userId": "system_admin",
            "type": "ROLE_APPROVAL_REQUESTED",
            "title": f"Privileged Role Request: {data.name} ({phone})",
            "message": f"User requested privileged role(s): {', '.join(pending_roles)}. Pending admin verification.",
            "targetUserId": user_id,
            "read": False,
            "createdAt": now_iso
        })

    access_token = create_access_token({
        "sub": user_id,
        "userId": user_id,
        "phone": phone,
        "role": active_role,
        "roles": approved_roles,
        "name": data.name
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "phone": phone,
            "name": data.name,
            "role": active_role,
            "roles": approved_roles,
            "pendingRoles": pending_roles,
            "state": new_user["state"],
            "district": new_user["district"],
            "mandal": new_user["mandal"],
            "village": new_user["village"],
            "preferredLanguage": new_user["preferredLanguage"]
        }
    }

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(data: VerifyOtpSchema):
    db = get_database()
    phone = data.phone.strip()
    stored = ACTIVE_OTPS.get(phone)

    if data.otp != "123456" and (not stored or stored["otp"] != data.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )

    ACTIVE_OTPS.pop(phone, None)

    user = await db.users.find_one({"phone": phone})
    now_iso = datetime.now(timezone.utc).isoformat()

    if not user:
        primary_role = data.role or "FARMER"
        roles = [primary_role]
        new_user = {
            "phone": phone,
            "name": data.name or f"Farmer {phone[-4:]}",
            "role": primary_role,
            "roles": roles,
            "activeRole": primary_role,
            "pendingRoles": [],
            "state": "Andhra Pradesh",
            "district": "Kurnool",
            "preferredLanguage": "en",
            "isActive": True,
            "createdAt": now_iso
        }
        res = await db.users.insert_one(new_user)
        user = await db.users.find_one({"_id": res.inserted_id})
        
        if primary_role == "FARMER":
            await db.farmer_profiles.insert_one({
                "userId": str(user["_id"]),
                "phone": phone,
                "district": "Kurnool",
                "mandal": "Kurnool Rural",
                "preferredLanguage": "en",
                "landHoldingAcres": 3.5,
                "primaryCrops": ["Cotton", "Paddy"]
            })

    user_id = str(user["_id"])
    active_role = user.get("activeRole") or user.get("role", "FARMER")
    roles = user.get("roles") or [active_role]

    access_token = create_access_token({
        "sub": user_id,
        "userId": user_id,
        "phone": user["phone"],
        "role": active_role,
        "roles": roles,
        "name": user.get("name", "User")
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "phone": user["phone"],
            "name": user.get("name", "User"),
            "role": active_role,
            "roles": roles,
            "pendingRoles": user.get("pendingRoles", []),
            "state": user.get("state", "Andhra Pradesh"),
            "district": user.get("district", "Kurnool"),
            "mandal": user.get("mandal", "Kurnool Rural"),
            "village": user.get("village", "Kurnool"),
            "preferredLanguage": user.get("preferredLanguage", "en")
        }
    }

@router.post("/login", response_model=TokenResponse)
async def login_with_password(data: LoginWithPasswordSchema):
    db = get_database()
    phone = data.phone.strip()
    user = await db.users.find_one({"phone": phone})
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid phone or credentials")

    password_hash = user.get("passwordHash")
    if password_hash:
        if not verify_password(data.password, password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    elif data.password != "farm1234":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    user_id = str(user["_id"])
    active_role = user.get("activeRole") or user.get("role", "FARMER")
    roles = user.get("roles") or [active_role]

    access_token = create_access_token({
        "sub": user_id,
        "userId": user_id,
        "phone": user["phone"],
        "role": active_role,
        "roles": roles,
        "name": user.get("name", "User")
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "phone": user["phone"],
            "name": user.get("name", "User"),
            "role": active_role,
            "roles": roles,
            "pendingRoles": user.get("pendingRoles", []),
            "state": user.get("state", "Andhra Pradesh"),
            "district": user.get("district", "Kurnool"),
            "mandal": user.get("mandal", "Kurnool Rural"),
            "village": user.get("village", "Kurnool"),
            "preferredLanguage": user.get("preferredLanguage", "en")
        }
    }

@router.post("/switch-role", response_model=TokenResponse)
async def switch_active_role(data: SwitchRoleSchema, current_user: dict = Depends(get_current_user)):
    db = get_database()
    target_role = data.role.strip()
    
    user_roles = current_user.get("roles") or [current_user.get("role", "FARMER")]
    # Admin can switch to any role for pilot verification
    if "ADMIN" not in user_roles and target_role not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You do not possess the '{target_role}' role. Authorized roles: {', '.join(user_roles)}"
        )

    user_id = current_user["id"]
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"activeRole": target_role, "role": target_role}}
    )

    access_token = create_access_token({
        "sub": user_id,
        "userId": user_id,
        "phone": current_user["phone"],
        "role": target_role,
        "roles": user_roles,
        "name": current_user.get("name", "User")
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "phone": current_user["phone"],
            "name": current_user.get("name", "User"),
            "role": target_role,
            "roles": user_roles,
            "pendingRoles": current_user.get("pendingRoles", []),
            "state": current_user.get("state", "Andhra Pradesh"),
            "district": current_user.get("district", "Kurnool"),
            "mandal": current_user.get("mandal", "Kurnool Rural"),
            "village": current_user.get("village", "Kurnool"),
            "preferredLanguage": current_user.get("preferredLanguage", "en")
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "phone": current_user["phone"],
        "name": current_user.get("name"),
        "email": current_user.get("email"),
        "role": current_user.get("activeRole") or current_user.get("role", "FARMER"),
        "roles": current_user.get("roles") or [current_user.get("role", "FARMER")],
        "pendingRoles": current_user.get("pendingRoles", []),
        "state": current_user.get("state", "Andhra Pradesh"),
        "district": current_user.get("district", "Kurnool"),
        "mandal": current_user.get("mandal", "Kurnool Rural"),
        "village": current_user.get("village", "Kurnool"),
        "preferredLanguage": current_user.get("preferredLanguage", "en"),
        "isActive": current_user.get("isActive", True)
    }

@router.put("/me")
async def update_profile(data: UpdateProfileSchema, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_data = {}
    if data.name is not None:
        update_data["name"] = data.name.strip()
    if data.email is not None:
        update_data["email"] = data.email.strip()
    if data.preferredLanguage is not None and data.preferredLanguage in ["te", "en", "hi"]:
        update_data["preferredLanguage"] = data.preferredLanguage
    if data.state is not None:
        update_data["state"] = data.state.strip()
    if data.district is not None:
        update_data["district"] = data.district.strip()
    if data.mandal is not None:
        update_data["mandal"] = data.mandal.strip()
    if data.village is not None:
        update_data["village"] = data.village.strip()

    if update_data:
        await db.users.update_one({"_id": ObjectId(current_user["id"])}, {"$set": update_data})
        # If preferredLanguage or district updated, update farmer_profiles too
        if "preferredLanguage" in update_data or "district" in update_data:
            await db.farmer_profiles.update_one(
                {"userId": current_user["id"]},
                {"$set": {k: v for k, v in update_data.items() if k in ["preferredLanguage", "district", "mandal"]}}
            )

    updated = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    return {
        "success": True,
        "message": "Profile updated successfully",
        "user": {
            "id": current_user["id"],
            "phone": updated["phone"],
            "name": updated.get("name"),
            "email": updated.get("email"),
            "role": updated.get("activeRole") or updated.get("role", "FARMER"),
            "roles": updated.get("roles", [updated.get("role")]),
            "pendingRoles": updated.get("pendingRoles", []),
            "state": updated.get("state", "Andhra Pradesh"),
            "district": updated.get("district", "Kurnool"),
            "mandal": updated.get("mandal", "Kurnool Rural"),
            "village": updated.get("village", "Kurnool"),
            "preferredLanguage": updated.get("preferredLanguage", "en")
        }
    }

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return {"success": True, "message": "Logged out successfully"}
