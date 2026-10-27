import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.mongo import connect_to_mongo, close_mongo_connection
from app.api.v1.routers import (
    auth, markets, bookings, ivrs, godowns,
    marketplace, schemes, calculators, crop_diagnoses,
    weather_prices, notifications, support_cases, admin,
    field_services, feedbacks
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("smart_farmer_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to Mongo and create indexes
    logger.info("Initializing Smart Farmer Platform backend...")
    await connect_to_mongo()
    yield
    # Shutdown: close Mongo connection
    logger.info("Shutting down Smart Farmer Platform backend...")
    await close_mongo_connection()

app = FastAPI(
    title="Smart Farmer Platform API",
    description="Full-stack pilot platform for Kurnool District, Andhra Pradesh. Connects farmers to market-yard bookings, IVR telephony, godowns, inputs, schemes, calculators, and AI crop screening.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permissive for local pilot frontend dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# Exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=getattr(exc, "headers", None)
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on {request.method} {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

# Health check
@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    return {
        "status": "HEALTHY",
        "service": "Smart Farmer Platform Backend",
        "district": settings.DEFAULT_DISTRICT,
        "state": settings.DEFAULT_STATE,
        "ivrMode": settings.IVR_MODE,
        "version": "1.0.0"
    }

# Mount API v1 Routers
api_v1_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(markets.router, prefix=api_v1_prefix)
app.include_router(bookings.router, prefix=api_v1_prefix)
app.include_router(ivrs.router, prefix=api_v1_prefix)
app.include_router(godowns.router, prefix=api_v1_prefix)
app.include_router(marketplace.router, prefix=api_v1_prefix)
app.include_router(schemes.router, prefix=api_v1_prefix)
app.include_router(calculators.router, prefix=api_v1_prefix)
app.include_router(crop_diagnoses.router, prefix=api_v1_prefix)
app.include_router(weather_prices.router, prefix=api_v1_prefix)
app.include_router(notifications.router, prefix=api_v1_prefix)
app.include_router(support_cases.router, prefix=api_v1_prefix)
app.include_router(admin.router, prefix=api_v1_prefix)
app.include_router(field_services.router, prefix=api_v1_prefix)
app.include_router(feedbacks.router, prefix=api_v1_prefix)

# Reload trigger for data.gov.in daily market prices and All-India locations - 2026-10-16T03:21




# Reloaded at 1793117631.9635499

# Reloaded at 1793117936.5764542

# Reloaded at 1793118085.6606367

# Reloaded at 1793119442.5626965

# Reloaded at 1793119847.7975187

# Reloaded at 1793120051.1723979

# Reloaded at 1793120483.0738585
