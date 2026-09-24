# Plagiarism Checker (Sistem Pengecekan Kemiripan Dokumen)

Sistem pendeteksi kemiripan/plagiarisme untuk naskah skripsi dan proposal seminar (sempro) kampus. Dibangun menggunakan arsitektur:
- **Backend**: FastAPI (Python 3.12/3.13) + PyMuPDF + Sastrawi + scikit-learn (TF-IDF & Cosine Similarity) + SQLAlchemy
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS + Lucide Icons
- **Database**: PostgreSQL (port default `5432`)

---

## 🛠️ Ringkasan Masalah Sebelumnya & Solusinya

Jika sebelumnya Anda mengalami kendala saat menjalankan project, berikut penyebab dan solusi yang telah diperbaiki:
1. **Navigasi Terminal & Virtual Environment**:
   - Folder `.venv` berada di dalam direktori `backend/`, sehingga perintah `.venv\Scripts\activate` harus dijalankan setelah masuk ke dalam folder `backend/`.
2. **Koneksi Database PostgreSQL**:
   - `backend/.env` sebelumnya mengarah ke port `12345` dengan password salah. Container PostgreSQL yang aktif berjalan pada port `5432` dengan user `postgres` dan password `evopuki123` (`plagiarism_db`). File `.env` sudah disesuaikan.
3. **Mismatched Kolom Database (`is_active`)**:
   - Kolom `is_active` pada tabel `users` awalnya bertipe `INTEGER` di PostgreSQL, sedangkan model SQLAlchemy mengharapkan `BOOLEAN`. Tipe data ini telah di-migrasi menjadi `BOOLEAN`.
4. **Port Frontend & File Lock Turbopack**:
   - Frontend diatur berjalan di **port 3001** (lihat `package.json`). Sisa lock dari container docker sebelumnya (`.next/dev/lock`) telah dibersihkan sehingga server frontend Next.js dapat berjalan normal.

---

## 🚀 Panduan Menjalankan Project

### 1. Pastikan Database PostgreSQL Berjalan
Database PostgreSQL berjalan di port `5432`. Jika menggunakan Docker Desktop, pastikan container `plagiarism-db` aktif:
```bash
docker start plagiarism-db
```
*Detail Database:*
- Host: `localhost`
- Port: `5432`
- Database: `plagiarism_db`
- Username: `postgres`
- Password: `evopuki123`

---

### 2. Menjalankan Backend (FastAPI)

1. Buka terminal baru dan masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
2. Aktifkan virtual environment (Windows PowerShell / CMD):
   ```bash
   .\.venv\Scripts\activate
   ```
3. *(Opsional)* Pastikan seluruh dependensi terpasang:
   ```bash
   pip install -r requirements.txt
   ```
4. Jalankan server FastAPI:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
- API Backend aktif di: **http://localhost:8000**
- Dokumentasi Swagger UI: **http://localhost:8000/docs**
- Health Check: **http://localhost:8000/api/health**

---

### 3. Menjalankan Frontend (Next.js)

1. Buka terminal baru lainnya dan masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```
2. *(Opsional)* Pastikan dependensi Node terpasang:
   ```bash
   npm install
   ```
3. Jalankan server development Next.js:
   ```bash
   npm run dev
   ```
- Frontend aktif di: **http://localhost:3000**

---

## 🔑 Akun Default Pengembangan (Development)

Sistem secara otomatis menginisialisasi akun administrator (Super Admin) untuk keperluan pengujian lokal:
- **Identifier / Username**: `cihuy`
- **Password**: `akuraja`
- **Role**: `super_admin`

---

## 📂 Struktur Utama Proyek

```text
plagiarism-re/
├── backend/
│   ├── .venv/               # Virtual Environment Python
│   ├── app/
│   │   ├── main.py          # Entrypoint FastAPI
│   │   ├── database/        # Koneksi SQLAlchemy session
│   │   ├── models/          # Model & Schema tabel
│   │   ├── routes/          # Router API (auth, documents, plagiarism)
│   │   └── services/        # Preprocessing, PDF extraction, TF-IDF
│   ├── requirements.txt
│   └── .env                 # Environment database & JWT
├── frontend/
│   ├── app/                 # Halaman Next.js App Router (dashboard, riwayat, upload, dll.)
│   ├── components/          # Komponen UI & Dashboard layout
│   ├── lib/                 # API Client (fetch wrapper) & formatting
│   ├── package.json
│   └── .env.local           # NEXT_PUBLIC_API_URL=http://localhost:8000
└── docker-compose.yml       # Konfigurasi container PostgreSQL & aplikasi
```
