import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutAdminAction } from '@/features/auth/logout-action';
import { DashboardSidebar } from './DashboardSidebar';
import { AdminNavigation, type AdminSection } from './AdminNavigation';
export function AdminShell({ active = 'summary', children }: { active?: AdminSection; children: React.ReactNode }) {
  return <div className="min-h-screen bg-[var(--admin-canvas)] text-foreground">
    <DashboardSidebar active={active} />
    <main className="min-w-0 lg:pl-[272px]">
      <header className="border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 sm:px-6 lg:hidden">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3"><Image src="/logo.png" alt="Logo SD Plus 3 Al-Muhajirin" width={42} height={42} className="h-[42px] w-[42px] shrink-0 object-contain" /><div className="min-w-0"><p className="truncate text-xs font-bold">SD Plus 3 Al-Muhajirin</p><p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--admin-sidebar)]">Admin SPMB</p></div></div>
            <form action={logoutAdminAction}><Button type="submit" variant="ghost" size="icon" aria-label="Keluar dari panel admin"><LogOut aria-hidden="true" className="h-[18px] w-[18px]" /></Button></form>
          </div>
          <AdminNavigation active={active} mobile />
        </div>
      </header>
      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 xl:px-10">{children}</div>
    </main>
  </div>;
}
