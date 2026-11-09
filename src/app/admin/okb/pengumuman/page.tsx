import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AnnouncementStep } from '@/features/admin/announcement/components/AnnouncementStep';
import { TemplateCard } from '@/features/admin/announcement/components/TemplateCard';
import { VaImportCard } from '@/features/admin/announcement/components/VaImportCard';
import { WaveAnnouncementCard } from '@/features/admin/announcement/components/WaveAnnouncementCard';
import { fetchWaveSummaries } from '@/features/admin/announcement/server/waveSummaryRepository';
import type { WaveSummary } from '@/features/admin/announcement/waveSummary';
import { createTemplateRepository, type ActiveTemplate } from '@/features/announcement/server/templateRepository';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';

export const dynamic = 'force-dynamic';

function LoadError({ title }: { title: string }) {
  return <Alert variant="destructive"><AlertTitle>{title}</AlertTitle><AlertDescription>Silakan muat ulang halaman atau coba lagi nanti.</AlertDescription></Alert>;
}

export default async function AnnouncementPage() {
  if (!await getAdminSession()) redirect('/login');

  const supabase = getSupabaseAdmin();
  const [template, waves] = await Promise.all([
    createTemplateRepository(supabase).getActive().then((active): { active: ActiveTemplate | null } => ({ active }), () => null),
    fetchWaveSummaries(supabase).catch((): WaveSummary[] | null => null),
  ]);

  return <>
    <section className="flex flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-sidebar)]">Administrasi</p>
      <h1 className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">Pengumuman</h1>
      <p className="max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
        Siapkan Surat Penerimaan dan Nomor VA, lalu umumkan Hasil OKB agar orang tua dapat melihatnya di halaman Cek Hasil OKB.
      </p>
    </section>
    <div className="mt-6 space-y-5">
      <AnnouncementStep
        id="langkah-umumkan"
        title="Umumkan per Gelombang OKB"
        description="Pendaftar Diterima dan Ditolak diumumkan sekaligus per gelombang. Pendaftar yang belum diputuskan dilewati."
      >
        {waves
          ? <div className="grid gap-3 md:grid-cols-3">{waves.map(summary => <WaveAnnouncementCard key={summary.wave} summary={summary} />)}</div>
          : <LoadError title="Ringkasan Gelombang OKB belum dapat dimuat" />}
      </AnnouncementStep>
      <AnnouncementStep
        id="langkah-template"
        title="Template Surat Penerimaan"
        description="PDF 2 halaman: pengumuman dengan nama anak dan Nomor VA dikosongkan, lalu Surat Pernyataan. Sistem mengisi nama, Nomor VA, serta tempat dan tanggal lahir anak."
      >
        {template
          ? <TemplateCard active={template.active ? { uploadedAt: template.active.uploadedAt } : null} />
          : <LoadError title="Template belum dapat dimuat" />}
      </AnnouncementStep>
      <AnnouncementStep
        id="langkah-va"
        title="Impor Nomor VA"
        description={<>
          File Excel (.xlsx) atau CSV berkolom <span className="font-semibold">Nomor Pendaftaran</span> dan <span className="font-semibold">Nomor VA</span>.
          Di Excel, format kolom Nomor VA sebagai Teks agar 16 digitnya utuh.
        </>}
      >
        <VaImportCard />
      </AnnouncementStep>
    </div>
  </>;
}
