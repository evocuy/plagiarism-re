"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  RefreshCw,
  FileCheck,
  GraduationCap,
  BookOpen,
  Tag,
  Check,
} from "lucide-react";
import {
  uploadDocumentApi,
  checkRepositoryApi,
  CheckRepositoryResponse,
  UploadResponse,
} from "@/lib/api";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  const [uploadedDoc, setUploadedDoc] = useState<UploadResponse | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CheckRepositoryResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccessMessage(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.name.toLowerCase().endsWith(".pdf")) {
        setUploadError("Format file tidak valid. Harap unggah berkas berekstensi .PDF!");
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
        setUploadError("Format file tidak valid. Harap unggah berkas berekstensi .PDF!");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleStartChecking = async () => {
    // 1. Validate File
    if (!file) {
      setUploadError("Silakan pilih berkas dokumen PDF terlebih dahulu!");
      return;
    }

    // 2. Validate Document Type (Required)
    if (!documentType) {
      setUploadError("Tipe dokumen wajib dipilih! Silakan pilih apakah naskah Skripsi atau Proposal Seminar.");
      return;
    }

    setUploadError(null);
    setUploadSuccessMessage(null);
    setIsUploading(true);
    setUploadedDoc(null);
    setAnalysisResult(null);

    try {
      // 1. Send multipart/form-data POST request to FastAPI /api/documents/upload with document_type
      const uploadRes = await uploadDocumentApi(file, documentType);
      setUploadedDoc(uploadRes);
      setUploadSuccessMessage(
        uploadRes.message || `File ${uploadRes.filename} berhasil diunggah sebagai ${documentType.toUpperCase()}.`
      );

      // 2. Trigger repository similarity comparison if possible
      try {
        const checkRes = await checkRepositoryApi(uploadRes.id);
        setAnalysisResult(checkRes);
      } catch (checkErr: unknown) {
        // If repository is empty or check error occurs, still keep the successful upload info
        const checkMsg = checkErr instanceof Error ? checkErr.message : "Tidak dapat mengecek repositori.";
        console.warn("Repository comparison note:", checkMsg);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah dokumen ke server.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setDocumentType("");
    setIsUploading(false);
    setUploadedDoc(null);
    setAnalysisResult(null);
    setUploadError(null);
    setUploadSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <DashboardLayout title="Upload Dokumen">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Unggah Dokumen Naskah Mahasiswa
              </h2>
              <p className="text-xs text-gray-500">
                Pilih tipe naskah akademik (Skripsi / Proposal), unggah berkas PDF ke backend FastAPI, dan periksa tingkat kemiripan terhadap repositori kampus.
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {uploadError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800 shadow-xs">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Perhatian</p>
              <p className="mt-0.5 text-red-700">{uploadError}</p>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Success Toast Alert */}
        {uploadSuccessMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-xs font-medium text-green-800 shadow-xs">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Unggah Berhasil</p>
              <p className="mt-0.5 text-green-700">{uploadSuccessMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setUploadSuccessMessage(null)}
              className="text-green-500 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Upload Form Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
          {/* 1. Required Document Type Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-800">
                <Tag className="h-4 w-4 text-red-600" />
                <span>Pilih Tipe Dokumen</span>
                <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700">
                  * Wajib
                </span>
              </label>
              {documentType ? (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  <span>Tipe: {documentType.toUpperCase()}</span>
                </span>
              ) : (
                <span className="text-[11px] font-medium text-red-500">
                  Belum dipilih
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option: Skripsi */}
              <div
                onClick={() => {
                  setDocumentType("skripsi");
                  setUploadError(null);
                }}
                className={`relative flex items-start gap-3.5 rounded-xl border p-4 transition-all cursor-pointer ${
                  documentType === "skripsi"
                    ? "border-red-600 bg-red-50/60 shadow-xs ring-2 ring-red-600"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    documentType === "skripsi"
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900">Skripsi / Tugas Akhir</h4>
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                      Bab 1 - 5
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Naskah lengkap skripsi untuk verifikasi syarat kelayakan sidang tugas akhir.
                  </p>
                </div>
                {documentType === "skripsi" && (
                  <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Option: Proposal */}
              <div
                onClick={() => {
                  setDocumentType("proposal");
                  setUploadError(null);
                }}
                className={`relative flex items-start gap-3.5 rounded-xl border p-4 transition-all cursor-pointer ${
                  documentType === "proposal"
                    ? "border-red-600 bg-red-50/60 shadow-xs ring-2 ring-red-600"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    documentType === "proposal"
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900">Proposal Seminar (Sempro)</h4>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                      Bab 1 - 3
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Naskah usulan penelitian untuk verifikasi syarat pelaksanaan seminar proposal.
                  </p>
                </div>
                {documentType === "proposal" && (
                  <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>

            {!documentType && (
              <p className="text-[11px] text-amber-600 flex items-center gap-1 font-medium pt-0.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Pilih salah satu tipe dokumen di atas agar naskah dapat diproses dan dicatat di database repositori.</span>
              </p>
            )}
          </div>

          {/* 2. Drag & Drop Upload Area */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Berkas Naskah PDF <span className="text-red-500">*</span>
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => {
                if (!file && !isUploading && fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                file
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
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-bold text-gray-800">
                    Tarik dan lepaskan file PDF ke area ini
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    atau <span className="font-semibold text-red-600 hover:underline">klik untuk memilih berkas</span> dari komputer
                  </p>
                  <p className="mt-2 text-[11px] text-gray-400">
                    Mendukung dokumen teks PDF (.pdf)
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
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Berkas PDF Siap Diunggah
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
                      className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                      title="Hapus berkas"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Loading Indicator during request */}
          {isUploading && (
            <div className="rounded-xl border border-red-100 bg-red-50/50 p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-red-900">
                  <RefreshCw className="h-4 w-4 animate-spin text-red-600" />
                  <span>Mengirimkan berkas ke FastAPI server (/api/documents/upload)...</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full bg-red-600 animate-pulse w-full" />
              </div>
              <p className="text-[11px] text-gray-500 text-center">
                Mohon tunggu, server sedang menyimpan dokumen sebagai {documentType.toUpperCase()} dan memproses perbandingan TF-IDF.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={(!file && !documentType) || isUploading}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleStartChecking}
              disabled={!file || !documentType || isUploading}
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4" />
                  <span>Cek Kemiripan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Server Response Result Card */}
        {uploadedDoc && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Tersimpan di Database (ID #{uploadedDoc.id})</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-800 uppercase">
                    <Tag className="h-3 w-3" />
                    <span>Tipe: {uploadedDoc.document_type || documentType}</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-800">{uploadedDoc.filename}</h3>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                  Path: {uploadedDoc.file_path}
                </p>
              </div>

              {analysisResult && (
                <div className="text-left sm:text-right">
                  <span className="text-xs font-medium text-gray-500">Skor Tertinggi Repositori</span>
                  <p className="text-2xl font-bold text-red-600">
                    {analysisResult.highest_similarity_percentage}
                  </p>
                </div>
              )}
            </div>

            {analysisResult && analysisResult.matches && analysisResult.matches.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                  Hasil Perbandingan Repositori Kampus ({analysisResult.total_repository_checked} Dokumen Diperiksa):
                </h4>
                <div className="space-y-2">
                  {analysisResult.matches.map((match) => (
                    <div
                      key={match.repository_document_id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 text-xs"
                    >
                      <span className="font-semibold text-gray-800 truncate mr-3">
                        {match.title}
                      </span>
                      <span className="font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full shrink-0">
                        {match.similarity_percentage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                &larr; Unggah Berkas Lain
              </button>
              <Link
                href="/riwayat"
                className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs transition-colors"
              >
                <span>Lihat Riwayat & Dokumen</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
