"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useRole } from "@/context/RoleContext";
import {
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  LifeBuoy,
  FileQuestion,
} from "lucide-react";

export default function BantuanPage() {
  const { currentUser } = useRole();
  const [category, setCategory] = useState("Kendala Unggah Dokumen PDF");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState<string | null>(null);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const generatedTicketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketSubmitted(generatedTicketId);
      setSubject("");
      setMessage("");
    }, 1000);
  };

  return (
    <DashboardLayout title="Pusat Bantuan">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Banner Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Pusat Bantuan & Layanan IT Kampus
              </h2>
              <p className="text-xs text-gray-500">
                Hubungi tim administrator dan dukungan teknis jika Anda mengalami kendala pada sistem plagiarism checker.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Email */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-700 mb-3">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-gray-800">Surel Bantuan</h3>
            <p className="mt-1 text-xs text-gray-500">
              Pertanyaan teknis & verifikasi repositori:
            </p>
            <a
              href="mailto:plagiarism-support@univ.ac.id"
              className="mt-2 block text-xs font-semibold text-red-600 hover:underline"
            >
              plagiarism-support@univ.ac.id
            </a>
          </div>

          {/* Card 2: Helpdesk WhatsApp */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700 mb-3">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-gray-800">Helpdesk Cepat</h3>
            <p className="mt-1 text-xs text-gray-500">
              Layanan pesan cepat jam operasional:
            </p>
            <p className="mt-2 text-xs font-semibold text-gray-800 font-mono">
              +62 812-3456-7890 (WA)
            </p>
          </div>

          {/* Card 3: Lokasi & Jam Operasional */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 mb-3">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-gray-800">Jam Operasional</h3>
            <p className="mt-1 text-xs text-gray-500">
              Senin &ndash; Jumat: 08.00 &ndash; 16.00 WIB
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Gedung Biro Rektorat Lt. 2, Ruang Puskom
            </p>
          </div>
        </div>

        {/* Support Ticket Submission Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-base font-bold text-gray-800">
              Formulir Pengajuan Tiket Bantuan
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Kirimkan rincian kendala Anda. Administrator sistem akan menanggapi dalam waktu 1x24 jam kerja.
            </p>
          </div>

          {/* Success Notification Alert */}
          {ticketSubmitted && (
            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-xs text-green-900">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
              <div>
                <p className="font-bold">
                  Tiket Berhasil Diajukan ({ticketSubmitted})
                </p>
                <p className="mt-0.5 text-green-800">
                  Terima kasih, laporan Anda telah masuk ke sistem audit helpdesk kami. Konfirmasi dan instruksi pemecahan kendala akan dikirimkan ke alamat email Anda: <strong>{currentUser.email}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setTicketSubmitted(null)}
                  className="mt-2 text-xs font-bold text-green-700 hover:underline"
                >
                  Kirim Tiket Lain
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nama Pengguna
                </label>
                <input
                  type="text"
                  value={currentUser.name}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs text-gray-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {currentUser.identifierType} / Peran
                </label>
                <input
                  type="text"
                  value={`${currentUser.identifier} (${currentUser.roleLabel})`}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs text-gray-600 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Kategori Kendala
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-800 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                >
                  <option value="Kendala Unggah Dokumen PDF">Kendala Unggah Dokumen PDF (Gagal Ekstraksi / Format File)</option>
                  <option value="Ketidaksesuaian Hasil Similarity">Ketidaksesuaian Hasil / Bab Similarity TF-IDF</option>
                  <option value="Integrasi Akun & Akses SADS">Integrasi Akun & Akses SADS Kampus</option>
                  <option value="Permintaan Penambahan Naskah Repositori">Permintaan Penambahan / Hapus Naskah Repositori</option>
                  <option value="Lainnya">Kendala Teknis Lainnya</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Subjek Kendala
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dokumen Bab 2 Gagal Diproses oleh Ekstraktor PDF"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Rincian Deskripsi Kendala
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Jelaskan secara spesifik kendala yang Anda alami, nama berkas yang bermasalah, atau pesan error yang muncul..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting || !subject.trim() || !message.trim()}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? "Mengirimkan Tiket..." : "Kirim Tiket Bantuan"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
