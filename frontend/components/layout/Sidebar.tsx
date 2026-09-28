"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import {
  LayoutDashboard,
  UploadCloud,
  History,
  BookOpen,
  HelpCircle,
  Users,
  CheckCircle2,
  Database,
  FileText,
  UserCheck,
  Settings,
  ShieldCheck,
  GraduationCap,
  X,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  UploadCloud,
  History,
  BookOpen,
  HelpCircle,
  Users,
  CheckCircle2,
  Database,
  FileText,
  UserCheck,
  Settings,
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, navigation } = useRole();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header (Height h-16, solid red bg-[#cc1a22], white bold text) */}
        <div className="flex h-16 shrink-0 items-center justify-between bg-[#cc1a22] px-4 text-white shadow-sm">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-white/15 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-wider leading-none">
                PLAGIARISM
              </span>
              <span className="text-xs font-semibold tracking-widest text-red-100 leading-tight">
                CHECKER
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-white/80 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="border-b border-gray-200 bg-gray-50/70 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-700 text-sm font-bold text-white shadow-xs">
              {currentUser.initials}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-gray-800" title={currentUser.name}>
                {currentUser.name}
              </h3>
              <p className="truncate text-xs font-medium text-gray-500">
                {currentUser.identifierType}: {currentUser.identifier}
              </p>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800">
                  <GraduationCap className="h-3 w-3" />
                  {currentUser.roleLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {navigation.map((categoryGroup, index) => (
            <div key={categoryGroup.category} className={index > 0 ? "mt-6" : ""}>
              <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {categoryGroup.category}
              </div>
              <nav className="space-y-1">
                {categoryGroup.items.map((item) => {
                  const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname?.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          onClose();
                        }
                      }}
                      className={`group flex items-center justify-between rounded-r-md px-3 py-2.5 text-xs font-semibold transition-all ${
                        isActive
                          ? "border-l-4 border-red-700 bg-red-50 text-red-700 font-bold"
                          : "border-l-4 border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive
                              ? "text-red-700"
                              : "text-gray-400 group-hover:text-gray-600"
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>


        {/* Bottom Footer Info */}
        <div className="border-t border-gray-200 p-3 bg-white text-center text-[11px] text-gray-400">
          <p className="font-semibold text-gray-500">Portal Plagiarism Checker</p>
          <p className="text-[10px]">Similarity Engine v1.0</p>
        </div>
      </aside>
    </>
  );
}
