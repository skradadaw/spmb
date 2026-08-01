"use client";

import { useEffect, useRef, type RefObject } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/login/actions";
import AdminIcon, { type AdminIconName } from "./AdminIcon";
import { adminDangerButtonCls } from "./styles";

type Props = {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  menuTriggerRef: RefObject<HTMLButtonElement | null>;
};

const navItems: { label: string; href: string; icon: AdminIconName }[] = [
  { label: "Dasbor", href: "/admin", icon: "dashboard" },
  { label: "Pendaftar", href: "/admin/pendaftar", icon: "users" },
  { label: "Kelola Konten", href: "/admin/konten", icon: "content" },
];

export default function AdminSidebar({ mobileOpen, setMobileOpen, menuTriggerRef }: Props) {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const wasMobileOpenRef = useRef(false);

  useEffect(() => {
    const desktopMediaQuery = window.matchMedia("(min-width: 768px)");

    if (!mobileOpen) {
      if (wasMobileOpenRef.current && !desktopMediaQuery.matches) menuTriggerRef.current?.focus();
      wasMobileOpenRef.current = false;
      return;
    }

    if (desktopMediaQuery.matches) {
      setMobileOpen(false);
      return;
    }

    closeButtonRef.current?.focus();
    wasMobileOpenRef.current = true;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const drawer = drawerRef.current;
      if (!drawer) return;

      const focusableElements = Array.from(
        drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      );
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements.at(-1);

      if (!firstFocusableElement || !lastFocusableElement) return;

      if (!drawer.contains(document.activeElement)) {
        event.preventDefault();
        firstFocusableElement.focus();
      } else if (event.shiftKey && document.activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    }

    function handleDesktopBreakpoint(event: MediaQueryListEvent) {
      if (event.matches) setMobileOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    desktopMediaQuery.addEventListener("change", handleDesktopBreakpoint);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      desktopMediaQuery.removeEventListener("change", handleDesktopBreakpoint);
    };
  }, [menuTriggerRef, mobileOpen, setMobileOpen]);

  function isActive(href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  const navigation = (
    <div className="flex h-full flex-col bg-white p-5 text-[#101820] sm:p-6">
      <div>
        <div className="mb-8 flex items-start justify-between border-b border-slate-200 pb-5">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00AA13] text-sm font-extrabold text-white shadow-sm">
              S3
            </div>
            <div>
              <p className="admin-display text-sm font-bold tracking-tight">SPMB SD Plus 3</p>
              <p className="mt-0.5 text-xs text-[#667085]">Tahun Ajaran 2027/2028</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="-mr-2 -mt-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#667085] hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-[#00AA13]/15 md:hidden"
            aria-label="Tutup menu navigasi"
            ref={closeButtonRef}
          >
            <AdminIcon name="close" className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Navigasi utama" className="space-y-1.5">
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-[#00AA13]/15 ${
                  active
                    ? "bg-[#00AA13] text-white shadow-sm"
                    : "text-[#667085] hover:bg-green-50 hover:text-[#00880F]"
                }`}
              >
                <AdminIcon name={item.icon} className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <form action={logout} className="mt-auto border-t border-slate-200 pt-5">
        <button type="submit" className={`${adminDangerButtonCls} w-full`}>
          <AdminIcon name="logout" className="h-5 w-5" />
          Keluar
        </button>
      </form>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[260px] shrink-0 border-r border-slate-200 bg-white md:block">
        {navigation}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Tutup menu navigasi"
            className="absolute inset-0 bg-[#101820]/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            aria-label="Menu navigasi"
            aria-modal="true"
            className="relative h-full w-[260px] max-w-[85vw] shadow-xl"
            id="admin-mobile-navigation"
            ref={drawerRef}
            role="dialog"
          >
            {navigation}
          </aside>
        </div>
      )}
    </>
  );
}
