# pyrefly: ignore [missing-import]
from sqlalchemy import Boolean, Column, String, Integer, Float, DateTime, ForeignKey, Text
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    identifier = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False, index=True)
    program_studi = Column(String(255), nullable=True)
    fakultas = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    document_type = Column(String, default="skripsi") # skripsi / proposal
    file_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PlagiarismCheck(Base):
    __tablename__ = "plagiarism_checks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    overall_similarity = Column(Float, nullable=False)
    status = Column(String, default="completed") # pending, processing, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document")