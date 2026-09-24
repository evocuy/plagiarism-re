import os
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional, List

import jwt
from fastapi import APIRouter, Cookie, Depends, HTTPException, Header, Response, status
from pydantic import BaseModel, Field
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.schemas import User

router = APIRouter()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "b9148d88e4e7e609348b61c944f7743fa100234a9bebc04b3cfb9f5e")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440")) # Default 24 hours
SESSION_COOKIE_NAME = "plagiarism_session"

password_hash = PasswordHash.recommended()

# Pydantic Schemas
class LoginRequest(BaseModel):
    identifier: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=256)

class UserResponse(BaseModel):
    id: int
    identifier: str
    name: str
    email: str
    role: str
    program_studi: Optional[str] = None
    fakultas: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    token: str
    user: UserResponse

class CreateUserRequest(BaseModel):
    identifier: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=255)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6, max_length=256)
    role: Literal["mahasiswa", "dosen", "admin"]
    program_studi: Optional[str] = Field(default=None, max_length=255)
    fakultas: Optional[str] = Field(default=None, max_length=255)


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


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    plagiarism_session: Optional[str] = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    elif plagiarism_session:
        token = plagiarism_session

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autentikasi diperlukan. Silakan login terlebih dahulu.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token autentikasi tidak valid atau telah kedaluwarsa.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User tidak ditemukan atau nonaktif.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_optional_current_user(
    authorization: Optional[str] = Header(default=None),
    plagiarism_session: Optional[str] = Cookie(default=None),
    db: Session = Depends(get_db),
) -> Optional[User]:
    try:
        return get_current_user(authorization=authorization, plagiarism_session=plagiarism_session, db=db)
    except HTTPException:
        return None


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ("admin", "super_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak: Hanya administrator yang memiliki izin untuk operasi ini.",
        )
    return current_user


def seed_initial_users(db: Session) -> None:
    """Inisialisasi akun bawaan jika database masih kosong"""
    initial_accounts = [
        {
            "identifier": "198804152011011002",
            "name": "Bambang Wijaya, S.Kom.",
            "email": "admin.it@univ.ac.id",
            "password": "password123",
            "role": "admin",
            "program_studi": "Biro TI & Sistem Informasi",
            "fakultas": "Pusat Komputer Kampus",
        },
        {
            "identifier": "cihuy",
            "name": "Super Admin Cihuy",
            "email": "cihuy@localhost",
            "password": "akuraja",
            "role": "admin",
            "program_studi": "Biro TI & Sistem Informasi",
            "fakultas": "Pusat Komputer Kampus",
        },
        {
            "identifier": "0412087501",
            "name": "Dr. Ir. Hendra Gunawan, M.Kom.",
            "email": "hendra.gunawan@lecturer.univ.ac.id",
            "password": "password123",
            "role": "dosen",
            "program_studi": "Teknik Informatika",
            "fakultas": "Fakultas Ilmu Komputer",
        },
        {
            "identifier": "20210801142",
            "name": "Ahmad Rizky Pratama",
            "email": "ahmad.rizky@student.univ.ac.id",
            "password": "password123",
            "role": "mahasiswa",
            "program_studi": "Teknik Informatika",
            "fakultas": "Fakultas Ilmu Komputer",
        },
    ]

    for acc in initial_accounts:
        existing = db.query(User).filter(User.identifier == acc["identifier"]).first()
        if not existing:
            db.add(
                User(
                    identifier=acc["identifier"],
                    name=acc["name"],
                    email=acc["email"],
                    password_hash=password_hash.hash(acc["password"]),
                    role=acc["role"],
                    program_studi=acc["program_studi"],
                    fakultas=acc["fakultas"],
                    is_active=True,
                )
            )
    db.commit()


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.identifier == request.identifier).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="NIM / NIDN / NIP tidak ditemukan.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun ini telah dinonaktifkan oleh administrator.",
        )

    # Validasi kata sandi (argon2 atau fallback)
    valid = False
    try:
        valid = password_hash.verify(request.password, user.password_hash)
    except Exception:
        # Fallback jika password hash plaintext lama
        valid = (request.password == user.password_hash)

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kata sandi yang Anda masukkan salah.",
        )

    token = create_access_token(user)

    # Set HTTP-only Cookie
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=JWT_EXPIRE_MINUTES * 60,
        samesite="lax",
    )

    return {
        "token": token,
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=SESSION_COOKIE_NAME)
    return {"message": "Berhasil keluar dari sesi."}


@router.get("/users", response_model=List[UserResponse])
def list_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    """Admin Only: Ambil seluruh daftar pengguna"""
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    request: CreateUserRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin Only: Buat akun pengguna baru (Mahasiswa, Dosen, atau Admin)"""
    if db.query(User).filter(User.identifier == request.identifier).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pengguna dengan identifier '{request.identifier}' sudah terdaftar.",
        )

    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{request.email}' sudah digunakan.",
        )

    new_user = User(
        identifier=request.identifier,
        name=request.name,
        email=request.email,
        password_hash=password_hash.hash(request.password),
        role=request.role,
        program_studi=request.program_studi,
        fakultas=request.fakultas,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin Only: Hapus akun pengguna"""
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Anda tidak dapat menghapus akun Anda sendiri.",
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pengguna tidak ditemukan.",
        )

    db.delete(target_user)
    db.commit()
    return {"message": f"Pengguna '{target_user.name}' berhasil dihapus."}
