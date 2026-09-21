from fastapi import APIRouter, HTTPException, Depends
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.database.session import get_db
from app.models.schemas import Document, PlagiarismCheck
from app.services.pdf_service import PDFService
from app.services.preprocessing_service import PreprocessingService

router = APIRouter()
pdf_service = PDFService()
preprocessor = PreprocessingService()

class SingleCheckRequest(BaseModel):
    document_id: int
    reference_document_id: int

@router.post("/check")
def check_similarity(request: SingleCheckRequest, db: Session = Depends(get_db)):
    """Membandingkan 2 dokumen secara spesifik (dokumen A vs dokumen B)"""
    doc_a = db.query(Document).filter(Document.id == request.document_id).first()
    doc_b = db.query(Document).filter(Document.id == request.reference_document_id).first()

    if not doc_a or not doc_b:
        raise HTTPException(status_code=404, detail="Salah satu atau kedua dokumen tidak ditemukan di database.")

    data_a = pdf_service.extract_text_from_pdf(doc_a.file_path)
    data_b = pdf_service.extract_text_from_pdf(doc_b.file_path)

    clean_a = preprocessor.clean_text(data_a["full_text"])
    clean_b = preprocessor.clean_text(data_b["full_text"])

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([clean_a, clean_b])
    score = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])

    check_record = PlagiarismCheck(
        document_id=doc_a.id,
        overall_similarity=score,
        status="completed"
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
        "status": check_record.status
    }

@router.post("/check-repository/{document_id}")
def check_against_repository(document_id: int, db: Session = Depends(get_db)):
    """Membandingkan 1 dokumen mahasiswa terhadap SELURUH dokumen di repositori kampus"""
    target_doc = db.query(Document).filter(Document.id == document_id).first()
    if not target_doc:
        raise HTTPException(status_code=404, detail="Dokumen target tidak ditemukan.")

    # Ambil semua dokumen lain di database selain dokumen target
    repo_docs = db.query(Document).filter(Document.id != document_id).all()
    if not repo_docs:
        raise HTTPException(status_code=400, detail="Belum ada dokumen lain di repositori kampus untuk dibandingkan.")

    # Ekstrak & preprocess dokumen target
    target_data = pdf_service.extract_text_from_pdf(target_doc.file_path)
    clean_target = preprocessor.clean_text(target_data["full_text"])

    results = []
    max_score = 0.0

    # Iterasi dan hitung similarity terhadap setiap dokumen repositori
    for repo_doc in repo_docs:
        repo_data = pdf_service.extract_text_from_pdf(repo_doc.file_path)
        clean_repo = preprocessor.clean_text(repo_data["full_text"])

        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([clean_target, clean_repo])
        score = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])

        if score > max_score:
            max_score = score

        results.append({
            "repository_document_id": repo_doc.id,
            "title": repo_doc.title,
            "similarity_score": round(score, 4),
            "similarity_percentage": f"{round(score * 100, 2)}%"
        })

    # Urutkan hasil dari persentase kemiripan tertinggi ke terendah
    results.sort(key=lambda x: x["similarity_score"], reverse=True)

    # Simpan skor kemiripan tertinggi ke database
    check_record = PlagiarismCheck(
        document_id=target_doc.id,
        overall_similarity=max_score,
        status="completed"
    )
    db.add(check_record)
    db.commit()
    db.refresh(check_record)

    return {
        "check_id": check_record.id,
        "target_document": target_doc.title,
        "highest_similarity_percentage": f"{round(max_score * 100, 2)}%",
        "total_repository_checked": len(repo_docs),
        "matches": results
    }