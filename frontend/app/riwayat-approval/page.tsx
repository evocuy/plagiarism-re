"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  CheckCircle2,
  Search,
  FileSearch,
  Download,
  Filter,
  Users,
  Eye,
  Calendar,
} from "lucide-react";
import { getSimilarityColorClass, getStatusBadgeClass } from "@/lib/formatters";

interface ApprovedHistoryItem {
  id: string;
  studentName: string;
  nim: string;
  title: string;
  chapter: string;
  type: "Skripsi" | "Proposal Sempro";
  reviewedDate: string;
  similarityScore: number;
  status: "Disetujui" | "Perlu Revisi" | "Gagal" | "Lolos";
  reviewerNote?: string;
}

const MOCK_APPROVAL_HISTORY: ApprovedHistoryItem[] = [
  {
    id: "APP-2026-001",
    studentName: "Budi Pratama",
    nim: "20210801021",
    title: "Pengembangan Sistem Monitoring IoT untuk Pertanian Hidroponik",
    chapter: "Naskah Proposal Sempro",
    type: "Proposal Sempro",
    reviewedDate: "19 Sep 2026, 15:30",
    similarityScore: 14.0,
    status: "Disetujui",
    reviewerNote: "Sitasi sudah sesuai kaidah akademik, disetujui untuk ujian Sempro.",
  },
  {
    id: "APP-2026-002",
    studentName: "Rizky Firmansyah",
    nim: "20210801015",
    title: "Analisis Algoritma Sistem Informasi INSTIKI",
    chapter: "Bab 1: Pendahuluan",
    type: "Skripsi",
    reviewedDate: "18 Sep 2026, 11:20",
    similarityScore: 13.5,
    status: "Lolos",
    reviewerNote: "Lolos batas toleransi < 20%.",
  },
  {
    id: "APP-2026-003",
    studentName: "Dewi Lestari",
    nim: "20210801062",
    title: "Sistem Informasi Geografis Pemetaan Fasilitas Kesehatan Kampus",
    chapter: "Bab 2: Tinjauan Pustaka",
    type: "Skripsi",
    reviewedDate: "15 Sep 2026, 14:10",
    similarityScore: 27.4,
    status: "Perlu Revisi",
    reviewerNote: "Beberapa definisi buku teks perlu parafrasa kalimat aktif.",
  },
  {
    id: "APP-2026-004",
    studentName: "Eko Prasetyo",
    nim: "20210801077",
    title: "Implementasi Smart Door Lock Menggunakan ESP32 dan RFID",
    chapter: "Bab 3: Metodologi",
    type: "Skripsi",
    reviewedDate: "12 Sep 2026, 09:45",
    similarityScore: 16.8,
    status: "Disetujui",
    reviewerNote: "Bab metodologi telah diperiksa dan disetujui.",
  },
  {
    id: "APP-2026-005",
    studentName: "Farhan Maulana",
    nim: "20210801099",
    title: "Deteksi Serangan DDoS Menggunakan Machine Learning pada Server Kampus",
    chapter: "Bab 2: Landasan Teori",
    type: "Skripsi",
    reviewedDate: "08 Sep 2026, 16:00",
    similarityScore: 35.2,
    status: "Gagal",
    reviewerNote: "Kemiripan melebihi 30%, wajib ditulis ulang sebelum penyerahan berikutnya.",
  },
];

export default function RiwayatApprovalPage() {
  const [historyList] = useState<ApprovedHistoryItem[]>(MOCK_APPROVAL_HISTORY);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedType, setSelectedType] = useState("Semua");

  const filteredList = historyList.filter((item) => {
    const matchSearch =
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nim.includes(searchTerm) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.chapter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === "Semua" || item.status === selectedStatus;
    const matchType = selectedType === "Semua" || item.type === selectedType;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <DashboardLayout title="Riwayat Approval">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Riwayat Validasi & Approval Dosen
              </h2>
              <p className="text-xs text-gray-500">
                Rekam jejak evaluasi naskah bimbingan yang telah diputuskan oleh dosen pembimbing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dokumen-bimbingan"
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              &larr; Ke Antrean Dokumen Bimbingan
            </Link>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari mahasiswa bimbingan, NIM, atau judul naskah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-red-600"
              />
            </div>

            {/* Filter by Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full md:w-44 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
            >
              <option value="Semua">Semua Jenis Naskah</option>
              <option value="Skripsi">Skripsi</option>
              <option value="Proposal Sempro">Proposal Sempro</option>
            </select>

            {/* Filter by Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full md:w-36 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
            >
              <option value="Semua">Semua Status</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Lolos">Lolos</option>
              <option value="Perlu Revisi">Perlu Revisi</option>
              <option value="Gagal">Gagal</option>
            </select>
          </div>
        </div>

        {/* Approval History Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {filteredList.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">
              Tidak ada data riwayat approval yang sesuai dengan filter pencarian.
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
                      Tanggal Validasi
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Similaritas
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status Keputusan
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs">
                  {filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{item.studentName}</div>
                        <div className="text-[11px] text-gray-500 font-mono">NIM: {item.nim}</div>
                      </td>
                      <td className="px-4 py-4 max-w-xs">
                        <div className="font-medium text-gray-800 line-clamp-1" title={item.title}>
                          {item.title}
                        </div>
                        <div className="mt-0.5 text-[11px] text-red-700 font-semibold">
                          {item.chapter}
                        </div>
                        {item.reviewerNote && (
                          <p className="mt-1 text-[11px] text-gray-500 italic line-clamp-1">
                            Catatan: &ldquo;{item.reviewerNote}&rdquo;
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                        {item.reviewedDate}
                      </td>
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
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Exactly the "Lihat Detail" button as specified */}
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <FileSearch className="h-3.5 w-3.5" />
                            <span>Lihat Detail</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Table Footer */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3 text-xs text-gray-500">
                <span>
                  Menampilkan <strong className="text-gray-800">{filteredList.length}</strong> naskah tervalidasi
                </span>
                <span className="text-[11px] text-gray-400">
                  Keputusan approval tersinkronisasi otomatis dengan portal kelayakan SADS
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
