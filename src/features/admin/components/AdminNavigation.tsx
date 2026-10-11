import { LayoutDashboard, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
export type AdminSection = 'summary' | 'participants';
export function AdminNavigation({ active, mobile = false }: { active: AdminSection; mobile?: boolean }) {
  const items = [
    { key: 'summary', href: '/admin', label: 'Ringkasan', icon: LayoutDashboard },
    { key: 'participants', href: '/admin/pendaftar', label: 'Data Peserta', icon: UsersRound },
  ];
  return <nav aria-label={mobile ? 'Navigasi admin mobile' : 'Navigasi admin'} className={mobile ? 'mt-4 flex gap-2' : 'mt-3 space-y-1'}>
    {items.map(({ key, href, label, icon: Icon }) => <Link key={key} href={href} aria-current={active === key ? 'page' : undefined} className={cn(
      'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
      mobile ? 'flex-1 justify-center text-[var(--admin-muted)]' : 'text-white/80 hover:bg-white/10 hover:text-white',
      active === key && (mobile ? 'bg-[var(--brand-green-light)] text-[var(--admin-sidebar)] ring-1 ring-inset ring-[var(--admin-border)]' : 'bg-white/12 text-white ring-1 ring-inset ring-white/10'),
    )}><Icon aria-hidden="true" className="h-[18px] w-[18px]" />{label}</Link>)}
  </nav>;
}
