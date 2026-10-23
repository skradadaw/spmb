import { redirect } from 'next/navigation';
import { AttendanceScanner } from '@/features/admin/attendance/components/AttendanceScanner';
import { getAdminSession } from '@/features/auth/session';

export const dynamic = 'force-dynamic';

export default async function AttendanceScanPage() {
  if (!await getAdminSession()) redirect('/login');

  return <>
    <section className="flex flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-sidebar)]">Hari OKB</p>
      <h1 className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">Scan Kehadiran</h1>
      <p className="max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
        Arahkan kamera ke QR di Bukti Pendaftaran. Kalau jadwal OKB pendaftar itu hari ini, kehadirannya langsung tercatat.
      </p>
    </section>
    <div className="mt-6">
      <AttendanceScanner />
    </div>
  </>;
}
