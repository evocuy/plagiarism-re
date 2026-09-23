"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUserApi, logoutApi, type AuthUser } from "@/lib/api";
import { Role, UserProfile, NavCategory } from "@/types/role";

export const ROLE_NAVIGATION: Record<Role, NavCategory[]> = {
  mahasiswa: [
    {
      category: "MAIN NAVIGATION",
      items: [
        { name: "Dashboard", href: "/dashboard", iconName: "LayoutDashboard" },
        { name: "Upload Dokumen", href: "/upload", iconName: "UploadCloud" },
        { name: "Riwayat Pengecekan", href: "/riwayat", iconName: "History" },
      ],
    },
    {
      category: "INFORMASI & PANDUAN",
      items: [
        { name: "Buku Panduan", href: "/panduan", iconName: "BookOpen" },
        { name: "Pusat Bantuan", href: "/bantuan", iconName: "HelpCircle" },
      ],
    },
  ],
  dosen: [
    {
      category: "MAIN NAVIGATION",
      items: [
        { name: "Dashboard", href: "/dashboard", iconName: "LayoutDashboard" },
        { name: "Dokumen Bimbingan", href: "/dokumen-bimbingan", iconName: "Users", badge: 3 },
        { name: "Riwayat Approval", href: "/riwayat-approval", iconName: "CheckCircle2" },
      ],
    },
    {
      category: "INFORMASI & PANDUAN",
      items: [
        { name: "Buku Panduan", href: "/panduan", iconName: "BookOpen" },
        { name: "Pusat Bantuan", href: "/bantuan", iconName: "HelpCircle" },
      ],
    },
  ],
  super_admin: [
    {
      category: "MAIN NAVIGATION",
      items: [
        { name: "Dashboard", href: "/dashboard", iconName: "LayoutDashboard" },
        { name: "Kelola Repositori", href: "/kelola-repositori", iconName: "Database" },
        { name: "Log Pengecekan", href: "/riwayat", iconName: "FileText" },
        { name: "Kelola Pengguna", href: "/kelola-pengguna", iconName: "UserCheck" },
      ],
    },
    {
      category: "PENGATURAN",
      items: [{ name: "Pengaturan Sistem", href: "/panduan", iconName: "Settings" }],
    },
  ],
};

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function toProfile(user: AuthUser): UserProfile {
  const identifierType = user.role === "mahasiswa" ? "NIM" : user.role === "dosen" ? "NIDN" : "NIP";
  const roleLabel =
    user.role === "mahasiswa"
      ? "Mahasiswa Bimbingan"
      : user.role === "dosen"
        ? "Dosen Pembimbing"
        : "Super Administrator";

  return {
    name: user.name,
    identifier: user.identifier,
    identifierType,
    roleLabel,
    initials: initialsFromName(user.name),
    email: user.email,
    programStudi: user.program_studi ?? undefined,
    fakultas: user.fakultas ?? undefined,
  };
}

interface RoleContextType {
  currentRole: Role | null;
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  setAuthenticatedUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
  navigation: NavCategory[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    // Timeout 5 detik — kalau backend tidak jalan, langsung resolve sebagai "tidak ada sesi"
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    getCurrentUserApi(controller.signal)
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        // Network error, timeout, 401 — semua dianggap unauthenticated
        if (active) setUser(null);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        if (active) setIsLoadingSession(false);
      });

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  const currentRole = user?.role ?? null;
  const currentUser = user ? toProfile(user) : null;
  const navigation = currentRole ? ROLE_NAVIGATION[currentRole] : [];

  const value = useMemo(
    () => ({
      currentRole,
      currentUser,
      isAuthenticated: Boolean(user),
      isLoadingSession,
      setAuthenticatedUser: setUser,
      logout: async () => {
        try {
          await logoutApi();
        } finally {
          setUser(null);
        }
      },
      navigation,
    }),
    [currentRole, currentUser, isLoadingSession, navigation, user]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextType {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}