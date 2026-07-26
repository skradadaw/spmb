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
    if (pathname === "/admin") return "Dasbor Utama";
    if (pathname.startsWith("/admin/pendaftar/export")) return "Export Data Excel";
    if (pathname.startsWith("/admin/pendaftar/")) return "Detail Pendaftar";
    if (pathname.startsWith("/admin/pendaftar")) return "Data Pendaftar";
    if (pathname.startsWith("/admin/konten")) return "Editor Konten Landing";
    return "Konsol Admin";
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 dark:border-[#282541] bg-white/90 dark:bg-[#1c1a2e]/90 px-6 backdrop-blur-md transition-colors">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 dark:border-[#282541] bg-slate-50 dark:bg-[#201e34] text-[#1c1a2e] dark:text-white hover:bg-slate-100 dark:hover:bg-[#282541] md:hidden font-bold"
          aria-label="Buka Menu Navigasi"
        >
          ☰
        </button>

        <div>
          <h1 className="text-lg font-black tracking-tight text-[#1c1a2e] dark:text-white sm:text-xl">{getTitle()}</h1>
          <p className="hidden text-xs font-medium text-slate-400 dark:text-slate-400 sm:block">
            Sistem Penerimaan Murid Baru SD Plus 3 Al-Muhajirin TA 2027/2028
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <ThemeToggle />

        {pendingCount > 0 && (
          <Link
            href="/admin/pendaftar?verifikasi=menunggu"
            className="flex items-center gap-2 rounded-2xl bg-[#c8ee44]/30 dark:bg-[#c8ee44]/20 px-4 py-2 text-xs font-bold text-[#1c1a2e] dark:text-[#c8ee44] border border-[#c8ee44] hover:bg-[#c8ee44]/50 transition-colors"
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#1c1a2e] dark:bg-[#c8ee44] animate-pulse" />
            <span>{pendingCount} Verifikasi Menunggu</span>
          </Link>
        )}

        <Link
          href="/"
          target="_blank"
          className="hidden rounded-2xl border border-slate-200 dark:border-[#282541] bg-slate-50 dark:bg-[#201e34] px-4 py-2 text-xs font-bold text-[#1c1a2e] dark:text-white hover:bg-slate-100 dark:hover:bg-[#282541] sm:flex sm:items-center sm:gap-2 transition-colors"
        >
          <span>🌐</span>
          <span>Situs Publik</span>
        </Link>
      </div>
    </header>
  );
}
