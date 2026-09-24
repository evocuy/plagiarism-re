"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole, MOCK_PROFILES } from "@/context/RoleContext";
import { Role } from "@/types/role";
import { loginApi } from "@/lib/api";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Shield,
  Sparkles,
  LogIn,
} from "lucide-react";

interface RoleOption {
  id: Role;
  label: string;
  idLabel: string;
  placeholder: string;
  defaultId: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLES: RoleOption[] = [
  {
    id: "mahasiswa",
    label: "Mahasiswa",
    idLabel: "NIM / Username",
    placeholder: "Masukkan NIM (contoh: 20210801142)",
    defaultId: "20210801142",
    icon: GraduationCap,
  },
  {
    id: "dosen",
    label: "Dosen",
    idLabel: "NIDN / Username",
    placeholder: "Masukkan NIDN (contoh: 0412087501)",
    defaultId: "0412087501",
    icon: Briefcase,
  },
  {
    id: "admin",
    label: "Admin",
    idLabel: "NIP / Username",
    placeholder: "Masukkan NIP (contoh: 198804152011011002)",
    defaultId: "198804152011011002",
    icon: Shield,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { loginWithUser } = useRole();

  const [selectedRole, setSelectedRole] = useState<Role>("mahasiswa");
  const [identifier, setIdentifier] = useState<string>(ROLES[0].defaultId);
  const [password, setPassword] = useState<string>("password123");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeRole = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    const target = ROLES.find((r) => r.id === role);
    if (target) {
      setIdentifier(target.defaultId);
      setPassword("password123");
    }
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setErrorMsg(`${activeRole.idLabel} tidak boleh kosong.`);
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Kata sandi tidak boleh kosong.");
      return;
    }

    setIsLoading(true);

    try {
      const resp = await loginApi(cleanIdentifier, password);
      loginWithUser(resp.user, resp.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal masuk. Silakan periksa kembali kredensial Anda.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: Role) => {
    setErrorMsg(null);
    setIsLoading(true);
    const target = ROLES.find((r) => r.id === role) || ROLES[0];
    const demoId = target.defaultId;
    const demoPass = "password123";

    try {
      const resp = await loginApi(demoId, demoPass);
      loginWithUser(resp.user, resp.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal masuk ke akun pengujian.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat bg-fixed selection:bg-red-600 selection:text-white"
      style={{ backgroundImage: "url('/campus_bg.jpg')" }}
    >
      {/* Dark Semi-Transparent Overlay */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] transition-all" />

      {/* Centered Login Card Container */}
      <div className="relative z-10 w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Main Clean White Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl border border-white/40 p-6 sm:p-8 text-slate-800">
          
          {/* Card Header: Strictly Title, Subtitle, and Session Prompt */}
          <div className="text-center mb-6">
            {/* Title: Sistem Plagiarisme */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Sistem Plagiarisme
            </h1>

            {/* Subtitle: Pencegahan & Deteksi Dosen Mahasiswa */}
            <p className="text-xs sm:text-sm font-semibold text-red-600 tracking-normal mt-1.5">
              Pencegahan &amp; Deteksi Dosen Mahasiswa
            </p>

            {/* Instruction: Sign in to start your session */}
            <p className="text-xs sm:text-sm text-slate-500 font-medium pt-2.5 border-t border-slate-200/80 mt-3">
              Sign in to start your session
            </p>
          </div>

          {/* Role Tabs for Smooth Student / Lecturer Experience */}
          <div className="mb-5">
            <div className="flex items-center justify-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/80">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-white text-red-600 shadow-sm border border-slate-200/60"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-red-600" : "text-slate-400"}`} />
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Alert Box */}
          {errorMsg && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Username / NIM / NIP Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                {activeRole.idLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={activeRole.placeholder}
                  disabled={isLoading}
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all disabled:bg-slate-50"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi Anda"
                  disabled={isLoading}
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all disabled:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Assistance Row */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Remember Me</span>
              </label>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Untuk kendala login atau lupa kata sandi, silakan hubungi Biro IT / Layanan Akademik.");
                }}
                className="font-medium text-red-600 hover:text-red-700 hover:underline"
              >
                Lupa Password?
              </a>
            </div>

            {/* Solid Institutional Red Action Button: "Sign In" */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-bold shadow-md shadow-red-600/25 hover:shadow-lg hover:shadow-red-600/35 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar (Convenience for testing) */}
          <div className="mt-6 pt-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Akses Cepat Pengujian
              </span>
              <span className="text-[10px] text-slate-400">1-Klik</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemo("mahasiswa")}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-red-50 hover:border-red-300 transition-colors text-center group cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-700 group-hover:text-red-600">
                  Mahasiswa
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">NIM 142</div>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemo("dosen")}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-red-50 hover:border-red-300 transition-colors text-center group cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-700 group-hover:text-red-600">
                  Dosen
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">Dr. Hendra</div>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemo("admin")}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-red-50 hover:border-red-300 transition-colors text-center group cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-700 group-hover:text-red-600">
                  Admin
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">Bambang</div>
              </button>
            </div>
          </div>

        </div>

        {/* Subtle Bottom Academic Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-white/80 font-medium drop-shadow-sm">
            &copy; 2026 Repositori Karya Ilmiah Kampus
          </p>
          <p className="text-[11px] text-white/60 drop-shadow-sm">
            Verifikasi Kemiripan Naskah Skripsi &amp; Seminar Proposal
          </p>
        </div>

      </div>
    </div>
  );
}
