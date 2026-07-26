"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

type Props = {
  setMobileOpen: (open: boolean) => void;
  pendingCount?: number;
};

export default function AdminHeader({ setMobileOpen, pendingCount = 0 }: Props) {
  const pathname = usePathname();

  function getTitle() {
    if (pathname === "/admin") return "Dashboard";
    if (pathname.startsWith("/admin/pendaftar/export")) return "Export Excel";
    if (pathname.startsWith("/admin/pendaftar/")) return "Transactions Detail";
    if (pathname.startsWith("/admin/pendaftar")) return "Transactions";
    if (pathname.startsWith("/admin/konten")) return "Settings";
    return "Dashboard";
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/60 dark:border-[#282541] bg-[#fafafa]/90 dark:bg-[#1c1a2e]/90 px-6 backdrop-blur-md transition-colors">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 dark:border-[#282541] bg-white dark:bg-[#201e34] text-[#1b212d] dark:text-white hover:bg-slate-100 dark:hover:bg-[#282541] md:hidden font-bold"
          aria-label="Buka Menu Navigasi"
        >
          ☰
        </button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1b212d] dark:text-white">{getTitle()}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Icon Pill */}
        <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-[#201e34] text-slate-500 shadow-sm border border-slate-200/60 dark:border-[#282541]">
          🔍
        </div>

        {/* Bell Notification Bing */}
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-[#201e34] text-slate-500 shadow-sm border border-slate-200/60 dark:border-[#282541]">
          🔔
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#29a073] text-[9px] font-bold text-white">
              {pendingCount}
            </span>
          )}
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Profile Pill (Name/Avater) */}
        <div className="flex items-center gap-2.5 rounded-full bg-white dark:bg-[#201e34] p-1.5 pr-4 border border-slate-200/60 dark:border-[#282541] shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1b212d] dark:bg-[#c8ee44] text-[#c8ee44] dark:text-[#1b212d] font-bold text-xs">
            M
          </div>
          <span className="hidden text-xs font-semibold text-[#1b212d] dark:text-white sm:inline">
            Mahfuzul Nabil
          </span>
          <span className="text-[10px] text-slate-400">▼</span>
        </div>
      </div>
    </header>
  );
}
