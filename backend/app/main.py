from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, documents, plagiarism
from app.database.session import Base, SessionLocal, engine

# Buat tabel di PostgreSQL secara otomatis jika belum ada
Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    auth.ensure_development_super_admin(db)

app = FastAPI(title="Plagiarism Checker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(plagiarism.router, prefix="/api/plagiarism", tags=["Plagiarism"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Plagiarism Checker API is running"}