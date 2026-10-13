import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClassCapacityForm } from '@/features/admin/capacity/components/ClassCapacityForm';
import { getAdminSession } from '@/features/auth/session';
import type { ClassCapacity } from '@/features/registration/classCapacity';
import { fetchClassCapacities } from '@/features/registration/server/classCapacityRepository';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { REGISTRATION_CAPACITY } from '@/lib/registrationConfig';

export const dynamic = 'force-dynamic';

export default async function ClassCapacityPage() {
  if (!await getAdminSession()) redirect('/login');

  let capacities: ClassCapacity[] | null = null;
  try {
    capacities = await fetchClassCapacities(getSupabaseAdmin());
  } catch {
    capacities = null;
  }

  return <>
    <section className="flex flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-sidebar)]">Administrasi</p>
      <h1 className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">Kuota Kelas</h1>
      <p className="max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
        Atur pembagian {REGISTRATION_CAPACITY} kursi Siswa Baru per Pilihan Kelas. Pilihan Kelas yang penuh tidak dapat dipilih di formulir.
        Pendaftar Ditolak, Dibatalkan, dan Pindahan tidak memakai kursi.
      </p>
    </section>
    <div className="mt-6">
      {capacities ? (
        <Card className="max-w-3xl rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
          <CardHeader className="p-5 pb-3"><CardTitle className="text-base">Pembagian kuota</CardTitle></CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            <ClassCapacityForm capacities={capacities} total={REGISTRATION_CAPACITY} />
          </CardContent>
        </Card>
      ) : (
        <Alert variant="destructive"><AlertTitle>Kuota kelas belum dapat dimuat</AlertTitle><AlertDescription>Silakan muat ulang halaman atau coba lagi nanti.</AlertDescription></Alert>
      )}
    </div>
  </>;
}
