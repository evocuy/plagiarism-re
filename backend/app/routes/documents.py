from app.models.schemas import PlagiarismCheck
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session

from ..database.session import get_db
from ..models.schemas import Document

router = APIRouter()
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Hanya file PDF yang diizinkan.")

    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Simpan ke PostgreSQL
    db_doc = Document(
        title=file.filename,
        document_type="skripsi",
        file_path=str(file_path)
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    return {
        "id": db_doc.id,
        "filename": db_doc.title,
        "file_path": db_doc.file_path,
        "message": "File berhasil diunggah dan tersimpan di database."
    }

@router.get("/")
def get_all_documents(db: Session = Depends(get_db)):
    return db.query(Document).all()

@router.delete("/clear")
def clear_all_documents(db: Session = Depends(get_db)):
    # 1. Hapus riwayat pengecekan dan dokumen di database
    db.query(PlagiarismCheck).delete()
    db.query(Document).delete()
    db.commit()

    # 2. Hapus seluruh file PDF fisik di folder uploads
    for file_path in UPLOAD_DIR.glob("*.pdf"):
        try:
            file_path.unlink()
        except Exception:
            pass

    return {"message": "Seluruh isi tabel database dan file di folder uploads berhasil dibersihkan."}