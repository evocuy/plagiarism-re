const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function uploadDocument(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/documents/upload`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) throw new Error("Gagal mengunggah dokumen");
    return res.json();
}

export async function checkRepository(documentId: number) {
    const res = await fetch(`${API_BASE}/api/plagiarism/check-repository/${documentId}`, {
        method: "POST",
    });

    if (!res.ok) throw new Error("Gagal mengecek kemiripan repositori");
    return res.json();
}