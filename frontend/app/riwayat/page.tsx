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
import { getAllDocumentsApi, ApiDocument } from "@/lib/api";

interface DisplayDocument {
  id: number;
  title: string;
  type: string;
  date: string;
  filePath: string;
  status: string;
}

export default function RiwayatPage() {
  const [documents, setDocuments] = useState<DisplayDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("Semua");

  const formatDocs = (data: ApiDocument[]): DisplayDocument[] => {
    return data.map((doc) => {
      let formattedDate = "-";
      if (doc.created_at) {
        try {
          const d = new Date(doc.created_at);
          formattedDate = d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          formattedDate = doc.created_at;
        }
      }

      return {
        id: doc.id,
        title: doc.title,
        type: doc.document_type ? doc.document_type.toUpperCase() : "SKRIPSI",
        date: formattedDate,
        filePath: doc.file_path,
        status: "Tersimpan",
      };
    });
  };

  const loadDocuments = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data: ApiDocument[] = await getAllDocumentsApi();
      setDocuments(formatDocs(data));
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memuat dokumen dari server FastAPI. Pastikan backend aktif.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    getAllDocumentsApi()
      .then((data) => {
        if (!ignore) {
          setDocuments(formatDocs(data));
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg =
            err instanceof Error
              ? err.message
              : "Gagal memuat dokumen dari server FastAPI. Pastikan backend aktif.";
          setErrorMessage(msg);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Filtered dataset based on search and type selector
  const filteredData = documents.filter((doc) => {
    const matchSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toString().includes(searchTerm);
    const matchType =
      selectedType === "Semua" || doc.type.toLowerCase() === selectedType.toLowerCase();
    return matchSearch && matchType;
  });

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
                Riwayat Dokumen Repositori Kampus
              </h2>
              <p className="text-xs text-gray-500">
                Data dokumen tersimpan di PostgreSQL melalui backend FastAPI (GET /api/documents/).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadDocuments}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
              title="Muat ulang dari server"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-red-600" : ""}`} />
              <span>Muat Ulang</span>
            </button>

            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Unggah Naskah</span>
            </Link>
          </div>
        </div>

        {/* Error Alert if backend unreachable */}
        {errorMessage && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-xs font-medium text-yellow-800 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-bold">Koneksi Backend FastAPI Terkendala</p>
                <p className="mt-0.5 text-yellow-700">{errorMessage}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadDocuments}
              className="rounded-md border border-yellow-300 bg-white px-3 py-1 text-xs font-semibold text-yellow-800 hover:bg-yellow-100 shrink-0"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Filter and Search Bar (Only shown if documents exist) */}
        {!isLoading && documents.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan judul naskah atau ID dokumen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Filter by Type */}
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

        {/* Content: Skeleton Loader vs Table vs Empty State */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            /* Skeleton Loading State active while fetch is pending */
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-gray-50/70 rounded-lg animate-pulse"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="h-3.5 w-3/4 bg-gray-200 rounded" />
                      <div className="h-2.5 w-1/4 bg-gray-200 rounded" />
                    </div>
                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      <div className="h-5 w-16 bg-gray-200 rounded-md" />
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                      <div className="h-6 w-16 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-gray-400 pt-2 flex items-center justify-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Memuat data dokumen dari server FastAPI...</span>
              </p>
            </div>
          ) : documents.length === 0 ? (
            /* Clean Empty State UI when backend returns 0 documents */
            <div className="flex flex-col items-center justify-center p-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-gray-700">
                Belum ada riwayat pengecekan dokumen.
              </h3>
              <p className="mt-1.5 max-w-sm text-xs text-gray-400 leading-relaxed">
                Naskah skripsi atau proposal yang Anda unggah ke server akan tercatat di database repositori dan ditampilkan di halaman ini.
              </p>
              <div className="mt-6">
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-xs transition-colors"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>Unggah Dokumen Sekarang</span>
                </Link>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            /* Search zero result state */
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
            /* Connected Data Table */
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
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Jenis
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
                  {filteredData.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono text-gray-400 font-semibold">
                        #{doc.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 line-clamp-1">
                          {doc.title}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-md font-mono mt-0.5">
                          {doc.filePath}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                        {doc.date}
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
                          <Link
                            href="/upload"
                            className="inline-flex items-center gap-1 rounded bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <FileCheck2 className="h-3.5 w-3.5" />
                            <span>Cek Ulang</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Table Footer */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-green-600" />
                  <span>
                    Terhubung ke PostgreSQL: <strong className="text-gray-800">{filteredData.length}</strong> dokumen
                  </span>
                </span>
                <span className="text-[11px] text-gray-400">
                  Data real-time dari backend FastAPI
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
