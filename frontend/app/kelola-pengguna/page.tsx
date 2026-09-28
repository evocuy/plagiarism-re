"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  UserCheck,
  UserPlus,
  Search,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Shield,
  GraduationCap,
  Briefcase,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { getAllUsersApi, createUserApi, deleteUserApi, listDosenApi, ApiUser, CreateUserData, DosenListItem, Role } from "@/lib/api";
import { useRole } from "@/context/RoleContext";

export default function KelolaPenggunaPage() {
  const { rawUser } = useRole();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("Semua");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [dosenList, setDosenList] = useState<DosenListItem[]>([]);

  // Form Fields
  const [formData, setFormData] = useState<CreateUserData>({
    identifier: "",
    name: "",
    email: "",
    password: "",
    role: "mahasiswa",
    program_studi: "Teknik Informatika",
    fakultas: "Fakultas Ilmu Komputer",
    dosen_pembimbing_id: null,
    angkatan: "",
    gelar: "",
    keahlian: "",
  });

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getAllUsersApi();
      setUsers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat data pengguna.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    getAllUsersApi()
      .then((data) => {
        if (!ignore) setUsers(data);
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Gagal memuat data pengguna.";
          setErrorMessage(msg);
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await createUserApi(formData);
      setSuccessMessage(`Pengguna '${formData.name}' berhasil didaftarkan sebagai ${formData.role.toUpperCase()}!`);
      setIsModalOpen(false);
      setFormData({
        identifier: "",
        name: "",
        email: "",
        password: "",
        role: "mahasiswa",
        program_studi: "Teknik Informatika",
        fakultas: "Fakultas Ilmu Komputer",
        dosen_pembimbing_id: null,
        angkatan: "",
        gelar: "",
        keahlian: "",
      });
      await loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menambahkan pengguna baru.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    try {
      const list = await listDosenApi();
      setDosenList(list);
    } catch {
      // Abaikan jika gagal, dropdown akan kosong
    }
  };

  const handleDeleteUser = async (user: ApiUser) => {
    if (user.id === rawUser?.id) {
      alert("Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!");
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus akun '${user.name}' (${user.identifier})?`)) {
      return;
    }

    try {
      await deleteUserApi(user.id);
      setSuccessMessage(`Pengguna '${user.name}' berhasil dihapus.`);
      await loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus pengguna.";
      setErrorMessage(msg);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole =
      selectedRoleFilter === "Semua" ||
      u.role.toLowerCase() === selectedRoleFilter.toLowerCase() ||
      (selectedRoleFilter.toLowerCase() === "admin" && (u.role as string) === "super_admin");
    return matchSearch && matchRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "mahasiswa":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
            <GraduationCap className="h-3 w-3" />
            <span>Mahasiswa</span>
          </span>
        );
      case "dosen":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
            <Briefcase className="h-3 w-3" />
            <span>Dosen</span>
          </span>
        );
      case "admin":
      case "super_admin":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
            <Shield className="h-3 w-3" />
            <span>Administrator</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
            {role}
          </span>
        );
    }
  };

  return (
    <DashboardLayout title="Kelola Pengguna">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Kelola Pengguna Sistem
              </h2>
              <p className="text-xs text-gray-500">
                Administrator dapat mendaftarkan akun baru untuk Mahasiswa, Dosen, atau Admin lainnya.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadUsers}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-red-600" : ""}`} />
              <span>Muat Ulang</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormError(null);
                handleOpenModal();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Tambah Pengguna</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800 shadow-xs">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Terjadi Kesalahan</p>
              <p className="mt-0.5 text-red-700">{errorMessage}</p>
            </div>
            <button type="button" onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 p-4 text-xs font-medium text-green-800 shadow-xs">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Sukses</p>
              <p className="mt-0.5 text-green-700">{successMessage}</p>
            </div>
            <button type="button" onClick={() => setSuccessMessage(null)} className="text-green-500 hover:text-green-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, NIM/NIDN/NIP, atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-red-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="w-full md:w-44 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
              >
                <option value="Semua">Semua Peran</option>
                <option value="mahasiswa">Mahasiswa</option>
                <option value="dosen">Dosen</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-gray-500 space-y-3">
              <RefreshCw className="h-6 w-6 animate-spin text-red-600 mx-auto" />
              <p>Memuat data pengguna dari database PostgreSQL...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400">
              <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-600">Tidak ada data pengguna yang sesuai.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      ID
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Pengguna
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Peran (Role)
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Email
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Program Studi / Info Profil
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-gray-400">
                        #{user.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{user.name}</div>
                        <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                          {user.identifier}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-4 py-4 text-gray-600 font-mono">
                        {user.email}
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        {user.role === "mahasiswa" && user.mahasiswa_profile ? (
                          <>
                            <div className="font-medium text-gray-700">{user.mahasiswa_profile.program_studi || "-"}</div>
                            <div className="text-[10px] text-gray-400">{user.mahasiswa_profile.fakultas || ""}</div>
                            {user.mahasiswa_profile.dosen_pembimbing_nama && (
                              <div className="text-[10px] text-emerald-600 mt-0.5">
                                Pembimbing: {user.mahasiswa_profile.dosen_pembimbing_nama}
                              </div>
                            )}
                            {user.mahasiswa_profile.angkatan && (
                              <div className="text-[10px] text-gray-400">Angkatan {user.mahasiswa_profile.angkatan}</div>
                            )}
                          </>
                        ) : user.role === "dosen" && user.dosen_profile ? (
                          <>
                            <div className="font-medium text-gray-700">{user.dosen_profile.program_studi || "-"}</div>
                            <div className="text-[10px] text-gray-400">{user.dosen_profile.fakultas || ""}</div>
                            {user.dosen_profile.keahlian && (
                              <div className="text-[10px] text-blue-600 mt-0.5">Keahlian: {user.dosen_profile.keahlian}</div>
                            )}
                          </>
                        ) : (
                          <>
                            <div>{user.program_studi || "-"}</div>
                            <div className="text-[10px] text-gray-400">{user.fakultas || ""}</div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.id === rawUser?.id}
                          className="inline-flex items-center gap-1 rounded bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Hapus</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-gray-200 bg-gray-50/50 px-6 py-3 text-xs text-gray-500 flex items-center justify-between">
                <span>Total Pengguna: <strong className="text-gray-800">{filteredUsers.length}</strong></span>
                <span className="text-[11px] text-gray-400">Sinkronisasi langsung dengan database PostgreSQL</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah Pengguna Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-700">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Tambah Akun Pengguna</h3>
                  <p className="text-xs text-gray-500">Buat identitas akun untuk login ke sistem</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Peran Pengguna (Role) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["mahasiswa", "dosen", "admin"] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r })}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold capitalize transition-all cursor-pointer ${
                        formData.role === r
                          ? "border-red-600 bg-red-50 text-red-700 ring-1 ring-red-600"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {r === "mahasiswa" ? (
                        <GraduationCap className="h-4 w-4 mb-1" />
                      ) : r === "dosen" ? (
                        <Briefcase className="h-4 w-4 mb-1" />
                      ) : (
                        <Shield className="h-4 w-4 mb-1" />
                      )}
                      <span>{r}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Identifier */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {formData.role === "mahasiswa"
                    ? "Nomor Induk Mahasiswa (NIM)"
                    : formData.role === "dosen"
                    ? "Nomor Induk Dosen Nasional (NIDN)"
                    : "Nomor Induk Pegawai (NIP) / User ID"} *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    placeholder={formData.role === "mahasiswa" ? "20210801199" : formData.role === "dosen" ? "0412089901" : "198901012015011001"}
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso, S.Kom."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Alamat Email Kampus *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@univ.ac.id"
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Kata Sandi Sementara *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Program Studi & Fakultas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Program Studi
                  </label>
                  <input
                    type="text"
                    value={formData.program_studi || ""}
                    onChange={(e) => setFormData({ ...formData, program_studi: e.target.value })}
                    placeholder="Teknik Informatika"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Fakultas
                  </label>
                  <input
                    type="text"
                    value={formData.fakultas || ""}
                    onChange={(e) => setFormData({ ...formData, fakultas: e.target.value })}
                    placeholder="Fakultas Ilmu Komputer"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Field khusus Dosen */}
              {formData.role === "dosen" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-dashed border-gray-200 pt-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Gelar Akademik</label>
                    <input
                      type="text"
                      value={formData.gelar || ""}
                      onChange={(e) => setFormData({ ...formData, gelar: e.target.value })}
                      placeholder="Dr. / M.Kom."
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Keahlian</label>
                    <input
                      type="text"
                      value={formData.keahlian || ""}
                      onChange={(e) => setFormData({ ...formData, keahlian: e.target.value })}
                      placeholder="Machine Learning, NLP..."
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                </div>
              )}

              {/* Field khusus Mahasiswa */}
              {formData.role === "mahasiswa" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-dashed border-gray-200 pt-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Angkatan</label>
                    <input
                      type="text"
                      value={formData.angkatan || ""}
                      onChange={(e) => setFormData({ ...formData, angkatan: e.target.value })}
                      placeholder="2021"
                      maxLength={4}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Dosen Pembimbing</label>
                    <select
                      value={formData.dosen_pembimbing_id ?? ""}
                      onChange={(e) => setFormData({ ...formData, dosen_pembimbing_id: e.target.value ? Number(e.target.value) : null })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600"
                    >
                      <option value="">— Belum ditentukan —</option>
                      {dosenList.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nama_lengkap} ({d.nidn})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Daftarkan Pengguna</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
