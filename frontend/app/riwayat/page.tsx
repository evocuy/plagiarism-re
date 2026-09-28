"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  History,
  Search,
  UploadCloud,
  FileCheck2,
  FileText,
  RefreshCw,
  AlertCircle,
  Database,
} from "lucide-react";
import { getStatusBadgeClass } from "@/lib/formatters";
import { getCheckHistoryApi, CheckHistoryItem } from "@/lib/api";
import { useRole } from "@/context/RoleContext";

interface DisplayCheck {
  id: number;
  documentId: number;
  title: string;
  type: string;
  date: string;
  filePath: string;
  similarity: string;
  similarityScore: number;
  ownerName: string;
  ownerIdentifier: string;
  status: string;
}

export default function RiwayatPage() {
  const { currentRole, rawUser } = useRole();
  const [checks, setChecks] = useState<DisplayCheck[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("Semua");

  const formatChecks = (data: CheckHistoryItem[]): DisplayCheck[] => {
    return data.map((item) => {
      let formattedDate = "-";
      if (item.created_at) {
        try {
          const d = new Date(item.created_at);
          formattedDate = d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          formattedDate = item.created_at;
        }
      }

      return {
        id: item.id,
        documentId: item.document_id,
        title: item.title,
        type: item.document_type ? item.document_type.toUpperCase() : "SKRIPSI",
        date: formattedDate,
        filePath: item.file_path,
        similarity: item.similarity_percentage || `${Math.round(item.overall_similarity * 100)}%`,
        similarityScore: item.overall_similarity,
        ownerName: item.owner_name || "Anonim",
        ownerIdentifier: item.owner_identifier || "-",
        status: item.status === "completed" ? "Selesai" : item.status,
      };
    });
  };

  const loadHistory = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getCheckHistoryApi();
      setChecks(formatChecks(data));
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memuat riwayat pengecekan dari server FastAPI.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    getCheckHistoryApi()
      .then((data) => {
        if (!ignore) {
          setChecks(formatChecks(data));
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg =
            err instanceof Error
              ? err.message
              : "Gagal memuat riwayat pengecekan dari server FastAPI.";
          setErrorMessage(msg);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentRole, rawUser?.id]);

  const filteredData = checks.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ownerIdentifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm);
    const matchType =
      selectedType === "Semua" || item.type.toLowerCase() === selectedType.toLowerCase();
    return matchSearch && matchType;
  });

  const getSimilarityBadge = (score: number, text: string) => {
    const pct = score * 100;
    if (pct < 20) {
      return (
        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
          {text} (Rendah)
        </span>
      );
    }
    if (pct < 40) {
      return (
        <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
          {text} (Sedang)
        </span>
      );
    }
    return (
      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
        {text} (Tinggi)
      </span>
    );
  };

  return (
    <DashboardLayout title="Riwayat Pengecekan">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {currentRole === "mahasiswa"
                  ? "Riwayat Pengecekan Naskah Saya"
                  : "Log & Riwayat Pengecekan Repositori"}
              </h2>
              <p className="text-xs text-gray-500">
                {currentRole === "mahasiswa"
                  ? "Daftar naskah dan hasil verifikasi kemiripan yang pernah Anda periksa."
                  : "Daftar seluruh riwayat pengecekan naskah mahasiswa terhadap repositori kampus."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadHistory}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-red-600" : ""}`} />
              <span>Muat Ulang</span>
            </button>

            {currentRole === "mahasiswa" && (
              <Link
                href="/upload"
                className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Unggah Naskah Baru</span>
              </Link>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-xs font-medium text-yellow-800 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-bold">Koneksi Backend Terkendala</p>
                <p className="mt-0.5 text-yellow-700">{errorMessage}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadHistory}
              className="rounded-md border border-yellow-300 bg-white px-3 py-1 text-xs font-semibold text-yellow-800 hover:bg-yellow-100 shrink-0"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        {!isLoading && checks.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan judul naskah, nama mahasiswa, atau NIM..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full md:w-44 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                >
                  <option value="Semua">Semua Jenis Naskah</option>
                  <option value="SKRIPSI">Skripsi</option>
                  <option value="PROPOSAL">Proposal</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-gray-400 space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin text-red-600 mx-auto" />
              <p>Memuat riwayat pengecekan dari database PostgreSQL...</p>
            </div>
          ) : checks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-gray-700">
                Belum ada riwayat pengecekan dokumen.
              </h3>
              <p className="mt-1.5 max-w-sm text-xs text-gray-400 leading-relaxed">
                {currentRole === "mahasiswa"
                  ? "Naskah yang Anda unggah akan otomatis dihitung tingkat kemiripannya dan dicatat pada halaman ini."
                  : "Belum ada mahasiswa yang mengunggah naskah atau melakukan pengecekan ke repositori."}
              </p>
              {currentRole === "mahasiswa" && (
                <div className="mt-6">
                  <Link
                    href="/upload"
                    className="inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-xs transition-colors"
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span>Unggah Dokumen Sekarang</span>
                  </Link>
                </div>
              )}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <p className="text-xs font-bold text-gray-700">
                Tidak ada dokumen yang cocok dengan kata kunci &quot;{searchTerm}&quot;
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("Semua");
                }}
                className="mt-2 text-xs font-semibold text-red-600 hover:underline"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      ID
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Judul Naskah
                    </th>
                    {currentRole !== "mahasiswa" && (
                      <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Pemilik (Mahasiswa)
                      </th>
                    )}
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Jenis
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Skor Kemiripan
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Tanggal
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
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono text-gray-400 font-semibold">
                        #{item.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-md font-mono mt-0.5">
                          Dokumen ID #{item.documentId}
                        </div>
                      </td>
                      {currentRole !== "mahasiswa" && (
                        <td className="px-4 py-4">
                          <div className="font-semibold text-gray-800">{item.ownerName}</div>
                          <div className="text-[11px] text-gray-400 font-mono">{item.ownerIdentifier}</div>
                        </td>
                      )}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {getSimilarityBadge(item.similarityScore, item.similarity)}
                      </td>
                      <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                        {item.date}
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
                        {currentRole === "mahasiswa" ? (
                          <Link
                            href="/upload"
                            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors shadow-2xs"
                          >
                            <FileCheck2 className="h-3.5 w-3.5" />
                            <span>Cek Ulang</span>
                          </Link>
                        ) : (
                          <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Tervalidasi
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-green-600" />
                  <span>
                    Total riwayat terdata: <strong className="text-gray-800">{filteredData.length}</strong>
                  </span>
                </span>
                <span className="text-[11px] text-gray-400">
                  Data otomatis terhubung ke akun pengguna
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
