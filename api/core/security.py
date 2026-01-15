from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from core.config import settings
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None, claims: dict[str, Any] = None) -> str:
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expire, "sub": str(subject)}
    if claims:
        to_encode.update(claims)
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.JWTError:
        raise Exception("Could not validate credentials")



# async def create_access_token(username: str, user_id: int,rol:str, expires_delta: timedelta):
#     encode = {'sub':username, 'id': user_id, 'rol':rol}
#     expire = datetime.utcnow() + expires_delta
#     encode.update({'exp':expire})
#     return jwt.encode(encode, SECRET_KEY,algorithm=ALGORITHM)