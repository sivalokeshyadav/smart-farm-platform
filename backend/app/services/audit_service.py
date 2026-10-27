from datetime import datetime, timezone
from typing import Optional, Dict, Any
from app.db.mongo import get_database

async def record_audit_log(
    action: str,
    resource: str,
    resource_id: Optional[str] = None,
    user_id: Optional[str] = None,
    user_role: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
):
    try:
        db = get_database()
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": action,
            "resource": resource,
            "resourceId": resource_id,
            "userId": user_id,
            "userRole": user_role,
            "details": details or {},
            "ipAddress": ip_address
        }
        await db.audit_logs.insert_one(log_entry)
    except Exception as e:
        # Logging failure should not crash main transaction, but be recorded to stderr
        print(f"[AUDIT_ERROR] Failed to record audit log: {e}")
