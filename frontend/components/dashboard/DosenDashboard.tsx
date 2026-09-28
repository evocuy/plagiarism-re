"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  GraduationCap,
  Info,
  Check,
  RotateCcw,
  RefreshCw,
  X,
} from "lucide-react";
import { getSimilarityColorClass, getStatusBadgeClass } from "@/lib/formatters";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ReviewQueueItem {
  id: string;
  studentName: string;
  nim: string;
  title: string;
  chapter: string;
  submittedAt: string;
  similarityScore: number;
  status: "Menunggu Review" | "Perlu Revisi" | "Disetujui";
}

export const INITIAL_DOSEN_QUEUE: ReviewQueueItem[] = [
  {
    id: "REV-2026-101",
    studentName: "Dian Permatasari",
    nim: "20210801089",
    title: "Klasifikasi Citra Rontgen Paru-paru Menggunakan Convolutional Neural Network",
    chapter: "Bab 3: Metodologi Penelitian",
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
    submittedAt: "21 Sep 2026, 10:12",
    similarityScore: 11.5,
    status: "Menunggu Review",
  },
  {
    id: "REV-2026-104",
    studentName: "Budi Pratama",
    nim: "20210801021",
    title: "Pengembangan Sistem Monitoring IoT untuk Pertanian Hidroponik",
    chapter: "Naskah Proposal Sempro",
    submittedAt: "19 Sep 2026, 14:00",
    similarityScore: 14.0,
    status: "Disetujui",
  },
];

export default function DosenDashboard() {
  const [queueList, setQueueList] = useState<ReviewQueueItem[]>(INITIAL_DOSEN_QUEUE);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "warning";
    title: string;
    description: string;
  } | null>(null);

  // Manual approval action handler with simulated network delay
  const handleDecision = async (
    id: string,
    decision: "Disetujui" | "Perlu Revisi",
    studentName: string,
    title: string
  ) => {
    setActiveActionId(`${id}-${decision}`);
    try {
      await delay(700); // Simulate API latency

      setQueueList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: decision } : item))
      );

      setToastMessage({
        type: decision === "Disetujui" ? "success" : "warning",
        title: decision === "Disetujui" ? "Naskah Disetujui" : "Naskah Memerlukan Revisi",
        description:
          decision === "Disetujui"
            ? `Naskah "${title}" mahasiswa ${studentName} berhasil disetujui untuk pendaftaran Sempro/Sidang.`
            : `Naskah "${title}" mahasiswa ${studentName} ditandai memerlukan revisi dari mahasiswa.`,
      });
    } finally {
      setActiveActionId(null);
    }
  };

  const pendingCount = queueList.filter((item) => item.status === "Menunggu Review").length;
  const approvedCount = 8 + queueList.filter((item) => item.status === "Disetujui" && item.id !== "REV-2026-104").length;

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`flex items-start justify-between gap-3 rounded-xl border p-4 shadow-sm transition-all ${
            toastMessage.type === "success"
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-yellow-200 bg-yellow-50 text-yellow-900"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-bold">{toastMessage.title}</p>
              <p className="text-xs mt-0.5 opacity-90">{toastMessage.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Welcome Banner for Dosen */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800">
                Portal Pembimbing Skripsi & Sempro
              </div>
              <h2 className="text-xl font-bold text-gray-800 mt-1">
                Panel Validasi Naskah Mahasiswa Bimbingan
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Verifikasi naskah sebelum memberikan rekomendasi persetujuan seminar proposal atau sidang akhir skripsi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dokumen-bimbingan"
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-xs"
            >
              <Users className="h-4 w-4" />
              <span>Kelola Dokumen Bimbingan ({pendingCount})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Total Mahasiswa Bimbingan */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Mahasiswa Bimbingan</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-800">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-800">12</span>
            <span className="text-xs text-gray-400">mahasiswa aktif</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            8 Skripsi, 4 Proposal Sempro
          </p>
        </div>

        {/* Card 2: Perlu Ditinjau */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Naskah Perlu Ditinjau</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-yellow-600">{pendingCount}</span>
            <span className="text-xs font-medium text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded">
              Antrean Aktif
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            Memerlukan keputusan manual dosen
          </p>
        </div>

        {/* Card 3: Disetujui Bulan Ini */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Disetujui Bulan Ini</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-600">{approvedCount}</span>
            <span className="text-xs text-gray-400">naskah tervalidasi</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            Telah memenuhi syarat rekomendasi SADS
          </p>
        </div>
      </div>

      {/* Antrean Review Table with Manual Approval Mechanism */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              Antrean Review Naskah Bimbingan
            </h2>
            <p className="text-xs text-gray-500">
              Naskah mahasiswa bimbingan yang membutuhkan evaluasi dan validasi manual pembimbing
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-800">
              {pendingCount} Menunggu
            </span>
            <Link
              href="/riwayat-approval"
              className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
            >
              Lihat Riwayat Approval &rarr;
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Mahasiswa & NIM
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Judul Naskah & Bab
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Waktu Kirim
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Skor Kemiripan
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {queueList.map((item) => {
                const isPending = item.status === "Menunggu Review";
                const isApproving = activeActionId === `${item.id}-Disetujui`;
                const isRevising = activeActionId === `${item.id}-Perlu Revisi`;
                const isRowLoading = isApproving || isRevising;

                return (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{item.studentName}</div>
                      <div className="text-[11px] text-gray-500 font-mono">NIM: {item.nim}</div>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <div className="font-medium text-gray-800 line-clamp-1" title={item.title}>
                        {item.title}
                      </div>
                      <span className="inline-block mt-0.5 text-[11px] font-semibold text-red-700">
                        {item.chapter}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-500 whitespace-nowrap">{item.submittedAt}</td>
                    <td className="px-4 py-4">
                      <span className={`text-sm ${getSimilarityColorClass(item.similarityScore)}`}>
                        {item.similarityScore}%
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Setujui (Approve) Button - Solid Green */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDecision(item.id, "Disetujui", item.studentName, item.title)
                            }
                            disabled={isRowLoading}
                            className="inline-flex items-center gap-1 rounded bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-green-700 disabled:opacity-50 transition-colors"
                            title="Setujui Naskah"
                          >
                            {isApproving ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            <span>Setujui</span>
                          </button>

                          {/* Revisi (Revision) Button - Solid Red/Orange */}
                          <button
                            type="button"
                            onClick={() =>
                              handleDecision(item.id, "Perlu Revisi", item.studentName, item.title)
                            }
                            disabled={isRowLoading}
                            className="inline-flex items-center gap-1 rounded bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 disabled:opacity-50 transition-colors"
                            title="Tandai Butuh Revisi"
                          >
                            {isRevising ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3.5 w-3.5" />
                            )}
                            <span>Revisi</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[11px] font-medium text-gray-400">
                            {item.status === "Disetujui" ? "Tervalidasi" : "Revisi Diminta"}
                          </span>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors shadow-2xs"
                          >
                            <FileSearch className="h-3.5 w-3.5" />
                            <span>Detail</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ethical Guidance for Supervisor Card */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-6 shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
            <Info className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-900">
              Prinsip Evaluasi Kemiripan Dokumen bagi Dosen Pembimbing
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Tingkat persentase kemiripan (similarity score) dihasilkan oleh perhitungan TF-IDF dan Cosine Similarity terhadap repositori kampus. Persentase kemiripan <strong>bukan vonis plagiarisme mutlak</strong>. Dosen pembimbing memegang wewenang penuh untuk meninjau konteks sitasi dan memutuskan apakah naskah layak disetujui atau memerlukan revisi.
            </p>
            <div className="pt-2">
              <Link
                href="/panduan"
                className="text-xs font-semibold text-red-700 hover:underline inline-flex items-center gap-1"
              >
                Lihat Panduan Pengecekan Bab per Bab &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
