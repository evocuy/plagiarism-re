"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useRole();

  useEffect(() => {
    // If authenticated, navigate to dashboard; otherwise navigate to login page
    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
        <span className="text-xs font-semibold text-gray-500">Mengarahkan ke portal...</span>
      </div>
    </div>
  );
}