"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/login/actions";

type Props = {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

export default function AdminSidebar({ mobileOpen, setMobileOpen }: Props) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dasbor Utama", href: "/admin", icon: "📊" },
    { label: "Data Pendaftar", href: "/admin/pendaftar", icon: "👥" },
    { label: "Konten Landing", href: "/admin/konten", icon: "📝" },
  ];

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const content = (
    <div className="flex h-full flex-col justify-between bg-slate-900 p-4 text-slate-100">
      <div>
        {/* Brand Header */}
        <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white shadow-md">
              SD3
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-white">SPMB Console</p>
              <p className="text-xs text-slate-400">SD Plus 3 Al-Muhajirin</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 md:hidden"
          >
            ✕
          </button>
        </div>

        {/* Navigation Menu */}
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menu Panitia
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-emerald-600 font-semibold text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile & Logout */}
      <div className="border-t border-slate-800 pt-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 font-semibold text-emerald-400">
            P
          </div>
          <div className="overflow-hidden text-xs">
            <p className="truncate font-semibold text-slate-200">Panitia SPMB</p>
            <p className="truncate text-slate-400">admin@sdplus3almuhajirin.sch.id</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-800/40 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
          >
            <span>🚪</span>
            <span>Keluar Sesi</span>
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 md:block">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[80vw] h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
