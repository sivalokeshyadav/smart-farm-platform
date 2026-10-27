from fastapi import APIRouter, Depends
from app.db.mongo import get_database
from app.api.deps import get_current_user, require_admin

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts"])

@router.get("/my")
async def get_my_notifications(current_user: dict = Depends(get_current_user)):
    db = get_database()
    notifications = await db.notifications.find({
        "recipientPhone": current_user["phone"]
    }).sort("createdAt", -1).to_list(50)
    for n in notifications:
        n["id"] = str(n["_id"])
    return notifications

@router.get("/outbox", dependencies=[Depends(require_admin)])
async def get_outbox_queue():
    db = get_database()
    outbox = await db.notification_outbox.find().sort("scheduledAt", -1).to_list(50)
    for o in outbox:
        o["id"] = str(o["_id"])
    return outbox
