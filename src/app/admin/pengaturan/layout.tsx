import { SettingsTabs } from '@/features/admin/settings/components/SettingsTabs';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>
    <section className="flex flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-sidebar)]">Administrasi</p>
      <h1 className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">Pengaturan</h1>
    </section>
    <div className="mt-4"><SettingsTabs /></div>
    <div className="mt-5">{children}</div>
  </>;
}
