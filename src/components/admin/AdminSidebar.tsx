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
    <div className="flex h-full flex-col justify-between bg-white dark:bg-[#1c1a2e] p-6 text-[#1c1a2e] dark:text-white transition-colors">
      <div>
        {/* Brand Header Maglo Style */}
        <div className="mb-8 flex items-center justify-between border-b border-slate-100 dark:border-[#282541] pb-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1c1a2e] dark:bg-[#c8ee44] font-black text-[#c8ee44] dark:text-[#1c1a2e] shadow-md text-base">
              M.
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-[#1c1a2e] dark:text-white leading-tight">SPMB Console</p>
              <p className="text-[11px] font-semibold text-slate-400">SD Plus 3 Al-Muhajirin</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#282541] md:hidden"
          >
            ✕
          </button>
        </div>

        {/* Navigation Menu Maglo Style */}
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </p>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-xs font-bold transition-all ${
                  active
                    ? "bg-[#c8ee44] text-[#1c1a2e] font-extrabold shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#282541] hover:text-[#1c1a2e] dark:hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile & Logout Footer */}
      <div className="border-t border-slate-100 dark:border-[#282541] pt-6">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-[#201e34] font-bold text-[#1c1a2e] dark:text-[#c8ee44] border border-slate-200/80 dark:border-[#282541]">
            P
          </div>
          <div className="overflow-hidden text-xs">
            <p className="truncate font-extrabold text-[#1c1a2e] dark:text-white">Panitia SPMB</p>
            <p className="truncate text-[11px] text-slate-400 font-medium">admin@sdplus3almuhajirin.sch.id</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-[#282541] bg-slate-50 dark:bg-[#201e34] px-4 py-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
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
      <aside className="hidden w-64 shrink-0 border-r border-slate-100 dark:border-[#282541] md:block">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#1c1a2e]/60 backdrop-blur-sm"
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
