"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Buka Menu Navigasi"
        >
          ☰
        </button>

        <div>
          <h1 className="text-base font-bold text-slate-900 sm:text-lg">{getTitle()}</h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            Sistem Penerimaan Murid Baru TA 2027/2028
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {pendingCount > 0 && (
          <Link
            href="/admin/pendaftar?verifikasi=menunggu"
            className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{pendingCount} Verifikasi Menunggu</span>
          </Link>
        )}

        <Link
          href="/"
          target="_blank"
          className="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 sm:flex sm:items-center sm:gap-1.5"
        >
          <span>🌐</span>
          <span>Lihat Situs Publik</span>
        </Link>
      </div>
    </header>
  );
}
