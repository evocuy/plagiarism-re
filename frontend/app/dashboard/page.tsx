"use client";

import React from "react";
import { useRole } from "@/context/RoleContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MahasiswaDashboard from "@/components/dashboard/MahasiswaDashboard";
import DosenDashboard from "@/components/dashboard/DosenDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const { currentRole } = useRole();

  return (
    <DashboardLayout title="Dashboard">
      {currentRole === "mahasiswa" && <MahasiswaDashboard />}
      {currentRole === "dosen" && <DosenDashboard />}
      {currentRole === "admin" && <AdminDashboard />}
    </DashboardLayout>
  );
}
