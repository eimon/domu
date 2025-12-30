from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from schemas.user import UserCreate, UserResponse, Token
from services.auth_service import AuthService
from repositories.user_repository import UserRepository
from core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/auth", tags=["auth"])

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    repo = UserRepository(db)
    return AuthService(repo)

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, service: AuthService = Depends(get_auth_service)):
    return await service.register_user(user_in)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), service: AuthService = Depends(get_auth_service)):
    # OAuth2 specifies username field, we map it to email
    return await service.authenticate_user(form_data.username, form_data.password)
