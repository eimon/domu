from fastapi import FastAPI
from core.config import settings
from routers import auth, property, guest, booking, cost, pricing
from exceptions.handlers import register_exception_handlers
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)
register_exception_handlers(app)
app.include_router(auth.router)
app.include_router(property.router)
app.include_router(guest.router)
app.include_router(booking.router)
app.include_router(cost.router)
app.include_router(pricing.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Domu API", "project": settings.PROJECT_NAME}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
