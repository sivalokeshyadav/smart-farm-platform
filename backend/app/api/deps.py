from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from app.core.security import decode_access_token
from app.db.mongo import get_database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    db = get_database()

    # Graceful support for frontend demo/guest mode tokens
    if token == "pilot-demo-token-kurnool" or token.startswith("pilot-"):
        user = await db.users.find_one({"phone": "9876543210"})
        if not user:
            user = await db.users.find_one({"role": "FARMER"})
        if user:
            user["id"] = str(user["_id"])
            return user

    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub") or payload.get("userId")
    user = None
    if user_id:
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            user = await db.users.find_one({"userId": user_id})

    if not user:
        # Check by phone from payload (handles database re-seeds gracefully)
        phone = payload.get("phone")
        if phone:
            user = await db.users.find_one({"phone": phone})
            
    if not user or not user.get("isActive", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    user["id"] = str(user["_id"])
    return user

async def get_optional_user(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[dict]:
    if not token:
        return None
    try:
        return await get_current_user(token)
    except HTTPException:
        return None

def require_roles(allowed_roles: List[str]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "FARMER")
        active_role = current_user.get("activeRole", user_role)
        all_user_roles = set(current_user.get("roles", [user_role]))
        all_user_roles.add(user_role)
        all_user_roles.add(active_role)

        # ADMIN always has full administrative rights
        if "ADMIN" in all_user_roles:
            return current_user

        # Check if active role or any assigned role matches allowed roles
        if not any(r in allowed_roles for r in all_user_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {', '.join(allowed_roles)}. Your active role: {active_role}",
            )
        return current_user
    return role_checker

require_farmer = require_roles(["FARMER", "ADMIN"])
require_market_staff = require_roles(["MARKET_STAFF", "ADMIN"])
require_godown_operator = require_roles(["GODOWN_OPERATOR", "ADMIN"])
require_seller = require_roles(["SELLER", "CROP_SELLER", "EQUIPMENT_SELLER", "ADMIN"])
require_buyer = require_roles(["CROP_BUYER", "LIVESTOCK_BUYER", "EQUIPMENT_BUYER", "ADMIN"])
require_veterinarian = require_roles(["VETERINARIAN", "ADMIN"])
require_delivery_worker = require_roles(["DELIVERY_WORKER", "FIELD_AGENT", "ADMIN"])
require_help_desk = require_roles(["HELP_DESK_OPERATOR", "FIELD_AGENT", "ADMIN"])
require_field_agent = require_roles(["FIELD_AGENT", "HELP_DESK_OPERATOR", "ADMIN"])
require_admin = require_roles(["ADMIN"])

require_staff_or_operator = require_roles(["MARKET_STAFF", "GODOWN_OPERATOR", "HELP_DESK_OPERATOR", "ADMIN"])
