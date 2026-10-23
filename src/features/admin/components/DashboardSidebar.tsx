import Image from 'next/image';
import { AdminNavigation, type AdminSection } from './AdminNavigation';
import { ChevronDown, LogOut, PanelLeft } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { logoutAdminAction } from '@/features/auth/logout-action';
import { cn } from '@/lib/utils';

/**
 * Desktop sidebar laid out like claude.ai: hidden, it slides fully off screen and
 * only the panel toggle stays, fixed at the same top-left spot it holds in the
 * open sidebar's header. The account button at the bottom holds the logout.
 */
export function DashboardSidebar({ active = 'summary', collapsed = false, onToggle }: { active?: AdminSection; collapsed?: boolean; onToggle?: () => void }) {
  return (
    <TooltipProvider delay={300}>
      <SidebarToggle collapsed={collapsed} onToggle={onToggle} />
      <aside id="admin-sidebar" data-testid="admin-sidebar" data-state={collapsed ? 'collapsed' : 'expanded'} inert={collapsed} className={cn('fixed inset-y-0 left-0 z-20 hidden w-[288px] flex-col bg-[var(--admin-sidebar)] text-white transition-transform duration-200 ease-in-out motion-reduce:transition-none lg:flex', collapsed && '-translate-x-full')}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_20%_10%,rgba(57,209,85,0.32),transparent_35%),linear-gradient(145deg,transparent_50%,rgba(255,255,255,0.05))]" />
        <div className="relative flex h-full flex-col px-2 py-2">
          {/* Same top and height as the fixed toggle (top-3, size-9), which covers this row's left edge. */}
          <div className="mt-1 flex h-9 items-center pl-12 pr-2">
            <p className="truncate text-base font-semibold leading-6">Dasbor SPMB</p>
          </div>
          <AdminNavigation active={active} />
          <div className="mt-auto border-t border-white/10 pt-2">
            <AccountMenu />
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

/**
 * One fixed button for both states keeps keyboard focus and never moves: on the
 * green sidebar while it is open, on the page canvas once it is hidden.
 * Ctrl/Cmd+B toggles it too (AdminShell).
 */
function SidebarToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle?: () => void }) {
  const label = collapsed ? 'Tampilkan sidebar' : 'Sembunyikan sidebar';
  return (
    <Tooltip>
      <TooltipTrigger
        render={<button type="button" />}
        aria-label={label}
        aria-expanded={!collapsed}
        aria-controls="admin-sidebar"
        aria-keyshortcuts="Control+B Meta+B"
        onClick={onToggle}
        className={cn(
          'fixed top-3 left-3 z-30 hidden size-9 place-items-center rounded-lg transition-[background-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none lg:grid',
          collapsed ? 'cursor-e-resize text-slate-600 hover:bg-slate-900/[0.06] hover:text-slate-900 focus-visible:outline-[var(--admin-sidebar)]' : 'cursor-w-resize text-white/75 hover:bg-white/10 hover:text-white focus-visible:outline-emerald-300',
        )}
      >
        <PanelLeft aria-hidden="true" className="size-[18px]" />
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>{label} <kbd className="font-sans opacity-70">Ctrl+B</kbd></TooltipContent>
    </Tooltip>
  );
}

/** The single shared admin account has no name in its session, so the button shows a generic identity. */
function AccountMenu() {
  return (
    <Popover>
      <PopoverTrigger aria-label="Menu akun admin" className="flex h-9 max-w-full items-center gap-2 rounded-lg px-1.5 text-left text-white transition-colors hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 data-[state=open]:bg-white/[0.08]">
        <Image src="/logo.png" alt="" width={44} height={44} className="size-6 shrink-0 object-contain" />
        <span className="min-w-0 truncate text-sm font-medium">Admin <span className="font-normal text-white/60">· SPMB</span></span>
        <ChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-white/60" />
      </PopoverTrigger>
      {/* Dark like the sidebar it opens from, in the style of claude.ai's account menu. */}
      <PopoverContent side="top" align="start" sideOffset={8} className="w-[272px] rounded-xl border-white/10 bg-[var(--admin-sidebar)] p-1.5 text-white shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
        <p className="truncate px-2 pt-1 pb-1.5 text-sm text-white/55">SD Plus 3 Al-Muhajirin</p>
        <form action={logoutAdminAction}>
          <button type="submit" aria-label="Keluar dari panel admin" className="flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:outline-none">
            <LogOut aria-hidden="true" className="size-4" />
            Keluar
          </button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
