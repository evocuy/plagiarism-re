"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getCheckHistoryApi, CheckHistoryItem } from "@/lib/api";
import {
  BarChart3,
  Search,
  Filter,
  Download,
  Printer,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  ArrowUpDown,
  Eye,
  X,
  GraduationCap,
  Calendar,
  Layers,
  ChevronDown,
} from "lucide-react";

export default function KelolaLaporanPage() {
  const [historyItems, setHistoryItems] = useState<CheckHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [docTypeFilter, setDocTypeFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"created_at" | "overall_similarity">("created_at");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Detail Modal
  const [selectedItem, setSelectedItem] = useState<CheckHistoryItem | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await getCheckHistoryApi();
      setHistoryItems(data);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Gagal memuat rekapitulasi laporan pengecekan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filtered & Sorted Data
  const filteredData = useMemo(() => {
    return historyItems.filter((item) => {
      // Search
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.title.toLowerCase().includes(search) ||
        (item.owner_name && item.owner_name.toLowerCase().includes(search)) ||
        (item.owner_identifier && item.owner_identifier.toLowerCase().includes(search));

      // Doc Type
      const matchType =
        docTypeFilter === "all" ||
        item.document_type.toLowerCase() === docTypeFilter.toLowerCase();

      // Risk Category
      const scorePct = item.overall_similarity * 100;
      let matchRisk = true;
      if (riskFilter === "aman") {
        matchRisk = scorePct < 20;
      } else if (riskFilter === "sedang") {
        matchRisk = scorePct >= 20 && scorePct <= 30;
      } else if (riskFilter === "tinggi") {
        matchRisk = scorePct > 30;
      }

      // Period Filter
      let matchPeriod = true;
      if (periodFilter !== "all" && item.created_at) {
        const itemDate = new Date(item.created_at);
        const now = new Date();
        if (periodFilter === "7days") {
          const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
          matchPeriod = diffDays <= 7;
        } else if (periodFilter === "30days") {
          const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
          matchPeriod = diffDays <= 30;
        }
      }

      return matchSearch && matchType && matchRisk && matchPeriod;
    }).sort((a, b) => {
      if (sortField === "overall_similarity") {
        return sortAsc
          ? a.overall_similarity - b.overall_similarity
          : b.overall_similarity - a.overall_similarity;
      }
      const dateA = new Date(a.created_at || "").getTime();
      const dateB = new Date(b.created_at || "").getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
  }, [historyItems, searchTerm, docTypeFilter, riskFilter, periodFilter, sortField, sortAsc]);

  // Key Aggregation Metrics
  const metrics = useMemo(() => {
    const total = historyItems.length;
    if (total === 0) {
      return { total: 0, avg: "0%", safe: 0, review: 0, high: 0 };
    }
    const sumScore = historyItems.reduce((acc, curr) => acc + curr.overall_similarity, 0);
    const avgScore = (sumScore / total) * 100;
    const safeCount = historyItems.filter((i) => i.overall_similarity * 100 < 20).length;
    const reviewCount = historyItems.filter((i) => i.overall_similarity * 100 >= 20 && i.overall_similarity * 100 <= 30).length;
    const highCount = historyItems.filter((i) => i.overall_similarity * 100 > 30).length;

    return {
      total,
      avg: `${avgScore.toFixed(1)}%`,
      safe: safeCount,
      review: reviewCount,
      high: highCount,
    };
  }, [historyItems]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data laporan untuk diekspor.");
      return;
    }

    const headers = [
      "ID",
      "Judul Dokumen",
      "Tipe Naskah",
      "Nama Pengunggah",
      "NIM/NIP",
      "Skor Kemiripan",
      "Persentase",
      "Status",
      "Tanggal Pengecekan",
    ];

    const rows = filteredData.map((item) => [
      item.id,
      `"${item.title.replace(/"/g, '""')}"`,
      item.document_type.toUpperCase(),
      `"${(item.owner_name || "-").replace(/"/g, '""')}"`,
      `"${item.owner_identifier || "-"}"`,
      item.overall_similarity,
      item.similarity_percentage,
      item.status,
      item.created_at || "-",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Plagiarisme_Kampus_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout title="Kelola Laporan">
      <div className="space-y-6">
        {/* Top Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-red-700 text-white">
                <BarChart3 className="h-5 w-5" />
              </span>
              <span>Pusat Kelola Laporan &amp; Rekapitulasi</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Monitoring agregasi kemiripan naskah skripsi &amp; proposal mahasiswa terhadap repositori kampus.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchReports}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="Perbarui Data Laporan"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-red-600" : "text-gray-500"}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:border-red-200 hover:bg-red-50 text-xs font-semibold text-gray-700 hover:text-red-700 shadow-2xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-red-700" />
              <span>Ekspor CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak Rekap</span>
            </button>
          </div>
        </div>

        {/* Executive Metric Cards (Strict Red/Black/Gray palette) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Pengecekan */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Pengecekan
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-800">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">{metrics.total}</span>
              <span className="text-[11px] text-gray-500 font-medium">dokumen teruji</span>
            </div>
          </div>

          {/* Card 2: Rata-Rata Kemiripan */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Rata-Rata Skor
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-700">
                <BarChart3 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-red-700">{metrics.avg}</span>
              <span className="text-[11px] text-gray-500 font-medium">indeks agregat</span>
            </div>
          </div>

          {/* Card 3: Naskah Aman (<20%) */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Lolos / Aman (&lt;20%)
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-800">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">{metrics.safe}</span>
              <span className="text-[11px] text-emerald-700 font-medium font-semibold">Memenuhi Syarat</span>
            </div>
          </div>

          {/* Card 4: Butuh Tinjauan / Berisiko (>=20%) */}
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-800 uppercase tracking-wider">
                Perlu Review (&ge;20%)
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-700">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-red-700">
                {metrics.review + metrics.high}
              </span>
              <span className="text-[11px] text-red-800 font-medium">perlu verifikasi</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari naskah skripsi, proposal, nama mahasiswa, atau NIM..."
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all bg-gray-50/50 focus:bg-white"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter: Tipe Dokumen */}
            <div className="w-full sm:w-44">
              <select
                value={docTypeFilter}
                onChange={(e) => setDocTypeFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-gray-200 rounded-lg bg-gray-50/50 text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600 font-medium"
              >
                <option value="all">Semua Tipe Naskah</option>
                <option value="skripsi">Skripsi (Tugas Akhir)</option>
                <option value="proposal">Seminar Proposal</option>
              </select>
            </div>

            {/* Filter: Tingkat Risiko */}
            <div className="w-full sm:w-48">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-gray-200 rounded-lg bg-gray-50/50 text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600 font-medium"
              >
                <option value="all">Semua Ambang Batas</option>
                <option value="aman">Aman (&lt; 20%)</option>
                <option value="sedang">Perlu Tinjauan (20% - 30%)</option>
                <option value="tinggi">Tinggi (&gt; 30%)</option>
              </select>
            </div>

            {/* Filter: Periode */}
            <div className="w-full sm:w-40">
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-gray-200 rounded-lg bg-gray-50/50 text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-red-600 focus:border-red-600 font-medium"
              >
                <option value="all">Semua Waktu</option>
                <option value="7days">7 Hari Terakhir</option>
                <option value="30days">30 Hari Terakhir</option>
              </select>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(searchTerm || docTypeFilter !== "all" || riskFilter !== "all" || periodFilter !== "all") && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
              <span>
                Menampilkan <strong>{filteredData.length}</strong> dari {historyItems.length} rekaman data
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setDocTypeFilter("all");
                  setRiskFilter("all");
                  setPeriodFilter("all");
                }}
                className="text-xs font-semibold text-red-700 hover:underline cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={fetchReports}
              className="font-bold underline ml-3 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Reports Table Card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-red-700" />
              <span>Daftar Log &amp; Rekapitulasi Kemiripan Naskah</span>
            </h2>
            <span className="text-[11px] font-semibold text-gray-500">
              Total {filteredData.length} Berkas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Judul Dokumen</th>
                  <th className="py-3 px-4">Pengunggah / NIM</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-red-700 transition-colors select-none"
                    onClick={() => {
                      if (sortField === "overall_similarity") {
                        setSortAsc(!sortAsc);
                      } else {
                        setSortField("overall_similarity");
                        setSortAsc(false);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Kemiripan</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-red-700 transition-colors select-none"
                    onClick={() => {
                      if (sortField === "created_at") {
                        setSortAsc(!sortAsc);
                      } else {
                        setSortField("created_at");
                        setSortAsc(false);
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Tanggal Uji</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin text-red-600" />
                        <span className="text-xs font-semibold">Mengambil data laporan...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs font-semibold text-gray-600">Tidak ada data laporan yang cocok.</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Coba sesuaikan kata kunci pencarian atau pengaturan filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, idx) => {
                    const scorePct = item.overall_similarity * 100;
                    const isHigh = scorePct > 30;
                    const isMed = scorePct >= 20 && scorePct <= 30;

                    const badgeClass = isHigh
                      ? "bg-red-100 text-red-800 border-red-200"
                      : isMed
                      ? "bg-amber-50 text-amber-900 border-amber-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200";

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-800 max-w-xs truncate" title={item.title}>
                          {item.title}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900">{item.owner_name || "Mahasiswa"}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{item.owner_identifier || "-"}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            {item.document_type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${badgeClass}`}>
                            {item.similarity_percentage}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 bg-white hover:border-red-300 hover:bg-red-50 hover:text-red-700 text-xs font-semibold text-gray-700 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Detail Pengecekan */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-gray-800">
              <div className="flex items-start justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">
                      Rincian Laporan Uji Kemiripan #{selectedItem.id}
                    </h3>
                    <p className="text-[11px] text-gray-500">ID Dokumen: {selectedItem.document_id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[11px] text-gray-500 block">Judul Naskah</span>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">{selectedItem.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Mahasiswa / Pengunggah</span>
                    <p className="font-semibold text-gray-800">{selectedItem.owner_name || "Mahasiswa"}</p>
                    <p className="text-gray-500 font-mono text-[11px]">{selectedItem.owner_identifier || "-"}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">Jenis Berkas</span>
                    <p className="font-semibold text-gray-800 uppercase">{selectedItem.document_type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Tingkat Kemiripan</span>
                    <p className="text-base font-extrabold text-red-700 mt-0.5">
                      {selectedItem.similarity_percentage}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">Status Validasi</span>
                    <span className="inline-block mt-1 font-bold text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-800 uppercase">
                      {selectedItem.status}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <span className="text-[11px] text-gray-500 block">Waktu Analisis</span>
                  <p className="font-medium text-gray-700">
                    {selectedItem.created_at
                      ? new Date(selectedItem.created_at).toLocaleString("id-ID", {
                          dateStyle: "full",
                          timeStyle: "short",
                        })
                      : "-"}
                  </p>
                </div>

                {selectedItem.file_path && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[11px] text-gray-500 block">Arsip Berkas Server</span>
                    <p className="font-mono text-[10px] text-gray-600 truncate bg-gray-50 p-2 rounded border border-gray-200 mt-1">
                      {selectedItem.file_path}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
