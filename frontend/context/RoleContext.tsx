"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Role, UserProfile, NavCategory } from "@/types/role";
import { ApiUser, getCurrentUserApi, logoutApi, setAuthToken } from "@/lib/api";

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
        { name: "Dokumen Bimbingan", href: "/dokumen-bimbingan", iconName: "Users" },
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
        { name: "Kelola Pengguna", href: "/kelola-pengguna", iconName: "UserCheck" },
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
};

export const ROLE_ALLOWED_ROUTES: Record<Role, string[]> = {
  mahasiswa: ["/dashboard", "/upload", "/riwayat", "/panduan", "/bantuan"],
  dosen: ["/dashboard", "/dokumen-bimbingan", "/riwayat-approval", "/panduan", "/bantuan"],
  admin: ["/dashboard", "/kelola-repositori", "/riwayat", "/kelola-pengguna", "/panduan", "/bantuan"],
};

export function isRouteAllowedForRole(role: Role, pathname: string): boolean {
  if (pathname === "/" || pathname === "/login") return true;
  const allowed = ROLE_ALLOWED_ROUTES[role] || [];
  return allowed.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function buildUserProfile(apiUser: ApiUser): UserProfile {
  const role = (apiUser.role === "admin" || (apiUser.role as string) === "super_admin") ? "admin" : apiUser.role;
  const identifierType = role === "mahasiswa" ? "NIM" : role === "dosen" ? "NIDN" : "NIP";
  const roleLabel = role === "mahasiswa" ? "Mahasiswa Bimbingan" : role === "dosen" ? "Dosen Pembimbing" : "Super Admin";

  const words = (apiUser.name || "User").trim().split(" ");
  const initials = words.length >= 2
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : (words[0] || "U").substring(0, 2).toUpperCase();

  return {
    name: apiUser.name,
    identifier: apiUser.identifier,
    identifierType,
    roleLabel,
    initials,
    email: apiUser.email,
    programStudi: apiUser.program_studi || "Teknik Informatika",
    fakultas: apiUser.fakultas || "Fakultas Ilmu Komputer",
  };
}

interface RoleContextType {
  currentRole: Role;
  currentUser: UserProfile;
  rawUser: ApiUser | null;
  isAuthenticated: boolean;
  setRole: (role: Role) => void;
  loginWithUser: (user: ApiUser, token?: string) => void;
  logout: () => void;
  navigation: NavCategory[];
  isAllowedRoute: (pathname: string) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [rawUser, setRawUser] = useState<ApiUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem("plagiarism_auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState<Role>(() => {
    if (rawUser) {
      return (rawUser.role === "admin" || (rawUser.role as string) === "super_admin") ? "admin" : rawUser.role;
    }
    if (typeof window !== "undefined") {
      try {
        const savedRole = localStorage.getItem("plagiarism_auth_role") as Role | null;
        if (savedRole && MOCK_PROFILES[savedRole]) return savedRole;
      } catch {
        // ignore
      }
    }
    return "mahasiswa";
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (rawUser) return buildUserProfile(rawUser);
    return MOCK_PROFILES[currentRole] || MOCK_PROFILES.mahasiswa;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!rawUser;
  });

  useEffect(() => {
    let ignore = false;
    getCurrentUserApi()
      .then((user) => {
        if (!ignore) {
          const mappedRole: Role = (user.role === "admin" || (user.role as string) === "super_admin") ? "admin" : user.role;
          setRawUser(user);
          setCurrentRole(mappedRole);
          setCurrentUser(buildUserProfile(user));
          setIsAuthenticated(true);
          try {
            localStorage.setItem("plagiarism_auth_user", JSON.stringify(user));
            localStorage.setItem("plagiarism_auth_role", mappedRole);
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // Token kadaluarsa / belum login
      });

    return () => {
      ignore = true;
    };
  }, []);

  const navigation = ROLE_NAVIGATION[currentRole];

  const setRole = (role: Role) => {
    setCurrentRole(role);
    setCurrentUser(MOCK_PROFILES[role]);
    try {
      localStorage.setItem("plagiarism_auth_role", role);
    } catch {
      // ignore
    }
  };

  const loginWithUser = (user: ApiUser, token?: string) => {
    const mappedRole: Role = (user.role === "admin" || (user.role as string) === "super_admin") ? "admin" : user.role;
    setRawUser(user);
    setCurrentRole(mappedRole);
    setCurrentUser(buildUserProfile(user));
    setIsAuthenticated(true);

    try {
      localStorage.setItem("plagiarism_auth_user", JSON.stringify(user));
      localStorage.setItem("plagiarism_auth_role", mappedRole);
      localStorage.setItem("plagiarism_is_authenticated", "true");
      if (token) {
        setAuthToken(token);
      }
    } catch {
      // ignore
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setRawUser(null);
    setCurrentRole("mahasiswa");
    setCurrentUser(MOCK_PROFILES.mahasiswa);
    try {
      await logoutApi();
      localStorage.removeItem("plagiarism_auth_user");
      localStorage.removeItem("plagiarism_auth_role");
      localStorage.removeItem("plagiarism_is_authenticated");
      setAuthToken(null);
    } catch {
      // ignore
    }
  };

  const isAllowedRoute = (pathname: string): boolean => {
    return isRouteAllowedForRole(currentRole, pathname);
  };

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        currentUser,
        rawUser,
        isAuthenticated,
        setRole,
        loginWithUser,
        logout,
        navigation,
        isAllowedRoute,
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
