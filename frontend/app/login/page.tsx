"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole, MOCK_PROFILES } from "@/context/RoleContext";
import { Role } from "@/types/role";
import {
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Shield,
  ArrowRight,
  Lock,
  User,
  Sparkles,
  CheckCircle2,
  Info,
} from "lucide-react";

interface RoleTabOption {
  id: Role;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  idLabel: string;
  defaultId: string;
  description: string;
  landingPage: string;
}

const ROLE_OPTIONS: RoleTabOption[] = [
  {
    id: "mahasiswa",
    title: "Mahasiswa",
    subtitle: "Mahasiswa Bimbingan",
    badge: "Student Portal",
    icon: GraduationCap,
    idLabel: "Nomor Induk Mahasiswa (NIM)",
    defaultId: "20210801142",
    description: "Unggah naskah skripsi atau proposal sempro, periksa persentase kemiripan repositori kampus.",
    landingPage: "/dashboard",
  },
  {
    id: "dosen",
    title: "Dosen Pembimbing",
    subtitle: "Dosen & Penguji",
    badge: "Lecturer Portal",
    icon: Briefcase,
    idLabel: "Nomor Induk Dosen Nasional (NIDN)",
    defaultId: "0412087501",
    description: "Tinjau naskah bimbingan mahasiswa, validasi tingkat plagiarisme, dan kelola antrean approval sidang.",
    landingPage: "/dashboard",
  },
  {
    id: "admin",
    title: "Super Admin",
    subtitle: "Administrator IT",
    badge: "Admin Console",
    icon: Shield,
    idLabel: "Nomor Induk Pegawai (NIP) / User ID",
    defaultId: "198804152011011002",
    description: "Kelola repositori dokumen kampus, pantau kinerja TF-IDF engine, dan pantau log sistem.",
    landingPage: "/dashboard",
  },
];

import { loginApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithUser } = useRole();

  const [selectedRole, setSelectedRole] = useState<Role>("mahasiswa");
  const [identifier, setIdentifier] = useState<string>(ROLE_OPTIONS[0].defaultId);
  const [password, setPassword] = useState<string>("password123");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeOption = ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[0];
  const ActiveIcon = activeOption.icon;
  const mockUser = MOCK_PROFILES[selectedRole];

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    const opt = ROLE_OPTIONS.find((r) => r.id === role);
    if (opt) {
      setIdentifier(opt.defaultId);
      setPassword("password123");
    }
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim()) {
      setErrorMsg(`${activeOption.idLabel} tidak boleh kosong!`);
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Kata sandi tidak boleh kosong!");
      return;
    }

    setIsLoading(true);

    try {
      const resp = await loginApi(identifier.trim(), password);
      loginWithUser(resp.user, resp.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal masuk. Periksa kembali NIM/NIDN/NIP dan kata sandi.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: Role) => {
    setErrorMsg(null);
    setIsLoading(true);
    const opt = ROLE_OPTIONS.find((r) => r.id === role);
    const idToUse = opt ? opt.defaultId : "20210801142";
    const passToUse = "password123";

    try {
      const resp = await loginApi(idToUse, passToUse);
      loginWithUser(resp.user, resp.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal login otomatis.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/20 to-gray-100 flex flex-col justify-between">
      {/* Top Bar Branding */}
      <header className="w-full border-b border-gray-200/80 bg-white/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#cc1a22] text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-wider text-gray-900">
                PLAGIARISM CHECKER
              </span>
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                SADS KAMPUS
              </span>
            </div>
            <p className="text-[11px] text-gray-500 hidden sm:block">
              Sistem Pengecekan Kemiripan Dokumen Naskah Skripsi & Proposal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>FastAPI Engine Online</span>
        </div>
      </header>

      {/* Main Login Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Card / Welcome */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Portal Terpadu Multi-Peran</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
                Masuk ke Sistem Pengecekan Plagiarisme
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Pilih peran Anda untuk mengakses antarmuka yang disesuaikan dengan alur verifikasi akademik kampus.
              </p>
            </div>

            {/* Role highlights */}
            <div className="space-y-3 pt-2">
              <div
                onClick={() => handleRoleSelect("mahasiswa")}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === "mahasiswa"
                    ? "border-red-500 bg-white shadow-md ring-1 ring-red-500"
                    : "border-gray-200 bg-white/60 hover:bg-white hover:border-gray-300"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    selectedRole === "mahasiswa"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900">Mahasiswa</h3>
                    {selectedRole === "mahasiswa" && (
                      <span className="text-[10px] font-bold text-red-600">Dipilih</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                    Unggah naskah skripsi/sempro dan dapatkan laporan kemiripan dengan repositori.
                  </p>
                </div>
              </div>

              <div
                onClick={() => handleRoleSelect("dosen")}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === "dosen"
                    ? "border-red-500 bg-white shadow-md ring-1 ring-red-500"
                    : "border-gray-200 bg-white/60 hover:bg-white hover:border-gray-300"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    selectedRole === "dosen"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900">Dosen Pembimbing</h3>
                    {selectedRole === "dosen" && (
                      <span className="text-[10px] font-bold text-red-600">Dipilih</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                    Pantau daftar naskah bimbingan & validasi kelayakan sempro/sidang.
                  </p>
                </div>
              </div>

              <div
                onClick={() => handleRoleSelect("admin")}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedRole === "admin"
                    ? "border-red-500 bg-white shadow-md ring-1 ring-red-500"
                    : "border-gray-200 bg-white/60 hover:bg-white hover:border-gray-300"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    selectedRole === "admin"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Shield className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-900">Super Admin</h3>
                    {selectedRole === "admin" && (
                      <span className="text-[10px] font-bold text-red-600">Dipilih</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                    Manajemen naskah repositori kampus, monitoring engine TF-IDF & server.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Login Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xl">
              {/* Role Indicator Banner */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700">
                    <ActiveIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-gray-900">
                        Masuk sebagai {activeOption.title}
                      </h2>
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                        {activeOption.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {mockUser.name} ({mockUser.programStudi})
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">
                  <Info className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {activeOption.idLabel}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={activeOption.defaultId}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 text-xs text-gray-800 font-medium placeholder:text-gray-400 focus:border-red-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-red-600 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700">Kata Sandi</label>
                    <span className="text-[11px] text-red-600 hover:underline cursor-pointer">
                      Lupa sandi?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 text-xs text-gray-800 font-medium placeholder:text-gray-400 focus:border-red-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-red-600 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-xs font-bold text-white shadow-md hover:bg-red-700 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <span>Memverifikasi akun...</span>
                    ) : (
                      <>
                        <span>Masuk ke {activeOption.title}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Quick Login Section (Convenience for testing & evaluation) */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Akses Cepat Pengujian (1-Klik):</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("mahasiswa")}
                    className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-red-50 hover:border-red-300 transition-colors text-center group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 group-hover:text-red-700">
                      <GraduationCap className="h-4 w-4 text-red-600" />
                      <span>Mahasiswa</span>
                    </div>
                    <span className="text-[10px] text-gray-400 group-hover:text-red-500 mt-0.5">
                      Rizky (NIM 142)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin("dosen")}
                    className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-red-50 hover:border-red-300 transition-colors text-center group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 group-hover:text-red-700">
                      <Briefcase className="h-4 w-4 text-red-600" />
                      <span>Dosen</span>
                    </div>
                    <span className="text-[10px] text-gray-400 group-hover:text-red-500 mt-0.5">
                      Dr. Hendra (NIDN)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin("admin")}
                    className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-red-50 hover:border-red-300 transition-colors text-center group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 group-hover:text-red-700">
                      <Shield className="h-4 w-4 text-red-600" />
                      <span>Super Admin</span>
                    </div>
                    <span className="text-[10px] text-gray-400 group-hover:text-red-500 mt-0.5">
                      Bambang (NIP)
                    </span>
                  </button>
                </div>
              </div>

              {/* Note / Info */}
              <div className="mt-4 rounded-lg bg-gray-50 p-2.5 text-[11px] text-gray-500 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Setelah masuk, halaman yang ditampilkan akan otomatis disesuaikan dengan peran yang dipilih (Mahasiswa, Dosen, atau Super Admin).
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 px-6 text-center text-xs text-gray-500">
        <p className="font-semibold text-gray-700">
          Sistem Pengecekan Plagiarisme & Repositori Naskah Tugas Akhir
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Integrasi SADS Kampus • Engine: PyMuPDF + Sastrawi + TF-IDF + Cosine Similarity
        </p>
      </footer>
    </div>
  );
}
