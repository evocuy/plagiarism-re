"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { loginApi } from "@/lib/api";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  LogIn,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithUser } = useRole();

  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setErrorMsg("NIM, NIDN, NIP, atau Username tidak boleh kosong.");
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

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat bg-fixed selection:bg-red-700 selection:text-white"
      style={{ backgroundImage: "url('/campus_bg.jpg')" }}
    >
      {/* Dark Semi-Transparent Backdrop Overlay */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />

      {/* Centered Login Card */}
      <div className="relative z-10 w-full max-w-[410px] animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-7 sm:p-9 text-gray-800">
          
          {/* Institutional Header */}
          <div className="text-center mb-7">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-700 text-white shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Sistem Plagiarisme
            </h1>
            <p className="text-xs font-semibold text-red-700 tracking-normal mt-1">
              Portal Verifikasi Naskah Akademik
            </p>
            <p className="text-xs text-gray-500 font-medium mt-2 pt-2 border-t border-gray-100">
              Masuk menggunakan akun kampus Anda
            </p>
          </div>

          {/* Error Alert Box */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 text-red-700 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Friction-Free Form (No role selection tabs / dropdowns) */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Identifier Input (Username / NIM / NIDN / NIP) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                NIM / NIDN / NIP / Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Masukkan identitas kampus Anda"
                  disabled={isLoading}
                  autoComplete="username"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-red-700 focus:border-red-700 transition-colors disabled:bg-gray-50"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun"
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-red-700 focus:border-red-700 transition-colors disabled:bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Help Row */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600 hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-700 focus:ring-red-600 cursor-pointer accent-red-700"
                />
                <span className="font-medium">Ingat Sesi Saya</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  alert("Jika mengalami kendala masuk akun atau lupa kata sandi, silakan hubungi Biro IT / Layanan Akademik Kampus.");
                }}
                className="font-semibold text-red-700 hover:text-red-800 hover:underline cursor-pointer"
              >
                Bantuan Masuk?
              </button>
            </div>

            {/* Solid Institutional Red Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 sm:py-3 px-4 rounded-lg bg-red-700 hover:bg-red-800 active:bg-red-900 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Masuk ke Sistem</span>
                </>
              )}
            </button>
          </form>

        </div>

        {/* Minimalist Bottom Academic Footer */}
        <div className="text-center mt-5">
          <p className="text-xs text-white/80 font-semibold drop-shadow-xs">
            &copy; 2026 Repositori Karya Ilmiah Kampus
          </p>
          <p className="text-[11px] text-white/60 drop-shadow-xs mt-0.5">
            Sistem Deteksi Kemiripan Tugas Akhir &amp; Seminar Proposal
          </p>
        </div>
      </div>
    </div>
  );
}
