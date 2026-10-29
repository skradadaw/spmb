import type { ReactNode } from 'react';

/** Satu bagian di halaman Pengumuman: judul, penjelasan, lalu isinya. */
export function AnnouncementStep({ id, title, description, children }: {
  id: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-sm">
      <header className="space-y-1">
        <h2 id={id} className="text-base font-bold leading-7 tracking-tight text-slate-900">{title}</h2>
        <p className="text-xs leading-5 text-[var(--admin-muted)]">{description}</p>
      </header>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
