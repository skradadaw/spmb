import Image from 'next/image';
import { AdminNavigation, type AdminSection } from './AdminNavigation';
import { LogOut, PanelLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { logoutAdminAction } from '@/features/auth/logout-action';

export function DashboardSidebar({ active = 'summary', collapsed = false, onToggle }: { active?: AdminSection; collapsed?: boolean; onToggle?: () => void }) {
  return (
    <aside id="admin-sidebar" data-testid="admin-sidebar" data-state={collapsed ? 'mini' : 'expanded'} className={`fixed inset-y-0 left-0 z-20 hidden flex-col bg-[var(--admin-sidebar)] text-white transition-[width] duration-200 ease-in-out motion-reduce:transition-none lg:flex ${collapsed ? 'w-20' : 'w-[288px]'}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_20%_10%,rgba(57,209,85,0.32),transparent_35%),linear-gradient(145deg,transparent_50%,rgba(255,255,255,0.05))]" />
      <div className={`relative flex h-full flex-col overflow-hidden py-6 ${collapsed ? 'px-3' : 'px-5'}`}>
        <div className={`relative flex items-center transition-[gap,padding] duration-200 ease-in-out motion-reduce:transition-none ${collapsed ? 'flex-col gap-0 px-0' : 'gap-2.5 pl-1 pr-8'}`}>
          <Image src="/logo.png" alt="Logo SD Plus 3 Al-Muhajirin" width={44} height={44} className={`size-10 shrink-0 object-contain drop-shadow-[0_5px_9px_rgba(0,0,0,0.24)]`} priority />
          <div aria-hidden={collapsed} className={`min-w-0 flex-1 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out motion-reduce:transition-none ${collapsed ? 'max-h-0 max-w-0 opacity-0' : 'max-w-52 opacity-100'}`}>
            <p className="truncate text-xs font-extrabold uppercase tracking-[0.01em]">SD Plus 3 Al-Muhajirin</p>
            <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-200">Panel Administrasi SPMB</p>
          </div>
          <SidebarToggle collapsed={collapsed} onToggle={onToggle} />
        </div>
        <Separator decorative className="mt-6 mb-4 bg-white/12" />
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

/**
 * Sidebar toggle in the style of claude.ai: a quiet panel icon at the end of the
 * header row, and a framed button under the logo when minimised so it is always
 * visible. One element in both states keeps keyboard focus. Ctrl/Cmd+B toggles it too (AdminShell).
 */
function SidebarToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle?: () => void }) {
  const label = collapsed ? 'Perluas sidebar' : 'Minimalkan sidebar';
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={!collapsed}
      aria-controls="admin-sidebar"
      aria-keyshortcuts="Control+B Meta+B"
      title={`${label} (Ctrl+B)`}
      onClick={onToggle}
      className={`grid place-items-center rounded-lg transition-[background-color,color] duration-150 hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 motion-reduce:transition-none ${collapsed ? 'mt-4 size-10 cursor-e-resize border border-white/15 bg-white/10 text-white' : 'absolute -right-1 top-1/2 size-8 -translate-y-1/2 cursor-w-resize text-emerald-100/75'}`}
    >
      <PanelLeft aria-hidden="true" className="size-[18px]" />
    </button>
  );
}
