import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AnnouncementStep, type StepStatus } from '@/features/admin/announcement/components/AnnouncementStep';
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

/** Teks contoh di template dan data yang menggantikannya, ditampilkan agar admin tahu apa yang harus ada di template. */
const TEMPLATE_REPLACEMENTS = [
  ['{urut}', 'nomor urut'],
  ['(NAMA SISWA)', 'nama anak'],
  ['(NAMA SEKOLAH)', 'asal sekolah'],
  ['Account (VA):', 'diikuti Nomor VA'],
] as const;

function LoadError({ title }: { title: string }) {
  return <Alert variant="destructive"><AlertTitle>{title}</AlertTitle><AlertDescription>Silakan muat ulang halaman atau coba lagi nanti.</AlertDescription></Alert>;
}

const ready = (label: string): StepStatus => ({ tone: 'ready', label });
const todo = (label: string): StepStatus => ({ tone: 'todo', label });

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

  const missingVa = waves?.reduce((total, wave) => total + wave.missingVa, 0) ?? 0;
  const toAnnounce = waves?.reduce((total, wave) => total + wave.diterima.pending + wave.ditolak.pending, 0) ?? 0;

  return <>
    <p className="text-sm leading-6 text-[var(--admin-muted)]">
      Siapkan Surat Penerimaan di langkah 1–3, lalu umumkan Hasil OKB di langkah 4.
    </p>
    <div className="mt-4 grid gap-5 lg:grid-cols-2">
      <AnnouncementStep
        id="langkah-template"
        step={1}
        title="Template Surat Penerimaan"
        status={template && (template.active ? ready('Siap') : todo('Belum ada template'))}
        description="PDF 2 halaman dari Word: pengumuman, lalu Surat Pernyataan."
      >
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-canvas)] px-3 py-2.5">
          <p id="teks-diganti" className="text-xs font-medium text-[var(--admin-muted)]">Teks di template yang diganti otomatis</p>
          <dl aria-labelledby="teks-diganti" className="mt-1.5 grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
            {TEMPLATE_REPLACEMENTS.map(([marker, meaning]) => (
              <div key={marker} className="flex items-baseline gap-2">
                <dt className="shrink-0 font-mono font-semibold text-slate-800">{marker}</dt>
                <dd className="text-[var(--admin-muted)]">{meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
        {template
          ? <TemplateCard active={template.active ? { uploadedAt: template.active.uploadedAt } : null} />
          : <LoadError title="Template belum dapat dimuat" />}
      </AnnouncementStep>
      <AnnouncementStep
        id="langkah-nomor-surat"
        step={2}
        title="Nomor Surat Penerimaan"
        status={numbering && (numbering.settings ? ready('Siap') : todo('Belum diatur'))}
        description="Nomor urut diberikan saat diumumkan dan tidak berubah lagi."
      >
        {numbering
          ? <LetterNumberCard settings={numbering.settings} lastUsed={numbering.lastUsed} />
          : <LoadError title="Nomor surat belum dapat dimuat" />}
      </AnnouncementStep>
      <AnnouncementStep
        id="langkah-va"
        step={3}
        title="Impor Nomor VA"
        className="lg:col-span-2"
        status={waves && (missingVa > 0 ? todo(`${missingVa} Diterima belum punya Nomor VA`) : ready('Lengkap'))}
        description={<>File Excel (.xlsx) atau CSV berkolom <span className="font-semibold text-slate-700">Nomor Pendaftaran</span> dan <span className="font-semibold text-slate-700">Nomor VA</span>.</>}
      >
        <VaImportCard />
      </AnnouncementStep>
      <AnnouncementStep
        id="langkah-umumkan"
        step={4}
        title="Umumkan per Gelombang OKB"
        className="lg:col-span-2"
        status={waves && (toAnnounce > 0 ? { tone: 'info', label: `${toAnnounce} hasil siap diumumkan` } : { tone: 'info', label: 'Tidak ada hasil baru' })}
        description="Diterima dan Ditolak diumumkan sekaligus per gelombang."
      >
        {waves
          ? <div className="grid gap-3 md:grid-cols-3">{waves.map(summary => <WaveAnnouncementCard key={summary.wave} summary={summary} />)}</div>
          : <LoadError title="Ringkasan Gelombang OKB belum dapat dimuat" />}
      </AnnouncementStep>
    </div>
  </>;
}
