"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useRole } from "@/context/RoleContext";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isLoadingSession } = useRole();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoadingSession && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoadingSession, router]);

  if (isLoadingSession || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">
        Memverifikasi akses aman…
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} title={title} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}