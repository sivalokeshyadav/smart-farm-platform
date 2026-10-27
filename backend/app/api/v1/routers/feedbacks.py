from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from pydantic import BaseModel, Field
from app.db.mongo import get_database, serialize_mongo_docs, serialize_mongo_doc
from app.api.deps import get_current_user, require_admin

router = APIRouter(prefix="/feedbacks", tags=["Feedback & Ratings"])

class SubmitFeedbackRequest(BaseModel):
    module: str = Field(..., description="MARKET_BOOKING | GODOWN | CROP_SALE | PRODUCT_ORDER | VETERINARY | EQUIPMENT_RENTAL | SCHEME_ASSISTANCE")
    transactionId: str
    targetId: Optional[str] = None # Facility ID or Provider User ID
    targetName: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    reviewText: Optional[str] = Field(default=None, max_length=1000)
    tags: List[str] = Field(default=[])

class ModerateFeedbackRequest(BaseModel):
    status: str = Field(..., description="PUBLISHED | FLAGGED | REMOVED")
    moderationNotes: Optional[str] = None

@router.post("")
async def submit_feedback(
    data: SubmitFeedbackRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()
    rater_id = current_user["id"]

    # Prevent duplicate reviews by the same participant for the same transaction
    existing = await db.feedbacks.find_one({
        "transactionId": data.transactionId,
        "raterId": rater_id
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a rating for this service/transaction."
        )

    doc = {
        "module": data.module,
        "transactionId": data.transactionId,
        "targetId": data.targetId,
        "targetName": data.targetName or "Service / Facility",
        "raterId": rater_id,
        "raterName": current_user.get("name", "Farmer"),
        "raterRole": current_user.get("role", "FARMER"),
        "rating": data.rating,
        "reviewText": data.reviewText,
        "tags": data.tags,
        "status": "PUBLISHED",
        "createdAt": now_iso,
        "updatedAt": now_iso
    }

    res = await db.feedbacks.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc["_id"] = str(res.inserted_id)

    # In-App notification to rater thanking them
    await db.notifications.insert_one({
        "userId": rater_id,
        "type": "FEEDBACK_SUBMITTED",
        "title": "Feedback Submitted",
        "message": f"Thank you for rating {data.targetName or data.module.replace('_', ' ').title()}. Your review helps maintain high quality standards.",
        "recordId": doc["id"],
        "module": "FEEDBACK",
        "read": False,
        "createdAt": now_iso
    })

    return doc

@router.get("")
async def list_feedbacks(
    module: Optional[str] = None,
    target_id: Optional[str] = None,
    limit: int = 50
):
    db = get_database()
    query = {"status": "PUBLISHED"}
    if module:
        query["module"] = module
    if target_id:
        query["targetId"] = target_id

    feedbacks = await db.feedbacks.find(query).sort("createdAt", -1).to_list(limit)
    return serialize_mongo_docs(feedbacks)

@router.get("/summary")
async def get_feedback_summary(module: Optional[str] = None, target_id: Optional[str] = None):
    db = get_database()
    query = {"status": "PUBLISHED"}
    if module:
        query["module"] = module
    if target_id:
        query["targetId"] = target_id

    feedbacks = await db.feedbacks.find(query).to_list(500)
    total_reviews = len(feedbacks)
    if total_reviews == 0:
        return {
            "totalReviews": 0,
            "averageRating": 5.0,
            "ratingBreakdown": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        }

    sum_ratings = sum(f.get("rating", 5) for f in feedbacks)
    avg = round(sum_ratings / total_reviews, 2)
    breakdown = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for f in feedbacks:
        r = f.get("rating", 5)
        if r in breakdown:
            breakdown[r] += 1

    return {
        "totalReviews": total_reviews,
        "averageRating": avg,
        "ratingBreakdown": breakdown
    }

@router.post("/{feedback_id}/moderate")
async def moderate_feedback(
    feedback_id: str,
    data: ModerateFeedbackRequest,
    admin_user: dict = Depends(require_admin)
):
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()
    try:
        feedback = await db.feedbacks.find_one({"_id": ObjectId(feedback_id)})
    except Exception:
        feedback = await db.feedbacks.find_one({"id": feedback_id})

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    await db.feedbacks.update_one(
        {"_id": feedback["_id"]},
        {
            "$set": {
                "status": data.status,
                "moderatedBy": admin_user["id"],
                "moderationNotes": data.moderationNotes,
                "moderatedAt": now_iso
            }
        }
    )

    return {"success": True, "message": f"Feedback status changed to {data.status}"}
