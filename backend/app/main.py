from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import documents, plagiarism
from app.database.session import Base, engine

# Buat tabel di PostgreSQL secara otomatis jika belum ada
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Plagiarism Checker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(plagiarism.router, prefix="/api/plagiarism", tags=["Plagiarism"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Plagiarism Checker API is running"}