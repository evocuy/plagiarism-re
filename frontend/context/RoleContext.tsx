"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Role, UserProfile, NavCategory } from "@/types/role";

export const MOCK_PROFILES: Record<Role, UserProfile> = {
  mahasiswa: {
    name: "Ahmad Rizky Pratama",
    identifier: "20210801142",
    identifierType: "NIM",
    roleLabel: "Mahasiswa Bimbingan",
    initials: "AR",
    email: "ahmad.rizky@student.univ.ac.id",
    programStudi: "Teknik Informatika",
    fakultas: "Fakultas Ilmu Komputer",
  },
  dosen: {
    name: "Dr. Ir. Hendra Gunawan, M.Kom.",
    identifier: "0412087501",
    identifierType: "NIDN",
    roleLabel: "Dosen Pembimbing",
    initials: "HG",
    email: "hendra.gunawan@lecturer.univ.ac.id",
    programStudi: "Teknik Informatika",
    fakultas: "Fakultas Ilmu Komputer",
  },
  admin: {
    name: "Bambang Wijaya, S.Kom.",
    identifier: "198804152011011002",
    identifierType: "NIP",
    roleLabel: "Administrator Sistem",
    initials: "BW",
    email: "admin.it@univ.ac.id",
    programStudi: "Biro TI & Sistem Informasi",
    fakultas: "Pusat Komputer Kampus",
  },
};

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
  admin: [
    {
      category: "MAIN NAVIGATION",
      items: [
        { name: "Dashboard", href: "/dashboard", iconName: "LayoutDashboard" },
        { name: "Kelola Repositori", href: "/kelola-repositori", iconName: "Database" },
        { name: "Log Pengecekan", href: "/riwayat", iconName: "FileText" },
        { name: "Kelola Pengguna", href: "/bantuan", iconName: "UserCheck" },
      ],
    },
    {
      category: "PENGATURAN",
      items: [
        { name: "Pengaturan Sistem", href: "/panduan", iconName: "Settings" },
      ],
    },
  ],
};

interface RoleContextType {
  currentRole: Role;
  currentUser: UserProfile;
  isAuthenticated: boolean;
  setRole: (role: Role) => void;
  login: (role: Role) => void;
  logout: () => void;
  navigation: NavCategory[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>("mahasiswa");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Synchronize authentication state from localStorage on client-side mount
  React.useEffect(() => {
    try {
      const savedAuth = localStorage.getItem("plagiarism_is_authenticated");
      const savedRole = localStorage.getItem("plagiarism_auth_role") as Role | null;

      if (savedAuth === "true" && savedRole && MOCK_PROFILES[savedRole]) {
        setCurrentRole(savedRole);
        setIsAuthenticated(true);
      }
    } catch {
      // ignore SSR or storage errors
    }
  }, []);

  const currentUser = MOCK_PROFILES[currentRole];
  const navigation = ROLE_NAVIGATION[currentRole];

  const setRole = (role: Role) => {
    setCurrentRole(role);
    try {
      localStorage.setItem("plagiarism_auth_role", role);
    } catch {
      // ignore
    }
  };

  const login = (role: Role) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    try {
      localStorage.setItem("plagiarism_auth_role", role);
      localStorage.setItem("plagiarism_is_authenticated", "true");
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem("plagiarism_is_authenticated");
    } catch {
      // ignore
    }
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        currentUser,
        isAuthenticated,
        setRole,
        login,
        logout,
        navigation,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextType {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
