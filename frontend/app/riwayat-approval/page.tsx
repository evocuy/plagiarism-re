"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  CheckCircle2,
  Search,
  FileSearch,
  RefreshCw,
} from "lucide-react";
import { getSimilarityColorClass, getStatusBadgeClass, getApprovalStatusLabel } from "@/lib/formatters";
import { getCheckHistoryApi, CheckHistoryItem } from "@/lib/api";

interface ApprovedHistoryItem {
  checkId: number;
  studentName: string;
  nim: string;
  title: string;
  chapter: string;
  type: "Skripsi" | "Proposal Sempro";
  reviewedDate: string;
  similarityScore: number;
  approvalStatus: string;
  reviewerNote?: string | null;
}

export default function RiwayatApprovalPage() {
  const [historyList, setHistoryList] = useState<ApprovedHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedType, setSelectedType] = useState("Semua");

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getCheckHistoryApi();
      if (data && data.length > 0) {
        // Filter only docs that have been reviewed (disetujui or revisi)
        const mapped: ApprovedHistoryItem[] = data
          .filter((item) => {
            const approval = (item.approval_status || "belum disetujui").toLowerCase();
            return approval === "disetujui" || approval === "revisi";
          })
          .map((item) => {
            let reviewedDate = "-";
            const dateSource = item.reviewed_at || item.created_at;
            if (dateSource) {
              try {
                const d = new Date(dateSource);
                reviewedDate = d.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              } catch {
                reviewedDate = dateSource;
              }
            }
            const isSkripsi = (item.document_type || "").toLowerCase().includes("skripsi");
            return {
              checkId: item.id,
              studentName: item.owner_name || "Mahasiswa Bimbingan",
              nim: item.owner_identifier || "-",
              title: item.title,
              chapter: `Dokumen ${item.document_type ? item.document_type.toUpperCase() : "Naskah"}`,
              type: isSkripsi ? "Skripsi" : "Proposal Sempro",
              reviewedDate,
              similarityScore: Math.round(item.overall_similarity * 1000) / 10,
              approvalStatus: item.approval_status || "belum disetujui",
              reviewerNote: item.reviewer_note,
            };
          });
        setHistoryList(mapped);
      } else {
        setHistoryList([]);
      }
    } catch (err) {
      console.error("Gagal memuat riwayat approval:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredList = historyList.filter((item) => {
    const matchSearch =
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nim.includes(searchTerm) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.chapter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      selectedStatus === "Semua" ||
      getApprovalStatusLabel(item.approvalStatus) === selectedStatus;
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
                Riwayat Validasi &amp; Approval Dosen
              </h2>
              <p className="text-xs text-gray-500">
                Rekam jejak evaluasi naskah bimbingan yang telah diputuskan oleh dosen pembimbing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadHistory}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-red-600" : ""}`} />
              <span>Muat Ulang</span>
            </button>
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
              <option value="Revisi">Revisi</option>
            </select>
          </div>
        </div>

        {/* Approval History Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-gray-400 space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin text-red-600 mx-auto" />
              <p>Memuat riwayat approval dari database...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
                <FileSearch className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-gray-700">
                Belum Ada Riwayat Approval
              </h3>
              <p className="mt-1.5 max-w-md text-xs text-gray-500 leading-relaxed">
                Belum ada dokumen yang telah di-review. Dokumen yang telah disetujui atau ditandai revisi akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Mahasiswa &amp; NIM
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Judul Naskah &amp; Bab
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
                    <tr key={item.checkId} className="hover:bg-gray-50/70 transition-colors">
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
                            item.approvalStatus
                          )}`}
                        >
                          {getApprovalStatusLabel(item.approvalStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors shadow-2xs"
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
                  Keputusan approval tersinkronisasi otomatis dengan riwayat mahasiswa
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
