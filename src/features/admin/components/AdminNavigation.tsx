import { Armchair, LayoutDashboard, Megaphone, ScanLine, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
export type AdminSection = 'summary' | 'participants' | 'attendance' | 'announcement' | 'capacity';
export const ADMIN_NAV_ITEMS = [
  { key: 'summary', href: '/admin', label: 'Ringkasan', icon: LayoutDashboard },
  { key: 'participants', href: '/admin/pendaftar', label: 'Data Pendaftar', icon: UsersRound },
  { key: 'attendance', href: '/admin/scan', label: 'Scan Kehadiran', icon: ScanLine },
  { key: 'announcement', href: '/admin/pengumuman', label: 'Pengumuman', icon: Megaphone },
  { key: 'capacity', href: '/admin/kuota', label: 'Kuota Kelas', icon: Armchair },
] as const satisfies ReadonlyArray<{ key: AdminSection; href: string; label: string; icon: unknown }>;

/** Desktop sidebar navigation, compact rows in the style of claude.ai; the mobile menu is AdminMobileMenu. */
export function AdminNavigation({ active }: { active: AdminSection }) {
  return <nav aria-label="Navigasi admin" className="mt-2">
    <p className="px-2.5 pb-1.5 pt-3 text-xs font-medium text-white/50">Menu utama</p>
    <div className="space-y-0.5">
      {ADMIN_NAV_ITEMS.map(({ key, href, label, icon: Icon }) => <Link key={key} href={href} aria-current={active === key ? 'page' : undefined} className={cn(
        'flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm text-white/85 transition-colors duration-150 hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300',
        active === key && 'bg-white/[0.12] font-medium text-white',
      )}><Icon aria-hidden="true" className="size-4 shrink-0" />{label}</Link>)}
    </div>
  </nav>;
}
