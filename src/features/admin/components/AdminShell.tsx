'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutAdminAction } from '@/features/auth/logout-action';
import { DashboardSidebar } from './DashboardSidebar';
import { AdminNavigation, type AdminSection } from './AdminNavigation';

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed';
const SIDEBAR_PREFERENCE_EVENT = 'admin-sidebar-preference';
let fallbackSidebarCollapsed = false;

function subscribeToSidebarPreference(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(SIDEBAR_PREFERENCE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(SIDEBAR_PREFERENCE_EVENT, onChange);
  };
}

function getSidebarPreference() {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    return fallbackSidebarCollapsed;
  }
}

export function AdminShell({ active, children }: { active?: AdminSection; children: React.ReactNode }) {
  const pathname = usePathname();
  const activeSection: AdminSection = active ?? (pathname.startsWith('/admin/pendaftar') ? 'participants' : pathname.startsWith('/admin/kuota') ? 'capacity' : 'summary');
  const sidebarCollapsed = useSyncExternalStore(subscribeToSidebarPreference, getSidebarPreference, () => false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function toggleSidebar() {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!sidebarCollapsed));
    } catch {
      fallbackSidebarCollapsed = !sidebarCollapsed;
    }
    window.dispatchEvent(new Event(SIDEBAR_PREFERENCE_EVENT));
  }

  return <div className="min-h-screen bg-[var(--admin-canvas)] text-foreground">
    <DashboardSidebar active={activeSection} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
    <main data-testid="admin-content" data-sidebar-state={sidebarCollapsed ? 'mini' : 'expanded'} className={`min-w-0 transition-[padding] duration-200 ease-in-out motion-reduce:transition-none ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[272px]'}`}>
      <header className="border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 sm:px-6 lg:hidden">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3"><Image src="/logo.png" alt="Logo SD Plus 3 Al-Muhajirin" width={42} height={42} className="h-[42px] w-[42px] shrink-0 object-contain" /><div className="min-w-0"><p className="truncate text-xs font-bold">SD Plus 3 Al-Muhajirin</p><p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--admin-sidebar)]">Admin SPMB</p></div></div>
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon" aria-label={mobileMenuOpen ? 'Tutup menu admin' : 'Buka menu admin'} aria-expanded={mobileMenuOpen} aria-controls={mobileMenuOpen ? 'admin-mobile-navigation' : undefined} onClick={() => setMobileMenuOpen(open => !open)} className="size-10">
                {mobileMenuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
              </Button>
              <form action={logoutAdminAction}><Button type="submit" variant="ghost" size="icon" aria-label="Keluar dari panel admin" className="size-10"><LogOut aria-hidden="true" className="h-[18px] w-[18px]" /></Button></form>
            </div>
          </div>
          {mobileMenuOpen && <div id="admin-mobile-navigation" className="mt-3 rounded-2xl border border-[var(--admin-border)] bg-white p-2 shadow-lg shadow-slate-950/10"><AdminNavigation active={activeSection} mobile onNavigate={() => setMobileMenuOpen(false)} /></div>}
        </div>
      </header>
      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 xl:px-10">{children}</div>
    </main>
  </div>;
}
