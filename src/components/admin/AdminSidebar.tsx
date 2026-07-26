"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/login/actions";

type Props = {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

export default function AdminSidebar({ mobileOpen, setMobileOpen }: Props) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin", iconSvg: "/icons/dashboard.svg" },
    { label: "Transactions", href: "/admin/pendaftar", iconSvg: "/icons/transactions.svg" },
    { label: "Settings", href: "/admin/konten", iconSvg: "/icons/settings.svg" },
  ];

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const content = (
    <div className="flex h-full flex-col justify-between bg-[#fafafa] dark:bg-[#1c1a2e] p-6 text-[#1b212d] dark:text-white transition-colors">
      <div>
        {/* Brand Logo Maglo. Style */}
        <div className="mb-10 flex items-center justify-between border-b border-slate-200/60 dark:border-[#282541] pb-6">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1b212d] dark:bg-[#c8ee44] font-black text-[#c8ee44] dark:text-[#1b212d] text-base shadow-sm">
              M.
            </div>
            <div>
              <p className="text-xl font-extrabold tracking-tight text-[#1b212d] dark:text-white leading-tight">
                Maglo<span className="text-[#29a073]">.</span>
              </p>
              <p className="text-[11px] font-semibold text-[#929eae]">SPMB SD Plus 3</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-[#282541] md:hidden"
          >
            ✕
          </button>
        </div>

        {/* Navigation Option List Maglo Style */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#c8ee44] text-[#1b212d] font-bold shadow-sm"
                    : "text-[#929eae] hover:bg-slate-200/60 dark:hover:bg-[#282541] hover:text-[#1b212d] dark:hover:text-white"
                }`}
              >
                <Image
                  src={item.iconSvg}
                  alt={item.label}
                  width={20}
                  height={20}
                  className="h-5 w-5 opacity-80"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile & Logout Footer */}
      <div className="border-t border-slate-200/60 dark:border-[#282541] pt-6">
        <div className="mb-4 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-200/80 dark:bg-[#201e34] font-bold text-[#1b212d] dark:text-[#c8ee44] border border-slate-300/60 dark:border-[#282541]">
            P
          </div>
          <div className="overflow-hidden text-xs">
            <p className="truncate font-bold text-[#1b212d] dark:text-white">Panitia SPMB</p>
            <p className="truncate text-[11px] font-medium text-[#929eae]">admin@sdplus3almuhajirin.sch.id</p>
          </div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-[#282541] bg-white dark:bg-[#201e34] px-4 py-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shadow-sm"
          >
            <Image src="/icons/logout.svg" alt="Logout" width={18} height={18} />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200/60 dark:border-[#282541] md:block">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-[#1b212d]/60 backdrop-blur-sm"
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
