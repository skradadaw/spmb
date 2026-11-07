import { OkbTabs } from '@/features/admin/okbSchedule/components/OkbTabs';

export default function OkbLayout({ children }: { children: React.ReactNode }) {
  return <>
    <section className="flex flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-sidebar)]">Administrasi</p>
      <h1 className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">OKB</h1>
    </section>
    <div className="mt-4"><OkbTabs /></div>
    <div className="mt-5">{children}</div>
  </>;
}
