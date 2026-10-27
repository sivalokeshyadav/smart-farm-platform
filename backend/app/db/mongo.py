import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger(__name__)

class MongoManager:
    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None

mongo_manager = MongoManager()

def serialize_mongo_doc(doc: dict | None) -> dict | None:
    if not doc:
        return None
    d = dict(doc)
    if "_id" in d:
        d["id"] = str(d["_id"])
        d["_id"] = str(d["_id"])
    return d

def serialize_mongo_docs(docs: list) -> list:
    return [serialize_mongo_doc(d) for d in docs if d is not None]

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}")
    mongo_manager.client = AsyncIOMotorClient(settings.MONGODB_URL)
    mongo_manager.db = mongo_manager.client[settings.DATABASE_NAME]
    await init_db_indexes()
    logger.info("Connected to MongoDB successfully with indexes initialized")

async def close_mongo_connection():
    if mongo_manager.client:
        logger.info("Closing MongoDB connection")
        mongo_manager.client.close()

def get_database() -> AsyncIOMotorDatabase:
    if mongo_manager.db is None:
        mongo_manager.client = AsyncIOMotorClient(settings.MONGODB_URL)
        mongo_manager.db = mongo_manager.client[settings.DATABASE_NAME]
    return mongo_manager.db

async def init_db_indexes():
    db = mongo_manager.db
    if db is None:
        return

    # User indexes
    await db.users.create_index("phone", unique=True)
    await db.users.create_index("role")

    # Farmer Profile
    await db.farmer_profiles.create_index("userId", unique=True)
    await db.farmer_profiles.create_index("district")

    # Market & Slots indexes
    await db.markets.create_index("district")
    await db.market_slots.create_index([("marketId", 1), ("date", 1), ("slotTime", 1), ("commodity", 1)], unique=True)

    # Bookings indexes
    await db.bookings.create_index("bookingReference", unique=True)
    await db.bookings.create_index("farmerId")
    await db.bookings.create_index("marketId")
    await db.bookings.create_index("idempotencyKey", unique=True, partialFilterExpression={"idempotencyKey": {"$type": "string"}})
    await db.godown_reservations.create_index("idempotencyKey", unique=True, partialFilterExpression={"idempotencyKey": {"$type": "string"}})
    await db.bookings.create_index([("marketId", 1), ("date", 1)])

    # Godown & Reservations
    await db.godowns.create_index("district")
    await db.godown_reservations.create_index("reservationReference", unique=True)
    await db.godown_reservations.create_index("farmerId")
    await db.godown_reservations.create_index("godownId")

    # Sellers & Products
    await db.sellers.create_index("userId", unique=True)
    await db.sellers.create_index("verificationStatus")
    await db.products.create_index([("sellerId", 1), ("category", 1)])
    await db.products.create_index("isApproved")

    # Orders
    await db.orders.create_index("orderReference", unique=True)
    await db.orders.create_index("farmerId")
    await db.orders.create_index("sellerId")

    # Government Schemes & Cases
    await db.schemes.create_index("schemeCode", unique=True)
    await db.schemes.create_index("jurisdiction")
    await db.scheme_cases.create_index("caseReference", unique=True)
    await db.scheme_cases.create_index("farmerId")

    # IVR Sessions
    await db.ivr_sessions.create_index("sessionId", unique=True)
    await db.ivr_sessions.create_index("callerPhone")
    await db.ivr_sessions.create_index("createdAt", expireAfterSeconds=86400) # TTL 24 hours

    # Notifications & Outbox
    await db.notifications.create_index("recipientPhone")
    await db.notifications.create_index("status")
    await db.notification_outbox.create_index([("status", 1), ("scheduledAt", 1)])

    # Support Cases & Audit Logs
    await db.support_cases.create_index("caseNumber", unique=True)
    await db.support_cases.create_index("status")
    await db.audit_logs.create_index([("timestamp", -1), ("action", 1)])
    await db.audit_logs.create_index("userId")
