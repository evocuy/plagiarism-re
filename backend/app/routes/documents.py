import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.models.schemas import PlagiarismCheck
from app.routes.auth import get_current_user, require_roles
from ..database.session import get_db
from ..models.schemas import Document

router = APIRouter(dependencies=[Depends(get_current_user)])
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Hanya file PDF yang diizinkan.")

    clean_type = document_type.strip().lower()
    if not clean_type:
        raise HTTPException(status_code=400, detail="Tipe dokumen wajib diisi (skripsi/proposal).")

    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Simpan ke PostgreSQL dengan tipe dokumen dinamis
    db_doc = Document(
        title=file.filename,
        document_type=clean_type,
        file_path=str(file_path)
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    return {
        "id": db_doc.id,
        "filename": db_doc.title,
        "document_type": db_doc.document_type,
        "file_path": db_doc.file_path,
        "message": f"File berhasil diunggah sebagai dokumen {db_doc.document_type.upper()} dan tersimpan di database."
    }

@router.get("/")
def get_all_documents(db: Session = Depends(get_db)):
    return db.query(Document).all()

@router.delete("/clear")
def clear_all_documents(
    db: Session = Depends(get_db),
    _: object = Depends(require_roles("super_admin")),
):
    # 1. Hapus seluruh isi tabel dan reset urutan ID (auto-increment) ke angka 1
    db.execute(text("TRUNCATE TABLE documents, plagiarism_checks RESTART IDENTITY CASCADE;"))
    db.commit()

    # 2. Hapus seluruh file PDF fisik di folder uploads
    for file_path in UPLOAD_DIR.glob("*.pdf"):
        try:
            file_path.unlink()
        except Exception:
            pass

    return {"message": "Seluruh isi tabel database dan file di folder uploads berhasil dibersihkan, ID telah di-reset ke 1."}