"use client";

import { useState } from "react";
import { uploadDocument, checkRepository } from "@/lib/api";

interface MatchResult {
  repository_document_id: number;
  title: string;
  similarity_percentage: string;
}

interface CheckResponse {
  check_id: number;
  target_document: string;
  highest_similarity_percentage: string;
  total_repository_checked: number;
  matches: MatchResult[];
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [error, setError] = useState("");

  const handleProcess = async () => {
    if (!file) return alert("Pilih file PDF terlebih dahulu!");
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const uploadRes = await uploadDocument(file);
      const checkRes = await checkRepository(uploadRes.id);
      setResult(checkRes);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem saat menghubungi backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Plagiarism Checker Kampus</h1>
      <p className="text-slate-600 mb-8">Cek kemiripan skripsi & proposal terhadap repositori internal.</p>

      {/* Box Upload */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Unggah File PDF (Skripsi / Sempro)</label>
        <div className="flex gap-4">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={handleProcess}
            disabled={loading || !file}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 transition-colors shrink-0"
          >
            {loading ? "Memproses..." : "Periksa Kemiripan"}
          </button>
        </div>
      </div>

      {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      {/* Hasil Pemeriksaan */}
      {result && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{result.target_document}</h2>
              <p className="text-sm text-slate-500">Total repositori diperiksa: {result.total_repository_checked} dokumen</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-slate-500">Tingkat Kemiripan Tertinggi</span>
              <p className="text-3xl font-bold text-blue-600">{result.highest_similarity_percentage}</p>
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold text-slate-700 mb-4">Dokumen Repositori Terkait:</h3>
            <div className="space-y-3">
              {result.matches.map((item) => (
                <div key={item.repository_document_id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-medium text-slate-700">{item.title}</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full text-sm">
                    {item.similarity_percentage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}