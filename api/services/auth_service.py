from models.user import User
from schemas.user import UserCreate, Token
from repositories.user_repository import UserRepository
from core.security import verify_password, get_password_hash, create_access_token
from exceptions.general import ConflictException, UnauthorizedException
from sqlalchemy.ext.asyncio import AsyncSession


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register_user(self, user_create: UserCreate) -> User:
        """Register a new user. Business logic and validations go here."""
        if await self.user_repo.get_by_email(user_create.email):
            raise ConflictException("Email ya registrado")

        hashed_password = get_password_hash(user_create.password)
        return await self.user_repo.create(user_create, hashed_password)

    async def authenticate_user(self, username: str, password: str) -> Token:
        """Authenticate user and return access token."""
        user = await self.user_repo.get_by_username(username)

        if not user or not user.hashed_password:
            raise UnauthorizedException("Usuario o contraseña incorrectos")

        if not verify_password(password, user.hashed_password):
            raise UnauthorizedException("Usuario o contraseña incorrectos")

        return Token(
            access_token=create_access_token(
                subject=str(user.id),
                claims={"role": user.role.value if hasattr(user.role, 'value') else user.role}
            ),
            token_type="bearer",
        )
