import secrets
import hmac
import hashlib
import time
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Unambiguous characters for tokens: excludes 0, O, 1, I to avoid confusion in voice/SMS/print
SAFE_TOKEN_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def generate_reference_token(prefix: str = "KNL-MKT", length: int = 5) -> str:
    """
    Generates a cryptographically random, non-sequential, unpredictable reference code.
    Example: KNL-MKT-7F42Q.
    Not derived from Aadhaar, phone number or personal identity.
    """
    random_part = "".join(secrets.choice(SAFE_TOKEN_CHARS) for _ in range(length))
    return f"{prefix}-{random_part}"

def verify_webhook_signature(payload: str, signature: str, secret: str) -> bool:
    """
    Verifies HMAC SHA-256 signature for webhook requests to protect against spoofing.
    """
    expected = hmac.new(secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)

def verify_replay_protection(timestamp: int, max_drift_seconds: int = 300) -> bool:
    """
    Prevents replay attacks by ensuring timestamp is within acceptable window.
    """
    now = int(time.time())
    return abs(now - timestamp) <= max_drift_seconds
