"use client";

import type { RefObject } from "react";
import { usePathname } from "next/navigation";
import AdminIcon from "./AdminIcon";

type Props = {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  menuTriggerRef: RefObject<HTMLButtonElement | null>;
};

export default function AdminHeader({ mobileOpen, setMobileOpen, menuTriggerRef }: Props) {
  const pathname = usePathname();

  function getTitle() {
    if (pathname === "/admin") return "Dasbor";
    if (pathname.startsWith("/admin/pendaftar/export")) return "Export Data";
    if (pathname.startsWith("/admin/pendaftar/")) return "Detail Pendaftar";
    if (pathname.startsWith("/admin/pendaftar")) return "Daftar Pendaftar";
    if (pathname.startsWith("/admin/konten")) return "Kelola Konten";
    return "Dasbor";
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-[#F6F7F5]/95 px-4 backdrop-blur sm:h-20 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          ref={menuTriggerRef}
          aria-controls="admin-mobile-navigation"
          aria-expanded={mobileOpen}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-[#101820] hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#00AA13]/15 md:hidden"
          aria-label="Buka menu navigasi"
        >
          <AdminIcon name="menu" className="h-5 w-5" />
        </button>
        <h1 className="admin-display text-xl font-bold tracking-tight sm:text-2xl">{getTitle()}</h1>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold shadow-[0_1px_2px_rgba(16,24,32,0.04)]">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-[#00880F]">
          PS
        </span>
        <span>Panitia SPMB</span>
      </div>
    </header>
  );
}
