from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.user import UserCreate, UserResponse, Token
from services.auth_service import AuthService
from core.database import get_db
from dependencies.auth import get_current_user
from models.user import User as Usuario

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user."""
    return await AuthService(db).register_user(user_in)


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Login and get access token. OAuth2 specifies username field, we map it to email."""
    return await AuthService(db).authenticate_user(form_data.username, form_data.password)


@router.get("/perfil", response_model=UserResponse)
async def perfil(current_user: Usuario = Depends(get_current_user)):
    """Get current user profile."""
    return current_user