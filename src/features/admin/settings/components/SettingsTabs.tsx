'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const SETTINGS_TABS = [
  { href: '/admin/pengaturan/kuota', label: 'Kuota Kelas' },
  { href: '/admin/pengaturan/ruang-okb', label: 'Ruang OKB' },
] as const;

/** Setiap tab adalah alamat tersendiri, agar dapat dibuka langsung dan tetap terbuka saat dimuat ulang. */
export function SettingsTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Bagian pengaturan" className="overflow-x-auto border-b border-[var(--admin-border)]">
      <div className="flex min-w-max gap-1">
        {SETTINGS_TABS.map(({ href, label }) => {
          const active = pathname.startsWith(href);
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
