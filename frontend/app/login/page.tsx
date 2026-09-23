"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { loginApi } from "@/lib/api";
import { useRole } from "@/context/RoleContext";

const roleCopy = {
  mahasiswa: {
    title: "Mahasiswa Bimbingan",
    description: "Unggah dokumen dan pantau hasil pengecekan kemiripan.",
  },
  dosen: {
    title: "Dosen Pembimbing",
    description: "Tinjau dokumen bimbingan dan progres mahasiswa.",
  },
  super_admin: {
    title: "Super Administrator",
    description: "Kelola repositori dan pengaturan sistem secara terkontrol.",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoadingSession, setAuthenticatedUser } = useRole();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoadingSession && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoadingSession, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await loginApi(identifier.trim(), password);
      setAuthenticatedUser(user);
      router.replace("/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login gagal. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingSession || isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-sm text-slate-300">
        Memeriksa sesi aman…
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:p-8 lg:p-12">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-600 p-12 text-white lg:flex lg:flex-col">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-950/40 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">INSTITUT TEKNOLOGI & BISNIS STIKOM BALI</p>
              <p className="text-xs text-blue-100">Sistem Pemeriksaan Kemiripan Dokumen</p>
            </div>
          </div>

          <div className="relative my-auto max-w-md">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Akses Terproteksi</p>
            <h1 className="text-4xl font-bold leading-tight">Pastikan karya akademik tetap orisinal.</h1>
            <p className="mt-5 text-base leading-7 text-blue-100">
              Masuk dengan akun institusi Anda untuk memeriksa kemiripan terhadap repositori internal kampus.
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm font-semibold">Role ditentukan oleh sistem</p>
            <p className="mt-1 text-sm leading-6 text-blue-100">
              Hak akses mahasiswa, dosen pembimbing, dan super administrator diverifikasi setelah autentikasi berhasil.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-6 py-10 sm:px-12">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <ShieldCheck className="h-7 w-7" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-indigo-600">PLAGIARISM CHECKER</p>
            </div>

            <div className="mb-8">
              <p className="text-sm font-semibold text-indigo-600">SELAMAT DATANG</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Masuk ke akun Anda</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Gunakan NIM, NIDN, atau NIP beserta kata sandi akun yang telah terdaftar.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">NIM / NIDN / NIP</span>
                <span className="relative block">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    required
                    autoComplete="username"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="Masukkan identitas akun"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Kata Sandi</span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    required
                    minLength={1}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-indigo-400"
              >
                {isSubmitting ? "Memverifikasi akun…" : "Masuk ke Sistem"}
                {!isSubmitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </button>
            </form>

            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Akses Berdasarkan Peran</p>
              <div className="mt-3 space-y-2">
                {Object.values(roleCopy).map((role) => (
                  <div key={role.title}>
                    <p className="text-sm font-semibold text-slate-700">{role.title}</p>
                    <p className="text-xs leading-5 text-slate-500">{role.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-7 text-center text-xs leading-5 text-slate-500">
              Mengalami kendala? Hubungi administrator sistem kampus.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}