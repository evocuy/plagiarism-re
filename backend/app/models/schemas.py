# pyrefly: ignore [missing-import]
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database.session import Base

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