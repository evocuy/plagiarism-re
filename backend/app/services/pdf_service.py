import os
from pathlib import Path
from typing import Dict, Any
import pymupdf

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"

class PDFService:
    def _resolve_path(self, file_path: str) -> Path:
        """Mendukung path lintas platform (Docker Linux vs Windows)"""
        p = Path(file_path)
        if p.exists() and p.is_file():
            return p
        # Cari berdasarkan nama file di folder uploads
        filename = p.name
        fallback = UPLOAD_DIR / filename
        if fallback.exists() and fallback.is_file():
            return fallback
        return p

    def extract_text_from_pdf(self, file_path: str) -> Dict[str, Any]:
        resolved_path = self._resolve_path(file_path)
        if not resolved_path.exists():
            raise FileNotFoundError(f"File PDF tidak ditemukan: {resolved_path}")

        doc = pymupdf.open(str(resolved_path))
        full_text = []
        pages_data = []

        total_pages = len(doc)

        for page_num in range(total_pages):
            page = doc[page_num]
            text = page.get_text()
            full_text.append(text)
            pages_data.append({
                "page": page_num + 1,
                "text": text
            })

        doc.close()

        return {
            "full_text": "\n".join(full_text),
            "total_pages": total_pages,
            "pages": pages_data
        }