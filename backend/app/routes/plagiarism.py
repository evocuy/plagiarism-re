import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.database.session import get_db
from app.models.schemas import Document, PlagiarismCheck, User
from app.services.pdf_service import PDFService
from app.services.preprocessing_service import PreprocessingService
from app.routes.auth import get_optional_current_user

router = APIRouter()
pdf_service = PDFService()
preprocessor = PreprocessingService()
logger = logging.getLogger(__name__)

class SingleCheckRequest(BaseModel):
    document_id: int
    reference_document_id: int

@router.post("/check")
def check_similarity(
    request: SingleCheckRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Membandingkan 2 dokumen secara spesifik (dokumen A vs dokumen B)"""
    doc_a = db.query(Document).filter(Document.id == request.document_id).first()
    doc_b = db.query(Document).filter(Document.id == request.reference_document_id).first()

    if not doc_a or not doc_b:
        raise HTTPException(status_code=404, detail="Salah satu atau kedua dokumen tidak ditemukan di database.")

    data_a = pdf_service.extract_text_from_pdf(doc_a.file_path)
    data_b = pdf_service.extract_text_from_pdf(doc_b.file_path)

    clean_a = preprocessor.clean_text(data_a["full_text"])
    clean_b = preprocessor.clean_text(data_b["full_text"])

    if not clean_a.strip() or not clean_b.strip():
        score = 0.0
    else:
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([clean_a, clean_b])
        score = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])

    effective_user_id = current_user.id if current_user else doc_a.user_id

    check_record = PlagiarismCheck(
        document_id=doc_a.id,
        user_id=effective_user_id,
        overall_similarity=score,
        status="completed",
    )
    db.add(check_record)
    db.commit()
    db.refresh(check_record)

    return {
        "check_id": check_record.id,
        "target_document": doc_a.title,
        "reference_document": doc_b.title,
        "similarity_score": round(score, 4),
        "similarity_percentage": f"{round(score * 100, 2)}%",
        "status": check_record.status,
    }

@router.post("/check-repository/{document_id}")
def check_against_repository(
    document_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Membandingkan 1 dokumen mahasiswa terhadap SELURUH dokumen di repositori kampus"""
    target_doc = db.query(Document).filter(Document.id == document_id).first()
    if not target_doc:
        raise HTTPException(status_code=404, detail="Dokumen target tidak ditemukan.")

    repo_docs = db.query(Document).filter(Document.id != document_id).all()
    effective_user_id = current_user.id if current_user else target_doc.user_id

    # Jika repositori belum memiliki dokumen lain
    if not repo_docs:
        check_record = PlagiarismCheck(
            document_id=target_doc.id,
            user_id=effective_user_id,
            overall_similarity=0.0,
            status="completed",
        )
        db.add(check_record)
        db.commit()
        db.refresh(check_record)

        return {
            "check_id": check_record.id,
            "target_document": target_doc.title,
            "highest_similarity_percentage": "0.0%",
            "total_repository_checked": 0,
            "matches": [],
            "message": "Dokumen berhasil disimpan. Belum ada dokumen lain di repositori kampus untuk dibandingkan.",
        }

    try:
        target_data = pdf_service.extract_text_from_pdf(target_doc.file_path)
        clean_target = preprocessor.clean_text(target_data["full_text"])
    except Exception as e:
        logger.error(f"Gagal mengekstrak teks dari dokumen target {target_doc.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Gagal membaca teks dokumen target '{target_doc.title}': {str(e)}",
        )

    results = []
    max_score = 0.0

    for repo_doc in repo_docs:
        try:
            repo_data = pdf_service.extract_text_from_pdf(repo_doc.file_path)
            clean_repo = preprocessor.clean_text(repo_data["full_text"])

            if not clean_target.strip() or not clean_repo.strip():
                score = 0.0
            else:
                vectorizer = TfidfVectorizer()
                tfidf_matrix = vectorizer.fit_transform([clean_target, clean_repo])
                score = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])

            if score > max_score:
                max_score = score

            results.append({
                "repository_document_id": repo_doc.id,
                "title": repo_doc.title,
                "similarity_score": round(score, 4),
                "similarity_percentage": f"{round(score * 100, 2)}%",
            })
        except Exception as repo_err:
            logger.warning(f"Melewati dokumen repositori ID {repo_doc.id} karena error: {repo_err}")
            continue

    results.sort(key=lambda x: x["similarity_score"], reverse=True)

    check_record = PlagiarismCheck(
        document_id=target_doc.id,
        user_id=effective_user_id,
        overall_similarity=max_score,
        status="completed",
    )
    db.add(check_record)
    db.commit()
    db.refresh(check_record)

    return {
        "check_id": check_record.id,
        "target_document": target_doc.title,
        "highest_similarity_percentage": f"{round(max_score * 100, 2)}%",
        "total_repository_checked": len(results),
        "matches": results,
    }

@router.get("/history")
def get_check_history(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """
    Mengambil riwayat pengecekan.
    Jika login sebagai mahasiswa, hanya tampilkan riwayat pengecekan naskah miliknya.
    Jika login sebagai dosen atau admin, tampilkan seluruh riwayat pengecekan.
    """
    query = db.query(PlagiarismCheck)

    if current_user and current_user.role == "mahasiswa":
        query = query.join(Document, PlagiarismCheck.document_id == Document.id).filter(
            (PlagiarismCheck.user_id == current_user.id) | (Document.user_id == current_user.id)
        )

    checks = query.order_by(PlagiarismCheck.created_at.desc()).all()

    results = []
    for check in checks:
        doc = check.document
        doc_user = doc.user if doc and doc.user else (check.user if check.user else None)
        results.append({
            "id": check.id,
            "document_id": check.document_id,
            "user_id": check.user_id or (doc.user_id if doc else None),
            "owner_name": doc_user.name if doc_user else "Anonim",
            "owner_identifier": doc_user.identifier if doc_user else "-",
            "title": doc.title if doc else "Dokumen tidak ditemukan",
            "document_type": doc.document_type if doc else "Unknown",
            "file_path": doc.file_path if doc else "",
            "overall_similarity": check.overall_similarity,
            "similarity_percentage": f"{round(check.overall_similarity * 100, 2)}%",
            "status": check.status,
            "created_at": check.created_at.isoformat() if check.created_at else None,
        })
    return results