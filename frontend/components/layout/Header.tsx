"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { Role } from "@/types/role";
import {
  Menu,
  Bell,
  GraduationCap,
  Briefcase,
  Shield,
  LogOut,
} from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
}

const ROLES: { id: Role; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    id: "mahasiswa",
    label: "Mahasiswa",
    description: "Unggah naskah skripsi/sempro & cek skor",
    icon: GraduationCap,
  },
  {
    id: "dosen",
    label: "Dosen Pembimbing",
    description: "Tinjau antrean bimbingan & validasi kemiripan",
    icon: Briefcase,
  },
  {
    id: "admin",
    label: "Administrator IT",
    description: "Kelola repositori & pantau status sistem",
    icon: Shield,
  },
];

export default function Header({ onToggleSidebar, title = "Dashboard" }: HeaderProps) {
  const router = useRouter();
  const { currentRole, currentUser, logout } = useRole();
  const [notifOpen, setNotifOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close notification popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Strict mounting shield: identical static header shell on SSR and initial client pass
  if (!isMounted) {
    return (
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8">
        {/* Left side: Hamburger Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 md:hidden"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight">
                {title}
              </h1>
            </div>
            <p className="hidden text-xs text-gray-500 md:block">
              Sistem Pengecekan Kemiripan Dokumen Akademik
            </p>
          </div>
        </div>

        {/* Right side: Static placeholder */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400">
            <Bell className="h-5 w-5" />
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-400 shadow-2xs">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </div>
        </div>
      </header>
    );
  }

  const activeRoleConfig = ROLES.find((r) => r.id === currentRole) || ROLES[0];
  const RoleIcon = activeRoleConfig.icon;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8">
      {/* Left side: Hamburger Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight">
              {title}
            </h1>
          </div>
          <p className="hidden text-xs text-gray-500 md:block">
            Sistem Pengecekan Kemiripan Dokumen Akademik
          </p>
        </div>
      </div>

      {/* Right side: Notifications, Locked Role Badge & Logout */}
      <div className="flex items-center gap-3">
        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600"></span>
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-3 shadow-lg z-50">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                <span className="text-xs font-bold text-gray-800">Notifikasi</span>
                <span className="text-[10px] text-red-600 font-semibold cursor-pointer hover:underline">
                  Tandai Dibaca
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="rounded-lg bg-gray-50 p-2.5">
                  <div className="flex items-center justify-between font-semibold text-gray-800">
                    <span>Hasil Pengecekan Siap</span>
                    <span className="text-[10px] font-normal text-gray-400">10m lalu</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-600">
                    Dokumen skripsi Anda berhasil dianalisis terhadap repositori kampus.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Locked Active Role Badge (Terkunci Sesuai Akun Login) */}
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs min-h-[38px]">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-100 text-red-700">
            <RoleIcon className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-medium text-gray-400 leading-none">
              Peran Aktif:
            </span>
            <span className="font-bold text-gray-800 leading-tight">
              {currentUser.roleLabel}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors shadow-2xs cursor-pointer"
          title="Keluar dari sesi akun saat ini"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
