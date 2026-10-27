from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.db.mongo import get_database
from app.schemas.marketplace import (
    ProductCreateRequest, OrderCreateRequest, SellerOnboardRequest
)
from app.services.marketplace_service import marketplace_service
from app.api.deps import get_current_user, require_seller, require_admin

router = APIRouter(prefix="/marketplace", tags=["Agricultural Input Marketplace"])

@router.get("/products")
async def list_products(category: Optional[str] = None):
    return await marketplace_service.get_products(category=category, approved_only=True)

@router.post("/products", dependencies=[Depends(require_seller)])
async def create_product(
    data: ProductCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    product = await marketplace_service.create_product(
        seller_id=current_user["id"],
        product_data=data.model_dump()
    )
    return product

@router.post("/orders")
async def create_order(
    data: OrderCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    order = await marketplace_service.create_order(
        farmer_id=current_user["id"],
        farmer_name=current_user.get("name", "Farmer"),
        seller_id=data.sellerId,
        items=[item.model_dump() for item in data.items],
        delivery_address=data.deliveryAddress,
        payment_method=data.paymentMethod
    )
    return order

@router.get("/orders/my")
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    db = get_database()
    orders = await db.orders.find({"farmerId": current_user["id"]}).sort("createdAt", -1).to_list(100)
    for o in orders:
        o["id"] = str(o["_id"])
    return orders

@router.get("/orders/seller", dependencies=[Depends(require_seller)])
async def get_seller_orders(current_user: dict = Depends(get_current_user)):
    db = get_database()
    orders = await db.orders.find({"sellerId": current_user["id"]}).sort("createdAt", -1).to_list(100)
    for o in orders:
        o["id"] = str(o["_id"])
    return orders

@router.post("/sellers/onboard")
async def onboard_seller(
    data: SellerOnboardRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    existing = await db.sellers.find_one({"userId": current_user["id"]})
    if existing:
        return {"success": True, "message": "Seller profile already registered", "sellerId": str(existing["_id"])}

    doc = data.model_dump()
    doc["userId"] = current_user["id"]
    doc["verificationStatus"] = "VERIFIED" # Pre-verified for Kurnool pilot demo
    res = await db.sellers.insert_one(doc)
    
    # Update user role to SELLER
    await db.users.update_one({"_id": ObjectId(current_user["id"])}, {"$set": {"role": "SELLER"}})
    return {"success": True, "sellerId": str(res.inserted_id), "status": "VERIFIED"}
