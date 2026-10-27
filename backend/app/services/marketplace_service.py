import secrets
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from app.db.mongo import get_database, serialize_mongo_docs, serialize_mongo_doc
from app.core.security import generate_reference_token
from app.services.audit_service import record_audit_log

class MarketplaceService:
    @staticmethod
    async def get_products(category: Optional[str] = None, approved_only: bool = True) -> List[Dict[str, Any]]:
        db = get_database()
        query: Dict[str, Any] = {}
        if approved_only:
            query["isApproved"] = True
        if category:
            query["category"] = category
        
        products = await db.products.find(query).to_list(100)
        return serialize_mongo_docs(products)

    @staticmethod
    async def create_product(seller_id: str, product_data: dict) -> Dict[str, Any]:
        db = get_database()
        
        # Verify seller
        seller = await db.sellers.find_one({"userId": seller_id})
        if not seller:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seller profile not found")

        # COMPLIANCE CHECK FOR REGULATED PRODUCTS (PESTICIDES, RESTRICTED CHEMICALS)
        # For pesticides or regulated products, block listings/orders until required seller licences and product approvals have been reviewed.
        is_regulated = product_data.get("category") == "PESTICIDES" or product_data.get("requiresLicense", False)
        
        if is_regulated:
            # Check if seller has an active, verified license
            verified_licenses = [
                lic for lic in seller.get("licenses", [])
                if lic.get("isVerified", False) and lic.get("licenseType") in ["INSECTICIDE_LICENSE", "PESTICIDE_DEALER"]
            ]
            if not verified_licenses:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Compliance Gate: Seller does not have a verified Insecticide/Pesticide dealer licence on file. Listing blocked."
                )

        now_iso = datetime.now(timezone.utc).isoformat()
        doc = {
            "sellerId": seller_id,
            "sellerBusinessName": seller.get("businessName"),
            "category": product_data["category"],
            "name": product_data["name"],
            "nameTe": product_data.get("nameTe", product_data["name"]),
            "brand": product_data["brand"],
            "price": product_data["price"],
            "unit": product_data["unit"],
            "stockQuantity": product_data["stockQuantity"],
            "requiresLicense": is_regulated,
            "licenseTypeRequired": product_data.get("licenseTypeRequired"),
            "description": product_data.get("description", ""),
            "isApproved": not is_regulated, # Regulated products require explicit admin approval before public listing
            "createdAt": now_iso
        }

        res = await db.products.insert_one(doc)
        doc["id"] = str(res.inserted_id)
        return doc

    @staticmethod
    async def create_order(
        farmer_id: str,
        farmer_name: str,
        seller_id: str,
        items: List[dict],
        delivery_address: str,
        payment_method: str = "SANDBOX_UPI"
    ) -> Dict[str, Any]:
        db = get_database()
        now_iso = datetime.now(timezone.utc).isoformat()

        # Validate items and stock
        total_amount = 0.0
        resolved_items = []

        for item in items:
            prod_id = item["productId"]
            qty = item["quantity"]
            try:
                prod = await db.products.find_one({"_id": ObjectId(prod_id)})
            except Exception:
                prod = await db.products.find_one({"_id": prod_id})

            if not prod:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {prod_id} not found")

            # Check approval
            if not prod.get("isApproved", True):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product '{prod.get('name')}' is pending compliance approval and cannot be purchased."
                )

            # Check stock
            if prod.get("stockQuantity", 0) < qty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{prod.get('name')}'. Available: {prod.get('stockQuantity')}"
                )

            line_total = prod.get("price", 0.0) * qty
            total_amount += line_total
            resolved_items.append({
                "productId": str(prod["_id"]),
                "name": prod.get("name"),
                "nameTe": prod.get("nameTe"),
                "price": prod.get("price"),
                "unit": prod.get("unit"),
                "quantity": qty,
                "lineTotal": line_total
            })

            # Decrement stock atomically
            await db.products.update_one(
                {"_id": prod["_id"]},
                {"$inc": {"stockQuantity": -qty}}
            )

        order_ref = generate_reference_token("KNL-ORD", 6)
        txn_id = f"TXN-SANDBOX-{secrets.token_hex(4).upper()}"

        order_doc = {
            "orderReference": order_ref,
            "farmerId": farmer_id,
            "farmerName": farmer_name,
            "sellerId": seller_id,
            "items": resolved_items,
            "totalAmount": round(total_amount, 2),
            "paymentMethod": payment_method,
            "paymentStatus": "PAID" if payment_method == "SANDBOX_UPI" else "PENDING_COD",
            "paymentTxnId": txn_id,
            "fulfillmentStatus": "CONFIRMED",
            "deliveryAddress": delivery_address,
            "createdAt": now_iso
        }

        res = await db.orders.insert_one(order_doc)
        order_doc["id"] = str(res.inserted_id)

        await record_audit_log(
            action="CREATE_ORDER",
            resource="ORDER",
            resource_id=order_ref,
            user_id=farmer_id,
            details={"totalAmount": total_amount, "sellerId": seller_id}
        )

        return order_doc

marketplace_service = MarketplaceService()
