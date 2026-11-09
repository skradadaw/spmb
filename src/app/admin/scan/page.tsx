import { redirect } from 'next/navigation';
import { AttendanceScanner } from '@/features/admin/attendance/components/AttendanceScanner';
import { getAdminSession } from '@/features/auth/session';

export const dynamic = 'force-dynamic';

export default async function AttendanceScanPage() {
  if (!await getAdminSession()) redirect('/login');

  return <>
    <p className="max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
      Arahkan kamera ke QR di Bukti Pendaftaran. Kalau jadwal OKB pendaftar itu hari ini, kehadirannya langsung tercatat.
    </p>
    <div className="mt-4">
      <AttendanceScanner />
    </div>
  </>;
}
