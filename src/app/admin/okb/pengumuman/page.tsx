import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AnnouncementStep } from '@/features/admin/announcement/components/AnnouncementStep';
import { LetterNumberCard } from '@/features/admin/announcement/components/LetterNumberCard';
import { TemplateCard } from '@/features/admin/announcement/components/TemplateCard';
import { VaImportCard } from '@/features/admin/announcement/components/VaImportCard';
import { WaveAnnouncementCard } from '@/features/admin/announcement/components/WaveAnnouncementCard';
import { fetchWaveSummaries } from '@/features/admin/announcement/server/waveSummaryRepository';
import type { WaveSummary } from '@/features/admin/announcement/waveSummary';
import type { LetterNumberSettings } from '@/features/announcement/letterNumber';
import { createLetterNumberRepository } from '@/features/announcement/server/letterNumberRepository';
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
  const letterNumbers = createLetterNumberRepository(supabase);
  const [template, numbering, waves] = await Promise.all([
    createTemplateRepository(supabase).getActive().then((active): { active: ActiveTemplate | null } => ({ active }), () => null),
    Promise.all([letterNumbers.get(), letterNumbers.getLastUsed()])
      .then(([settings, lastUsed]): { settings: LetterNumberSettings | null; lastUsed: number | null } => ({ settings, lastUsed }), () => null),
    fetchWaveSummaries(supabase).catch((): WaveSummary[] | null => null),
  ]);

  return <>
    <p className="max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
      Siapkan Surat Penerimaan dan Nomor VA, lalu umumkan Hasil OKB agar orang tua dapat melihatnya di halaman Cek Hasil OKB.
    </p>
    <div className="mt-4 space-y-5">
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
        description={<>PDF 2 halaman dari Microsoft Word: pengumuman, lalu Surat Pernyataan. Sistem mengganti <span className="font-mono">{'{urut}'}</span> pada baris Nomor, <span className="font-mono">(NAMA SISWA)</span>, dan <span className="font-mono">(NAMA SEKOLAH)</span>, lalu mengisi Nomor VA serta nama dan tempat/tanggal lahir anak.</>}
      >
        {template
          ? <TemplateCard active={template.active ? { uploadedAt: template.active.uploadedAt } : null} />
          : <LoadError title="Template belum dapat dimuat" />}
      </AnnouncementStep>
      <AnnouncementStep
        id="langkah-nomor-surat"
        title="Nomor Surat Penerimaan"
        description="Setiap Pendaftar Diterima mendapat nomor urut berikutnya saat diumumkan, urut Nomor Pendaftaran. Nomor yang sudah diberikan tidak berubah."
      >
        {numbering
          ? <LetterNumberCard settings={numbering.settings} lastUsed={numbering.lastUsed} />
          : <LoadError title="Nomor surat belum dapat dimuat" />}
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
