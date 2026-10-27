import logging
from datetime import datetime, timezone
from typing import Optional
from app.db.mongo import get_database

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    async def queue_notification(
        recipient_phone: str,
        message: str,
        message_te: Optional[str] = None,
        channel: str = "SMS",
        related_id: Optional[str] = None
    ):
        db = get_database()
        now_iso = datetime.now(timezone.utc).isoformat()
        
        notification_doc = {
            "recipientPhone": recipient_phone,
            "channel": channel,
            "message": message,
            "messageTe": message_te or message,
            "relatedId": related_id,
            "status": "QUEUED",
            "attempts": 0,
            "createdAt": now_iso,
            "updatedAt": now_iso
        }
        res = await db.notifications.insert_one(notification_doc)
        notification_id = str(res.inserted_id)

        # Enqueue into durable outbox
        outbox_doc = {
            "notificationId": notification_id,
            "recipientPhone": recipient_phone,
            "channel": channel,
            "message": message,
            "messageTe": message_te,
            "status": "PENDING",
            "retryCount": 0,
            "scheduledAt": now_iso
        }
        await db.notification_outbox.insert_one(outbox_doc)
        
        # Immediate dispatch attempt (Mock / Sandboxed)
        await NotificationService.dispatch_outbox_item(notification_id, recipient_phone, message, channel)
        return notification_id

    @staticmethod
    async def dispatch_outbox_item(notification_id: str, phone: str, message: str, channel: str):
        db = get_database()
        now_iso = datetime.now(timezone.utc).isoformat()
        # In Pilot mode, simulate provider delivery
        logger.info(f"[{channel}_DISPATCH] To: {phone} | Content: {message}")
        from bson import ObjectId
        try:
            query = {"_id": ObjectId(notification_id)}
        except Exception:
            query = {"_id": notification_id}
            
        await db.notifications.update_one(
            query,
            {"$set": {"status": "DELIVERED", "sentAt": now_iso, "attempts": 1}}
        )
        await db.notification_outbox.update_one(
            {"notificationId": notification_id},
            {"$set": {"status": "COMPLETED", "processedAt": now_iso}}
        )

notification_service = NotificationService()
