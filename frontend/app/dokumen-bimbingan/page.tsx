"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Users,
  Check,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  FileText,
  Search,
  FileSearch,
} from "lucide-react";
import { getSimilarityColorClass, getStatusBadgeClass } from "@/lib/formatters";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface PendingDocument {
  id: string;
  studentName: string;
  nim: string;
  title: string;
  chapter: string;
  type: "Skripsi" | "Proposal Sempro";
  submittedAt: string;
  similarityScore: number;
  status: "Menunggu Review";
}

const INITIAL_PENDING_DOCS: PendingDocument[] = [
  {
    id: "REV-2026-101",
    studentName: "Dian Permatasari",
    nim: "20210801089",
    title: "Klasifikasi Citra Rontgen Paru-paru Menggunakan Convolutional Neural Network",
    chapter: "Bab 3: Metodologi Penelitian",
    type: "Skripsi",
    submittedAt: "22 Sep 2026, 08:30",
    similarityScore: 18.2,
    status: "Menunggu Review",
  },
  {
    id: "REV-2026-102",
    studentName: "Muhammad Fadhil",
    nim: "20210801115",
    title: "Optimasi Query Database PostgreSQL Menggunakan Indeks pgvector",
    chapter: "Bab 2: Tinjauan Pustaka",
    type: "Skripsi",
    submittedAt: "21 Sep 2026, 16:45",
    similarityScore: 32.7,
    status: "Menunggu Review",
  },
  {
    id: "REV-2026-103",
    studentName: "Siti Rahmawati",
    nim: "20210801044",
    title: "Analisis Sentimen Opini Publik pada Media Sosial dengan Algoritma BERT",
    chapter: "Bab 1: Pendahuluan",
    type: "Skripsi",
    submittedAt: "21 Sep 2026, 10:12",
    similarityScore: 11.5,
    status: "Menunggu Review",
  },
  {
    id: "REV-2026-105",
    studentName: "Aditya Pratama",
    nim: "20210801128",
    title: "Sistem Pendukung Keputusan Penentuan Beasiswa dengan Metode TOPSIS",
    chapter: "Bab 2: Landasan Teori",
    type: "Proposal Sempro",
    submittedAt: "20 Sep 2026, 13:10",
    similarityScore: 19.4,
    status: "Menunggu Review",
  },
];

export default function DokumenBimbinganPage() {
  const [pendingDocs, setPendingDocs] = useState<PendingDocument[]>(INITIAL_PENDING_DOCS);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "warning";
    title: string;
    description: string;
  } | null>(null);

  // Simulated manual approval action handler that removes row from pending view
  const handleDecision = async (
    id: string,
    decision: "Disetujui" | "Revisi",
    studentName: string,
    title: string
  ) => {
    setActiveActionId(`${id}-${decision}`);
    try {
      await delay(700); // Simulate network latency

      // Remove row from pending view upon successful decision
      setPendingDocs((prev) => prev.filter((doc) => doc.id !== id));

      setToast({
        type: decision === "Disetujui" ? "success" : "warning",
        title: decision === "Disetujui" ? "Naskah Berhasil Disetujui" : "Naskah Ditandai Revisi",
        description:
          decision === "Disetujui"
            ? `Naskah "${title}" milik ${studentName} telah divalidasi dan dipindahkan ke Riwayat Approval.`
            : `Naskah "${title}" milik ${studentName} telah dikembalikan untuk revisi parafrasa.`,
      });
    } finally {
      setActiveActionId(null);
    }
  };

  const filteredDocs = pendingDocs.filter(
    (doc) =>
      doc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.nim.includes(searchTerm) ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.chapter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Dokumen Bimbingan">
      <div className="space-y-6">
        {/* Toast Notification Alert */}
        {toast && (
          <div
            className={`flex items-start justify-between gap-3 rounded-xl border p-4 shadow-sm transition-all ${
              toast.type === "success"
                ? "border-green-200 bg-green-50 text-green-900"
                : "border-yellow-200 bg-yellow-50 text-yellow-900"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {toast.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600 mt-0.5" />
              )}
              <div>
                <p className="text-xs font-bold">{toast.title}</p>
                <p className="text-xs mt-0.5 opacity-90">{toast.description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Antrean Dokumen Bimbingan Perlu Review
              </h2>
              <p className="text-xs text-gray-500">
                Daftar naskah skripsi & proposal mahasiswa bimbingan yang menunggu keputusan validasi dosen.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
              {pendingDocs.length} Menunggu Keputusan
            </span>
            <Link
              href="/riwayat-approval"
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Buka Riwayat Approval &rarr;
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        {pendingDocs.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari mahasiswa bimbingan, NIM, atau judul naskah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-red-600"
              />
            </div>
          </div>
        )}

        {/* Main Review Table or Empty State */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {pendingDocs.length === 0 ? (
            /* Empty state when all reviews completed */
            <div className="flex flex-col items-center justify-center p-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-gray-800">
                Semua Naskah Bimbingan Telah Ditinjau!
              </h3>
              <p className="mt-1.5 max-w-md text-xs text-gray-500 leading-relaxed">
                Tidak ada dokumen yang menunggu review saat ini. Seluruh rekomendasi persetujuan telah tersimpan dan dapat dilihat di Riwayat Approval.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPendingDocs(INITIAL_PENDING_DOCS)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Reset Simulasi Antrean
                </button>
                <Link
                  href="/riwayat-approval"
                  className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs transition-colors"
                >
                  <span>Buka Riwayat Approval</span>
                </Link>
              </div>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-10 text-center text-xs text-gray-500">
              Tidak ada naskah yang cocok dengan kata kunci &quot;{searchTerm}&quot;.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Mahasiswa & NIM
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Judul Naskah & Bab
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Jenis
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Waktu Kirim
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Skor Kemiripan
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs">
                  {filteredDocs.map((doc) => {
                    const isApproving = activeActionId === `${doc.id}-Disetujui`;
                    const isRevising = activeActionId === `${doc.id}-Revisi`;
                    const isRowLoading = isApproving || isRevising;

                    return (
                      <tr key={doc.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{doc.studentName}</div>
                          <div className="text-[11px] text-gray-500 font-mono">NIM: {doc.nim}</div>
                        </td>
                        <td className="px-4 py-4 max-w-xs">
                          <div className="font-medium text-gray-800 line-clamp-1" title={doc.title}>
                            {doc.title}
                          </div>
                          <span className="inline-block mt-0.5 text-[11px] font-semibold text-red-700">
                            {doc.chapter}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                            {doc.type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                          {doc.submittedAt}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-sm ${getSimilarityColorClass(doc.similarityScore)}`}>
                            {doc.similarityScore}%
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getStatusBadgeClass(
                              doc.status
                            )}`}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* "Setujui" Button (Solid Green) */}
                            <button
                              type="button"
                              onClick={() =>
                                handleDecision(doc.id, "Disetujui", doc.studentName, doc.title)
                              }
                              disabled={isRowLoading}
                              className="inline-flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-green-700 disabled:opacity-50 transition-colors"
                              title="Setujui Naskah Mahasiswa"
                            >
                              {isApproving ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              <span>Setujui</span>
                            </button>

                            {/* "Revisi" Button (Solid Red/Orange) */}
                            <button
                              type="button"
                              onClick={() =>
                                handleDecision(doc.id, "Revisi", doc.studentName, doc.title)
                              }
                              disabled={isRowLoading}
                              className="inline-flex items-center gap-1 rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 disabled:opacity-50 transition-colors"
                              title="Tandai Naskah Perlu Revisi"
                            >
                              {isRevising ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <RotateCcw className="h-3.5 w-3.5" />
                              )}
                              <span>Revisi</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Table Footer */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3 text-xs text-gray-500">
                <span>
                  Menampilkan <strong className="text-gray-800">{filteredDocs.length}</strong> naskah yang menunggu keputusan
                </span>
                <span className="text-[11px] text-gray-400">
                  Klik &quot;Setujui&quot; atau &quot;Revisi&quot; untuk memvalidasi naskah
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
