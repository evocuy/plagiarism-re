from datetime import datetime, timedelta, timezone
import os
from typing import Literal

import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from pydantic import BaseModel, Field
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.schemas import User

load_dotenv()

router = APIRouter()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))
APP_ENV = os.getenv("APP_ENV", "development")
SESSION_COOKIE_NAME = "plagiarism_session"

if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY must be configured before starting the API.")

password_hash = PasswordHash.recommended()


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=256)


class AuthenticatedUser(BaseModel):
    id: int
    identifier: str
    name: str
    email: str
    role: Literal["mahasiswa", "dosen", "super_admin"]
    program_studi: str | None = None
    fakultas: str | None = None


class LoginResponse(BaseModel):
    user: AuthenticatedUser


class CreateUserRequest(BaseModel):
    identifier: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=255)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=256)
    role: Literal["mahasiswa", "dosen"]
    program_studi: str | None = Field(default=None, max_length=255)
    fakultas: str | None = Field(default=None, max_length=255)


def ensure_development_super_admin(db: Session) -> None:
    """Create the documented local development administrator once."""
    if APP_ENV != "development":
        return

    user = db.query(User).filter(User.identifier == "cihuy").first()
    if user:
        return

    db.add(
        User(
            identifier="cihuy",
            name="Super Admin",
            email="cihuy@localhost",
            password_hash=password_hash.hash("akuraja"),
            role="super_admin",
            is_active=True,
        )
    )
    db.commit()


def create_access_token(user: User) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    return jwt.encode(
        {
            "sub": str(user.id),
            "identifier": user.identifier,
            "role": user.role,
            "exp": expires_at,
        },
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


def serialize_user(user: User) -> AuthenticatedUser:
    return AuthenticatedUser(
        id=user.id,
        identifier=user.identifier,
        name=user.name,
        email=user.email,
        role=user.role,
        program_studi=user.program_studi,
        fakultas=user.fakultas,
    )


def get_current_user(
    plagiarism_session: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    db: Session = Depends(get_db),
) -> User:
    if not plagiarism_session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesi tidak ditemukan.")

    try:
        payload = jwt.decode(plagiarism_session, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub", ""))
    except (jwt.InvalidTokenError, TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesi tidak valid.") from None

    user = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Pengguna tidak aktif atau tidak ditemukan.")

    return user


def require_roles(*allowed_roles: Literal["mahasiswa", "dosen", "super_admin"]):
    def role_guard(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Anda tidak memiliki akses ke sumber daya ini.")
        return current_user

    return role_guard


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    identifier = payload.identifier.strip()

    user = db.query(User).filter(User.identifier == identifier, User.is_active.is_(True)).first()
    if not user or not password_hash.verify(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifier atau kata sandi salah.")

    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=create_access_token(user),
        httponly=True,
        secure=APP_ENV == "production",
        samesite="lax",
        max_age=JWT_EXPIRE_MINUTES * 60,
        path="/",
    )
    return LoginResponse(user=serialize_user(user))


@router.post("/users", response_model=AuthenticatedUser, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: CreateUserRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("super_admin")),
):
    identifier = payload.identifier.strip()
    email = payload.email.strip().lower()

    existing_user = (
        db.query(User)
        .filter((User.identifier == identifier) | (User.email == email))
        .first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Identifier atau email sudah digunakan.",
        )

    user = User(
        identifier=identifier,
        name=payload.name.strip(),
        email=email,
        password_hash=password_hash.hash(payload.password),
        role=payload.role,
        program_studi=payload.program_studi.strip() if payload.program_studi else None,
        fakultas=payload.fakultas.strip() if payload.fakultas else None,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return serialize_user(user)


@router.get("/me", response_model=AuthenticatedUser)
def get_me(current_user: User = Depends(get_current_user)):
    return serialize_user(current_user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/", httponly=True, secure=APP_ENV == "production", samesite="lax")