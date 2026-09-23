"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Database,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  PlusCircle,
  HardDrive,
  ShieldCheck,
  Check,
} from "lucide-react";
import { uploadDocumentApi, UploadResponse } from "@/lib/api";

export default function KelolaRepositoriPage() {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("skripsi");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [lastUploaded, setLastUploaded] = useState<UploadResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-dismiss success toast after 6 seconds
  useEffect(() => {
    if (uploadSuccessMessage) {
      const timer = setTimeout(() => {
        setUploadSuccessMessage(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccessMessage]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError(null);
    setUploadSuccessMessage(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.name.toLowerCase().endsWith(".pdf")) {
        setUploadError("Format file tidak valid. Harap unggah dokumen acuan berekstensi .PDF!");
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccessMessage(null);

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
        setUploadError("Format file tidak valid. Harap unggah dokumen acuan berekstensi .PDF!");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleAddToRepository = async () => {
    if (!file) {
      setUploadError("Silakan pilih file PDF dokumen referensi terlebih dahulu!");
      return;
    }

    setUploadError(null);
    setUploadSuccessMessage(null);
    setIsUploading(true);

    try {
      // POST multipart/form-data to FastAPI /api/documents/upload
      const res = await uploadDocumentApi(file, docType);
      setLastUploaded(res);
      setUploadSuccessMessage("Dokumen berhasil ditambahkan ke repositori");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal menambahkan dokumen ke repositori server.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setIsUploading(false);
    setUploadError(null);
    setUploadSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <DashboardLayout title="Kelola Repositori">
      {/* Floating Success Toast Notification (Top Right) */}
      {uploadSuccessMessage && (
        <div className="fixed top-20 right-4 z-50 flex max-w-md items-center gap-3 rounded-xl border border-green-200 bg-white p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-bold text-gray-900">Sukses</p>
            <p className="text-xs text-gray-600">{uploadSuccessMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setUploadSuccessMessage(null)}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Tutup notifikasi"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Unggah Dokumen Referensi ke Database
                </h2>
                <p className="text-xs text-gray-500">
                  Tambahkan naskah skripsi terdahulu dan karya ilmiah ke repositori pembanding internal kampus tanpa melakukan kalkulasi similarity.
                </p>
              </div>
            </div>

            <Link
              href="/riwayat"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
            >
              <HardDrive className="h-3.5 w-3.5 text-gray-500" />
              <span>Lihat Koleksi Repositori</span>
            </Link>
          </div>
        </div>

        {/* Error Alert */}
        {uploadError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800 shadow-xs">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Gagal Menambahkan Dokumen</p>
              <p className="mt-0.5 text-red-700">{uploadError}</p>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-red-500 hover:text-red-700"
              aria-label="Tutup pesan kesalahan"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* In-page Success Notification Banner */}
        {uploadSuccessMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-xs font-medium text-green-800 shadow-xs">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Penambahan Repositori Berhasil</p>
              <p className="mt-0.5 text-green-700">{uploadSuccessMessage}</p>
              {lastUploaded && (
                <p className="mt-1 text-[11px] text-green-800 font-mono">
                  ID Database: #{lastUploaded.id} &bull; Berkas: {lastUploaded.filename}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setUploadSuccessMessage(null)}
              className="text-green-500 hover:text-green-700"
              aria-label="Tutup pesan sukses"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Upload Form Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
          {/* Document Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Kategori Dokumen Repositori
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "skripsi", label: "Skripsi Alumni / Terdahulu" },
                { id: "proposal", label: "Proposal Tugas Akhir" },
                { id: "jurnal", label: "Artikel Jurnal & Prosiding" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDocType(item.id)}
                  disabled={isUploading}
                  className={`flex items-center justify-center rounded-lg border p-3 text-xs font-semibold transition-all ${
                    docType === item.id
                      ? "border-red-600 bg-red-50 text-red-700 shadow-xs"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Berkas PDF Referensi
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleFileDrop}
              onClick={() => {
                if (!file && !isUploading && fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                isDragging
                  ? "border-red-500 bg-red-50/60 scale-[1.005]"
                  : file
                  ? "border-gray-300 bg-gray-50/50"
                  : "border-gray-300 hover:border-red-500 hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />

              {!file ? (
                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 mb-3">
                    <Database className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-bold text-gray-800">
                    Tarik dan letakkan berkas PDF referensi di sini
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    atau <span className="font-semibold text-red-600 hover:underline">klik untuk memilih berkas</span> dari penyimpanan
                  </p>
                  <p className="mt-2 text-[11px] text-gray-400">
                    Mendukung naskah skripsi / karya ilmiah berformat PDF
                  </p>
                </div>
              ) : (
                <div className="flex w-full max-w-md items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-xs font-bold text-gray-800" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Siap didaftarkan ke repositori
                      </p>
                    </div>
                  </div>
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Batalkan pilihan"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Loading Indicator */}
          {isUploading && (
            <div className="rounded-xl border border-red-100 bg-red-50/50 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-red-900">
                  <RefreshCw className="h-4 w-4 animate-spin text-red-600" />
                  <span>Menyimpan berkas referensi ke PostgreSQL server...</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full bg-red-600 animate-pulse w-full" />
              </div>
              <p className="text-[11px] text-gray-500 text-center">
                Dokumen referensi akan disimpan ke basis data repositori kampus sebagai acuan pembanding.
              </p>
            </div>
          )}

          {/* Action Buttons: Tambahkan ke Repositori */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={!file || isUploading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleAddToRepository}
              disabled={!file || isUploading}
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Menyimpan ke Repositori...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  <span>Tambahkan ke Repositori</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Card on Repository Seeding */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-800">
                Fungsi Basis Data Repositori Internal
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Setiap dokumen yang diunggah melalui panel ini secara otomatis menjadi sumber acuan pembanding dalam perhitungan Cosine Similarity dan TF-IDF. Mahasiswa dan dosen yang melakukan pemeriksaan kemiripan akan mencocokkan naskah mereka terhadap dokumen-dokumen referensi ini.
              </p>
              <div className="pt-2">
                <Link
                  href="/riwayat"
                  className="text-xs font-semibold text-red-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>Buka Master Dokumen Repositori &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
