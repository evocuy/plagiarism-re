"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  BookOpen,
  HelpCircle,
  FileCode,
  CheckCircle2,
  ChevronDown,
  Layers,
  Percent,
  Search,
  Cpu,
  ArrowRight,
  UploadCloud,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "Algoritma" | "Ambang Batas" | "Pencegahan";
}

const FAQ_LIST: FAQItem[] = [
  {
    category: "Algoritma",
    question: "Bagaimana cara kerja metode TF-IDF dalam menghitung kemiripan dokumen?",
    answer:
      "TF-IDF (Term Frequency - Inverse Document Frequency) adalah metode statistik untuk mengevaluasi seberapa penting sebuah kata dalam suatu dokumen terhadap kumpulan repositori dokumen kampus. Term Frequency (TF) menghitung frekuensi kemunculan kata dalam naskah Anda, sedangkan Inverse Document Frequency (IDF) memberikan bobot lebih rendah pada kata-kata umum yang muncul di hampir seluruh dokumen dan memberikan bobot lebih tinggi pada kata-kata kunci unik bidang keilmuan naskah Anda.",
  },
  {
    category: "Algoritma",
    question: "Apa itu Cosine Similarity dan bagaimana persentasenya dihitung?",
    answer:
      "Cosine Similarity mengukur kosinus sudut antara dua vektor representasi kata (naskah Anda vs repositori). Nilainya berkisar antara 0 (tidak ada kemiripan sama sekali) hingga 1 (identik mutlak). Persentase dihitung dengan rumus: Skor = cos(θ) × 100%. Karena menggunakan sudut geometris, Cosine Similarity tidak terpengaruh oleh panjang naskah, melainkan kecocokan kosakata dan frekuensi distribusinya.",
  },
  {
    category: "Ambang Batas",
    question: "Apakah skor kemiripan 22% berarti saya terbukti melakukan plagiarisme?",
    answer:
      "Tidak. Sistem ini adalah similarity checker (alat bantu pengecekan kemiripan), bukan penentu vonis plagiarisme mutlak. Skor 22% menunjukkan kesamaan leksikal dengan repositori yang dapat mencakup kutipan langsung yang sah, nama institusi, terminologi ilmiah baku, atau pustaka. Dosen pembimbing tetap memiliki kewenangan akademik untuk memverifikasi apakah segmen yang mirip merupakan sitasi yang sah atau membutuhkan parafrasa ulang.",
  },
  {
    category: "Ambang Batas",
    question: "Berapa standar batas toleransi kemiripan yang berlaku di kampus?",
    answer:
      "Berdasarkan pedoman akademik kampus: Untuk Seminar Proposal (Sempro), batas maksimal kemiripan adalah ≤ 20%. Untuk Naskah Skripsi Akhir (Sidang), batas maksimal kemiripan adalah ≤ 25%. Naskah yang melebihi batas ini diwajibkan melakukan revisi parafrasa sebelum diverifikasi kembali oleh Dosen Pembimbing.",
  },
  {
    category: "Pencegahan",
    question: "Bagaimana teknik parafrasa yang efektif agar tidak terdeteksi mirip?",
    answer:
      "1. Pahami inti gagasan sumber aslinya secara menyeluruh tanpa melihat teks saat menulis kembali.\n2. Ubah struktur kalimat (misalnya dari pasif menjadi aktif atau sebaliknya).\n3. Gunakan sinonim yang tepat dalam konteks keilmuan yang sama.\n4. Rangkum gagasan beberapa kalimat menjadi satu pernyataan padat.\n5. Selalu cantumkan sitasi sumber primer (misal: Wijaya, 2024).",
  },
  {
    category: "Pencegahan",
    question: "Apakah Daftar Pustaka dan Lembar Pengesahan perlu diunggah saat pengecekan?",
    answer:
      "Sebaiknya tidak. Bagian formal seperti cover, lembar pengesahan, kata pengantar, dan daftar pustaka biasanya memiliki format baku yang identik di seluruh kampus, sehingga dapat menaikkan skor kemiripan tanpa alasan substantif. Sangat disarankan mengunggah per bab (Bab 1, Bab 2, dst.) atau hanya bagian isi utama naskah.",
  },
];

export default function PanduanPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");

  const filteredFAQs =
    activeCategory === "Semua"
      ? FAQ_LIST
      : FAQ_LIST.filter((f) => f.category === activeCategory);

  return (
    <DashboardLayout title="Buku Panduan">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Banner Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Panduan Algoritma & Interpretasi Kemiripan
              </h2>
              <p className="text-xs text-gray-500">
                Pelajari bagaimana sistem memproses teks, menghitung representasi vektor kata, serta memahami hasil evaluasi.
              </p>
            </div>
          </div>
        </div>

        {/* NLP Pipeline Architecture Flow */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-base font-bold text-gray-800">
              Alur Kerja NLP Similarity Engine
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              5 tahapan pengolahan naskah mulai dari dokumen PDF hingga persentase kemiripan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Step 1 */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 relative">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 mb-2">
                1
              </div>
              <h4 className="text-xs font-bold text-gray-800">Ekstraksi PDF</h4>
              <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
                PyMuPDF membaca struktur halaman dan mengekstrak teks asli naskah ilmiah.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 relative">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 mb-2">
                2
              </div>
              <h4 className="text-xs font-bold text-gray-800">Preprocessing</h4>
              <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
                Case folding, pembersihan tanda baca, penghapusan stopword & stemming Sastrawi.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 relative">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 mb-2">
                3
              </div>
              <h4 className="text-xs font-bold text-gray-800">Vektorisasi TF-IDF</h4>
              <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
                Kata diubah menjadi bobot numerik berdasarkan frekuensi relatif repositori kampus.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 relative">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 mb-2">
                4
              </div>
              <h4 className="text-xs font-bold text-gray-800">Cosine Similarity</h4>
              <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
                Menghitung sudut geometris antar vektor naskah dengan repositori internal.
              </p>
            </div>

            {/* Step 5 */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 relative">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700 mb-2">
                5
              </div>
              <h4 className="text-xs font-bold text-gray-800">Laporan & Skor</h4>
              <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
                Menghasilkan persentase akhir kemiripan dan daftar rujukan dokumen terkait.
              </p>
            </div>
          </div>
        </div>

        {/* Understanding the Thresholds */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-green-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-green-700 uppercase">Kategori Aman</span>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-800">
                &le; 20%
              </span>
            </div>
            <p className="mt-2 text-xs font-semibold text-gray-800">
              Lolos Verifikasi Kampus
            </p>
            <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
              Tingkat kemiripan berada dalam batas normal kutipan ilmiah dan istilah umum. Naskah dapat diajukan ke Dosen Pembimbing.
            </p>
          </div>

          <div className="rounded-xl border border-yellow-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-yellow-700 uppercase">Kategori Warning</span>
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-bold text-yellow-800">
                21% - 30%
              </span>
            </div>
            <p className="mt-2 text-xs font-semibold text-gray-800">
              Memerlukan Review / Revisi
            </p>
            <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
              Terdapat beberapa paragraf dengan kemiripan tinggi. Mahasiswa disarankan melakukan parafrasa aktif sebelum validasi akhir.
            </p>
          </div>

          <div className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-700 uppercase">Kategori Bahaya</span>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800">
                &gt; 30%
              </span>
            </div>
            <p className="mt-2 text-xs font-semibold text-gray-800">
              Tidak Memenuhi Syarat
            </p>
            <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
              Kemiripan melampaui batas toleransi naskah akademik. Naskah wajib direvisi secara menyeluruh sebelum dapat mendaftar sidang.
            </p>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">
                Pertanyaan yang Sering Diajukan (FAQ)
              </h3>
              <p className="text-xs text-gray-500">
                Jawaban seputar perhitungan kemiripan dan regulasi akademik naskah
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5">
              {["Semua", "Algoritma", "Ambang Batas", "Pencegahan"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    activeCategory === cat
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion items */}
          <div className="divide-y divide-gray-100">
            {filteredFAQs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-start justify-between gap-4 text-left"
                  >
                    <span className="text-xs font-bold text-gray-800 hover:text-red-700 transition-colors">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                        isOpen ? "rotate-180 text-red-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="mt-2.5 text-xs text-gray-600 leading-relaxed whitespace-pre-line pl-1">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Card to Upload */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-gray-800">
              Siap Memeriksa Naskah Tugas Akhir Anda?
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Unggah berkas PDF dan dapatkan laporan kemiripan dalam hitungan detik.
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs transition-colors shrink-0"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Mulai Pengecekan</span>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
