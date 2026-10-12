import Image from 'next/image';
import { AdminNavigation, type AdminSection } from './AdminNavigation';
import { LogOut, PanelLeftClose, PanelLeftOpen, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { logoutAdminAction } from '@/features/auth/logout-action';

export function DashboardSidebar({ active = 'summary', collapsed = false, onToggle }: { active?: AdminSection; collapsed?: boolean; onToggle?: () => void }) {
  return (
    <aside id="admin-sidebar" data-testid="admin-sidebar" data-state={collapsed ? 'mini' : 'expanded'} className={`fixed inset-y-0 left-0 z-20 hidden flex-col overflow-hidden bg-[var(--admin-sidebar)] text-white transition-[width] duration-200 ease-in-out motion-reduce:transition-none lg:flex ${collapsed ? 'w-20' : 'w-[272px]'}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_20%_10%,rgba(57,209,85,0.32),transparent_35%),linear-gradient(145deg,transparent_50%,rgba(255,255,255,0.05))]" />
      <div className={`relative flex h-full flex-col py-6 ${collapsed ? 'px-3' : 'px-5'}`}>
        <div className={`flex items-center transition-[gap,padding] duration-200 ease-in-out motion-reduce:transition-none ${collapsed ? 'justify-center gap-0 px-0' : 'gap-3 px-2'}`}>
          <Image src="/logo.png" alt="Logo SD Plus 3 Al-Muhajirin" width={52} height={52} className="size-11 shrink-0 object-contain drop-shadow-[0_5px_9px_rgba(0,0,0,0.24)]" priority />
          <div aria-hidden={collapsed} className={`min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out motion-reduce:transition-none ${collapsed ? 'max-w-0 opacity-0' : 'max-w-48 opacity-100'}`}>
            <p className="truncate text-sm font-bold tracking-[-0.02em]">SD Plus 3 Al-Muhajirin</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-200">Panel Administrasi SPMB</p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label={collapsed ? 'Perluas sidebar' : 'Minimalkan sidebar'} aria-expanded={!collapsed} aria-controls="admin-sidebar" onClick={onToggle} title={collapsed ? 'Perluas sidebar' : 'Minimalkan sidebar'} className={`mt-4 size-10 text-emerald-100 hover:bg-white/12 hover:text-white ${collapsed ? 'self-center' : 'self-end'}`}>
          {collapsed ? <PanelLeftOpen aria-hidden="true" className="size-[18px]" /> : <PanelLeftClose aria-hidden="true" className="size-[18px]" />}
        </Button>
        <Separator decorative className="my-4 bg-white/12" />
        <div aria-hidden={collapsed} className={`overflow-hidden px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/70 transition-[max-height,opacity] duration-200 ease-in-out motion-reduce:transition-none ${collapsed ? 'max-h-0 opacity-0' : 'max-h-5 opacity-100'}`}>Menu utama</div>
        <AdminNavigation active={active} collapsed={collapsed} />
        <div className="mt-auto">
          <div aria-hidden={collapsed} className={`grid transition-[grid-template-rows,opacity,margin] duration-200 ease-in-out motion-reduce:transition-none ${collapsed ? 'mb-0 grid-rows-[0fr] opacity-0' : 'mb-4 grid-rows-[1fr] opacity-100'}`}>
            <div className="overflow-hidden"><div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold"><ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-200" />Sesi administrator</div>
              <p className="mt-2 text-[10px] leading-4 text-emerald-100/70">Akses aktif dan dilindungi sesi admin.</p>
            </div></div>
          </div>
          <form action={logoutAdminAction}>
            <Button type="submit" variant="ghost" aria-label="Keluar dari panel admin" title={collapsed ? 'Keluar' : undefined} className={`h-11 w-full bg-white/5 text-white transition-[gap,padding,color] duration-200 ease-in-out hover:bg-white/12 hover:text-white ${collapsed ? 'justify-center gap-0 px-0' : 'justify-start gap-2 px-3'}`}>
              <LogOut aria-hidden="true" className="h-[18px] w-[18px] shrink-0" /><span aria-hidden={collapsed} className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out motion-reduce:transition-none ${collapsed ? 'max-w-0 opacity-0' : 'max-w-20 opacity-100'}`}>Keluar</span>
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
