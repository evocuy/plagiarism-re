"use client";

import { FormEvent, useState } from "react";
import { ShieldAlert, UserPlus, UsersRound } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useRole } from "@/context/RoleContext";
import { createManagedUserApi, type AuthRole } from "@/lib/api";

type ManagedRole = Extract<AuthRole, "mahasiswa" | "dosen">;

const initialForm = {
    identifier: "",
    name: "",
    email: "",
    password: "",
    role: "mahasiswa" as ManagedRole,
    program_studi: "",
    fakultas: "",
};

export default function KelolaPenggunaPage() {
    const { currentRole, isLoadingSession } = useRole();
    const [form, setForm] = useState(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    function updateField(field: keyof typeof initialForm, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage(null);
        setError(null);
        setIsSubmitting(true);

        try {
            const user = await createManagedUserApi({
                ...form,
                identifier: form.identifier.trim(),
                name: form.name.trim(),
                email: form.email.trim(),
                program_studi: form.program_studi.trim() || undefined,
                fakultas: form.fakultas.trim() || undefined,
            });
            setMessage(`Akun ${user.role === "mahasiswa" ? "mahasiswa" : "dosen pembimbing"} untuk ${user.name} berhasil dibuat.`);
            setForm(initialForm);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Akun tidak dapat dibuat.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <DashboardLayout title="Kelola Pengguna">
            {isLoadingSession ? (
                <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
                    Memverifikasi akses…
                </div>
            ) : currentRole !== "super_admin" ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800 shadow-sm">
                    <div className="flex items-center gap-2 font-semibold">
                        <ShieldAlert className="h-5 w-5" />
                        Akses ditolak
                    </div>
                    <p className="mt-2">Halaman ini hanya tersedia untuk Super Administrator.</p>
                </div>
            ) : (
                <div className="mx-auto max-w-3xl space-y-6">
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-red-50 p-2.5 text-red-700">
                                <UsersRound className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Buat Akun Pengguna</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Tambahkan akun mahasiswa atau dosen pembimbing. Kata sandi disimpan aman sebagai hash pada backend.
                                </p>
                            </div>
                        </div>
                    </section>

                    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Peran
                                <select
                                    value={form.role}
                                    onChange={(event) => updateField("role", event.target.value)}
                                    className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                >
                                    <option value="mahasiswa">Mahasiswa</option>
                                    <option value="dosen">Dosen Pembimbing</option>
                                </select>
                            </label>

                            <label className="block text-sm font-medium text-gray-700">
                                {form.role === "mahasiswa" ? "NIM" : "NIDN"}
                                <input
                                    required
                                    maxLength={100}
                                    value={form.identifier}
                                    onChange={(event) => updateField("identifier", event.target.value)}
                                    placeholder={form.role === "mahasiswa" ? "Contoh: 2301010001" : "Contoh: 0012345678"}
                                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />
                            </label>

                            <label className="block text-sm font-medium text-gray-700">
                                Nama lengkap
                                <input
                                    required
                                    maxLength={255}
                                    value={form.name}
                                    onChange={(event) => updateField("name", event.target.value)}
                                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />
                            </label>

                            <label className="block text-sm font-medium text-gray-700">
                                Email
                                <input
                                    required
                                    type="email"
                                    maxLength={255}
                                    value={form.email}
                                    onChange={(event) => updateField("email", event.target.value)}
                                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />
                            </label>

                            <label className="block text-sm font-medium text-gray-700">
                                Program studi <span className="font-normal text-gray-400">(opsional)</span>
                                <input
                                    maxLength={255}
                                    value={form.program_studi}
                                    onChange={(event) => updateField("program_studi", event.target.value)}
                                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />
                            </label>

                            <label className="block text-sm font-medium text-gray-700">
                                Fakultas <span className="font-normal text-gray-400">(opsional)</span>
                                <input
                                    maxLength={255}
                                    value={form.fakultas}
                                    onChange={(event) => updateField("fakultas", event.target.value)}
                                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />
                            </label>

                            <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
                                Kata sandi awal
                                <input
                                    required
                                    type="password"
                                    minLength={8}
                                    maxLength={256}
                                    value={form.password}
                                    onChange={(event) => updateField("password", event.target.value)}
                                    placeholder="Minimal 8 karakter"
                                    className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />
                            </label>
                        </div>

                        {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                        {message && <p role="status" className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}

                        <div className="mt-6 flex justify-end border-t border-gray-100 pt-5">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"
                            >
                                <UserPlus className="h-4 w-4" />
                                {isSubmitting ? "Membuat akun…" : "Buat Akun"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
}