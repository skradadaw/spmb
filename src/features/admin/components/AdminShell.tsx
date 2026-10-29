'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { AdminMobileMenu } from './AdminMobileMenu';
import type { AdminSection } from './AdminNavigation';

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed';
const SIDEBAR_PREFERENCE_EVENT = 'admin-sidebar-preference';
/** The sidebar starts hidden until the admin expands it, so the first login opens on the full-width content. */
let fallbackSidebarCollapsed = true;

function subscribeToSidebarPreference(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(SIDEBAR_PREFERENCE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(SIDEBAR_PREFERENCE_EVENT, onChange);
  };
}

function toggleSidebarPreference() {
  const collapsed = getSidebarPreference();
  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!collapsed));
  } catch {
    fallbackSidebarCollapsed = !collapsed;
  }
  window.dispatchEvent(new Event(SIDEBAR_PREFERENCE_EVENT));
}

function getSidebarPreference() {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) !== 'false';
  } catch {
    return fallbackSidebarCollapsed;
  }
}

export function AdminShell({ active, children }: { active?: AdminSection; children: React.ReactNode }) {
  const pathname = usePathname();
  const activeSection: AdminSection = active ?? (pathname.startsWith('/admin/pendaftar') ? 'participants' : pathname.startsWith('/admin/kuota') ? 'capacity' : pathname.startsWith('/admin/scan') ? 'attendance' : pathname.startsWith('/admin/pengumuman') ? 'announcement' : 'summary');
  const sidebarCollapsed = useSyncExternalStore(subscribeToSidebarPreference, getSidebarPreference, () => true);

  // Ctrl/Cmd+B, the usual shortcut for showing and hiding a sidebar.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== 'b' || !(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
      event.preventDefault();
      toggleSidebarPreference();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return <div className="min-h-screen bg-[var(--admin-canvas)] text-foreground">
    <DashboardSidebar active={activeSection} collapsed={sidebarCollapsed} onToggle={toggleSidebarPreference} />
    <main data-testid="admin-content" data-sidebar-state={sidebarCollapsed ? 'collapsed' : 'expanded'} className={`min-w-0 transition-[padding] duration-200 ease-in-out motion-reduce:transition-none ${sidebarCollapsed ? 'lg:pl-14' : 'lg:pl-[288px]'}`}>
      <header className="sticky top-0 z-40 flex h-[68px] items-center border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 sm:px-6 lg:hidden">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3"><Image src="/logo.png" alt="Logo SD Plus 3 Al-Muhajirin" width={42} height={42} className="h-[42px] w-[42px] shrink-0 object-contain" /><div className="min-w-0"><p className="truncate text-xs font-extrabold uppercase">SD Plus 3 Al-Muhajirin</p><p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--admin-sidebar)]">Admin SPMB</p></div></div>
          <AdminMobileMenu active={activeSection} />
        </div>
      </header>
      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 xl:px-10">{children}</div>
    </main>
  </div>;
}
