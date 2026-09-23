"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { Role } from "@/types/role";
import {
  Menu,
  Bell,
  ChevronDown,
  GraduationCap,
  Briefcase,
  Shield,
  Check,
  Sparkles,
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
  const { currentRole, setRole, currentUser, logout } = useRole();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <span className="hidden sm:inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
              SADS Integrated
            </span>
          </div>
          <p className="hidden text-xs text-gray-500 md:block">
            Sistem Pengecekan Kemiripan Dokumen Akademik
          </p>
        </div>
      </div>

      {/* Right side: Notifications & Role Switcher */}
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
            {/* Red Notification Dot */}
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
                    Dokumen Bab 2 Skripsi berhasil dianalisis dengan kemiripan 14.8%.
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2.5">
                  <div className="flex items-center justify-between font-semibold text-gray-800">
                    <span>Pengumuman Akademik</span>
                    <span className="text-[10px] font-normal text-gray-400">1j lalu</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-gray-600">
                    Batas akhir unggah proposal seminar dibuka hingga akhir bulan.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Dropdown (for testing/admin impersonation) */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:border-gray-300 hover:bg-gray-50 transition-colors"
            title="Ganti Mode Peran Pengguna"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded bg-red-50 text-red-700">
              <RoleIcon className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-medium text-gray-400 leading-none">
                Mode Akses:
              </span>
              <span className="font-bold text-gray-800 leading-tight">
                {activeRoleConfig.label}
              </span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl z-50">
              <div className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <Sparkles className="h-3.5 w-3.5 text-red-600" />
                <span>Simulasi Peran (Role Switcher)</span>
              </div>
              <div className="py-1 space-y-1">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = currentRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setRole(role.id);
                        setDropdownOpen(false);
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-lg p-2.5 text-left transition-colors ${
                        isSelected
                          ? "bg-red-50 text-red-900 font-semibold"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                          isSelected
                            ? "bg-red-600 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{role.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-red-600" />}
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-1">
                          {role.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-gray-100 px-3 py-2 text-[10px] text-gray-400">
                Pilih peran untuk menguji tampilan antarmuka & alur kerja masing-masing pengguna.
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors shadow-xs"
          title="Keluar dari sesi akun saat ini"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
