'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const OKB_TABS = [
  { href: '/admin/okb', label: 'Jadwal' },
  { href: '/admin/okb/name-tag', label: 'Name Tag' },
  { href: '/admin/okb/scan', label: 'Scan Kehadiran' },
] as const;

/** Setiap tab adalah alamat tersendiri, agar dapat dibuka langsung dan tetap terbuka saat dimuat ulang. */
export function OkbTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Bagian OKB" className="overflow-x-auto border-b border-[var(--admin-border)]">
      <div className="flex min-w-max gap-1">
        {OKB_TABS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={cn(
              '-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
              active ? 'border-[var(--admin-sidebar)] font-semibold text-[var(--admin-sidebar)]' : 'border-transparent text-[var(--admin-muted)] hover:text-foreground',
            )}>{label}</Link>
          );
        })}
      </div>
    </nav>
  );
}
