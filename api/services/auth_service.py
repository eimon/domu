from fastapi import HTTPException, status
from models.user import User
from schemas.user import UserCreate, Token
from repositories.user_repository import UserRepository
from core.security import verify_password, get_password_hash, create_access_token
from core.config import settings

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def register_user(self, user_create: UserCreate) -> User:
        existing_user = await self.user_repo.get_by_email(user_create.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        
        hashed_password = get_password_hash(user_create.password)
        new_user = await self.user_repo.create(user_create, hashed_password)
        return new_user

    async def authenticate_user(self, email: str, password: str) -> Token:
        user = await self.user_repo.get_by_email(email)
        if not user or not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(subject=user.email)
        return Token(access_token=access_token, token_type="bearer")
