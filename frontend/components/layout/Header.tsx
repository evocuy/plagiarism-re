"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { Bell, LogOut, Menu, ShieldCheck } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

const ROLE_LABELS = {
  mahasiswa: "Mahasiswa Bimbingan",
  dosen: "Dosen Pembimbing",
  super_admin: "Super Administrator",
} as const;

export default function Header({ onToggleSidebar, title = "Dashboard" }: HeaderProps) {
  const router = useRouter();
  const { currentRole, currentUser, logout } = useRole();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  const roleLabel = currentRole ? ROLE_LABELS[currentRole] : "Memuat sesi";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 md:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-gray-800 md:text-xl">{title}</h1>
            <span className="hidden items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 sm:inline-flex">
              SADS Integrated
            </span>
          </div>
          <p className="hidden text-xs text-gray-500 md:block">Sistem Pengecekan Kemiripan Dokumen Akademik</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((open) => !open)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
            aria-label="Notifikasi"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
              <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-gray-800">Notifikasi</span>
                <span className="cursor-pointer text-[10px] font-semibold text-red-600 hover:underline">Tandai Dibaca</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="rounded-lg bg-gray-50 p-2.5">
                  <div className="flex items-center justify-between font-semibold text-gray-800">
                    <span>Hasil Pengecekan Siap</span>
                    <span className="text-[10px] font-normal text-gray-400">10m lalu</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-600">Dokumen Bab 2 Skripsi berhasil dianalisis dengan kemiripan 14.8%.</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2.5">
                  <div className="flex items-center justify-between font-semibold text-gray-800">
                    <span>Pengumuman Akademik</span>
                    <span className="text-[10px] font-normal text-gray-400">1j lalu</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-600">Batas akhir unggah proposal seminar dibuka hingga akhir bulan.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="hidden items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 sm:flex" title="Role diverifikasi dari sesi server">
          <ShieldCheck className="h-4 w-4 text-indigo-600" aria-hidden="true" />
          <div className="leading-tight">
            <p className="text-[10px] font-medium text-indigo-500">Akses terverifikasi</p>
            <p className="text-xs font-bold text-indigo-900">{roleLabel}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          title={`Keluar dari sesi ${currentUser?.name ?? "akun"} saat ini`}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}