import pymupdf 
from typing import Dict, Any

class PDFService:
    def extract_text_from_pdf(self, file_path: str) -> Dict[str, Any]:
        doc = pymupdf.open(file_path)
        full_text = []
        pages_data = []
        
        # Simpan total halaman sebelum dokumen ditutup
        total_pages = len(doc)

        for page_num in range(total_pages):
            page = doc[page_num]
            text = page.get_text()
            full_text.append(text)
            pages_data.append({
                "page": page_num + 1,
                "text": text
            })

        # Tutup dokumen PyMuPDF setelah selesai membaca seluruh halaman
        doc.close()

        return {
            "full_text": "\n".join(full_text),
            "total_pages": total_pages,
            "pages": pages_data
        }