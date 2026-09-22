"use client";

import React from "react";
import Link from "next/link";
import {
  Server,
  Database,
  Cpu,
  Activity,
  CheckCircle2,
  HardDrive,
  ShieldAlert,
  ArrowUpRight,
  Sliders,
  RefreshCw,
  Clock,
} from "lucide-react";
import { getSimilarityColorClass, getStatusBadgeClass } from "@/lib/formatters";

interface SystemLog {
  id: string;
  documentTitle: string;
  author: string;
  timestamp: string;
  processingTimeMs: number;
  similarityScore: number;
  engineStatus: "Success" | "Processing" | "Warning";
}

const MOCK_SYSTEM_LOGS: SystemLog[] = [
  {
    id: "LOG-9921",
    documentTitle: "Sistem Rekomendasi Wisata dengan Collaborative Filtering",
    author: "Rian Saputra (20210801012)",
    timestamp: "22 Sep 2026, 12:45:10",
    processingTimeMs: 1240,
    similarityScore: 16.4,
    engineStatus: "Success",
  },
  {
    id: "LOG-9920",
    documentTitle: "Deteksi Objek Kendaraan pada CCTV Menggunakan YOLOv8",
    author: "Anisa Fitriani (20210801035)",
    timestamp: "22 Sep 2026, 12:40:02",
    processingTimeMs: 1480,
    similarityScore: 34.1,
    engineStatus: "Warning",
  },
  {
    id: "LOG-9919",
    documentTitle: "Analisis Kinerja Algoritma Klasifikasi C4.5 pada Dataset Medis",
    author: "Bagus Prasetyo (20210801077)",
    timestamp: "22 Sep 2026, 12:31:55",
    processingTimeMs: 980,
    similarityScore: 11.2,
    engineStatus: "Success",
  },
  {
    id: "LOG-9918",
    documentTitle: "Implementasi Smart Lock Berbasis Face Recognition dan IoT",
    author: "Gilang Maulana (20210801090)",
    timestamp: "22 Sep 2026, 12:20:14",
    processingTimeMs: 1120,
    similarityScore: 19.8,
    engineStatus: "Success",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Admin Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
            <Activity className="h-3.5 w-3.5 text-red-700" />
            <span>IT Operations & Engine Status</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mt-2">
            Pusat Kendali Sistem & Repositori Plagiarism Checker
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitoring kinerja NLP engine (FastAPI + TF-IDF), basis data repositori, dan log audit kampus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/kelola-repositori"
            className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition-colors"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Kelola Repositori</span>
          </Link>
          <Link
            href="/panduan"
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Sliders className="h-3.5 w-3.5 text-gray-500" />
            <span>Pengaturan Threshold</span>
          </Link>
        </div>
      </div>

      {/* System Health Monitoring Badges */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Backend FastAPI Status */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">FastAPI & Uvicorn</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-800">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
              Online
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-800">Port :8000</span>
            <span className="text-xs text-gray-400 font-mono">v0.1.0</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
            <Server className="h-3.5 w-3.5 text-gray-400" />
            <span>NLP Worker Thread: Siap</span>
          </div>
        </div>

        {/* PostgreSQL Database */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Database Repositori</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-800">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
              Connected
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-800">PostgreSQL</span>
            <span className="text-xs text-gray-400 font-mono">:5432</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
            <Database className="h-3.5 w-3.5 text-gray-400" />
            <span>Terkoneksi (Pool: 10 active)</span>
          </div>
        </div>

        {/* NLP Engine Queue */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Antrean Antigravity NLP</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
              Idle
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-800">0</span>
            <span className="text-xs text-gray-400">antrean tertunda</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
            <Cpu className="h-3.5 w-3.5 text-gray-400" />
            <span>Rata-rata Eksekusi: ~1.2 detik</span>
          </div>
        </div>
      </div>

      {/* Main Stats Counters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Total Naskah Repositori</span>
            <HardDrive className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">1,428</p>
          <span className="text-[11px] text-gray-400">Skripsi & Proposal Kampus</span>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Pengecekan Hari Ini</span>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-800">47</p>
          <span className="text-[11px] text-green-600 font-medium">↑ +18% dari kemarin</span>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Pengecekan Lolos</span>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">89.4%</p>
          <span className="text-[11px] text-gray-400">Ambang batas &lt; 25%</span>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Peringatan Terdeteksi</span>
            <ShieldAlert className="h-4 w-4 text-yellow-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-yellow-600">5</p>
          <span className="text-[11px] text-yellow-700">Skor &gt; 30% perlu verifikasi</span>
        </div>
      </div>

      {/* Master Log Pengecekan Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              Audit Log Pengecekan Kampus
            </h2>
            <p className="text-xs text-gray-500">
              Aktivitas pengecekan seluruh mahasiswa secara real-time
            </p>
          </div>
          <Link
            href="/riwayat"
            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
          >
            <span>Buka Master Log</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Log ID & Dokumen
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Mahasiswa
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Waktu Eksekusi
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Durasi NLP
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Skor Kemiripan
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status Mesin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {MOCK_SYSTEM_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 line-clamp-1">
                      {log.documentTitle}
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {log.id}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{log.author}</td>
                  <td className="px-4 py-4 text-gray-500">{log.timestamp}</td>
                  <td className="px-4 py-4 font-mono text-gray-600">
                    {log.processingTimeMs} ms
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm ${getSimilarityColorClass(log.similarityScore)}`}>
                      {log.similarityScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        log.engineStatus === "Success"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                      {log.engineStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
