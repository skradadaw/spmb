import { LayoutDashboard, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
export type AdminSection = 'summary' | 'participants';
export function AdminNavigation({ active, mobile = false, collapsed = false, onNavigate }: { active: AdminSection; mobile?: boolean; collapsed?: boolean; onNavigate?: () => void }) {
  const items = [
    { key: 'summary', href: '/admin', label: 'Ringkasan', icon: LayoutDashboard },
    { key: 'participants', href: '/admin/pendaftar', label: 'Data Peserta', icon: UsersRound },
  ];
  return <nav aria-label={mobile ? 'Navigasi admin mobile' : 'Navigasi admin'} className={mobile ? 'grid gap-1' : 'mt-3 space-y-1'}>
    {items.map(({ key, href, label, icon: Icon }) => <Link key={key} href={href} onClick={onNavigate} aria-label={collapsed ? label : undefined} title={collapsed ? label : undefined} aria-current={active === key ? 'page' : undefined} className={cn(
      'flex h-11 items-center rounded-xl text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
      mobile ? 'justify-start gap-3 px-3 text-[var(--admin-muted)] transition-colors' : collapsed ? 'justify-center gap-0 px-0 text-white/80 transition-[gap,padding,color] duration-200 ease-in-out hover:bg-white/10 hover:text-white' : 'gap-3 px-3 text-white/80 transition-[gap,padding,color] duration-200 ease-in-out hover:bg-white/10 hover:text-white',
      active === key && (mobile ? 'bg-[var(--brand-green-light)] text-[var(--admin-sidebar)] ring-1 ring-inset ring-[var(--admin-border)]' : 'bg-white/12 text-white ring-1 ring-inset ring-white/10'),
    )}><Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" /><span aria-hidden={collapsed} className={cn(
      'overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out motion-reduce:transition-none',
      collapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100',
    )}>{label}</span></Link>)}
  </nav>;
}
