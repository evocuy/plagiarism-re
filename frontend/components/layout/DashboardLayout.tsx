"use client";

import React, { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ShieldAlert, LayoutDashboard } from "lucide-react";
import { useRole } from "@/context/RoleContext";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { currentRole, currentUser, isAllowedRoute } = useRole();

  const allowed = isAllowedRoute(pathname);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar (Desktop sticky & Mobile drawer) */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          title={title}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {allowed ? (
              children
            ) : (
              /* Access Denied (1 Role untuk 1 Tampilan Protection) */
              <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-2xl border border-red-200 bg-white shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4 ring-8 ring-red-50/50">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                  Akses Ditolak (403 Forbidden)
                </span>
                <h2 className="mt-3 text-xl font-bold text-gray-900">
                  Halaman Tidak Dapat Diakses Oleh Peran Anda
                </h2>
                <p className="mt-2 max-w-md text-xs text-gray-500 leading-relaxed">
                  Anda sedang masuk sebagai <strong className="text-gray-800 uppercase">{currentUser.roleLabel} ({currentRole})</strong>.
                  Sesuai kebijakan hak akses sistem, antarmuka ini hanya dikhususkan untuk peran pengguna yang berwenang.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Kembali ke Dashboard Utama</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
