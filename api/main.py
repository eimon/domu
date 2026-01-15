from fastapi import FastAPI
from core.config import settings
from core.database import engine, Base
from routers import auth, property, guest, booking
import contextlib
from exceptions.handlers import register_exception_handlers
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME, 
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)
register_exception_handlers(app)
app.include_router(auth.router)
app.include_router(property.router)
app.include_router(guest.router)
app.include_router(booking.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Domu API", "project": settings.PROJECT_NAME}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
