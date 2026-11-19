import Link from 'next/link';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CalendarClock, CalendarPlus, CalendarX2, ChevronRight, Gavel, ScanLine } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { OkbPipeline as Pipeline } from '../okbOverview';

type Tone = 'emerald' | 'sky' | 'amber' | 'violet';

/** Warna ikon mengikuti warna Status Pendaftar di Data Pendaftar: hijau Terverifikasi, biru Terjadwal OKB, kuning Sudah OKB. */
const TONES: Record<Tone, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  sky: 'bg-sky-50 text-sky-700 ring-sky-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
};

type Stage = { label: string; value: number; detail: ReactNode; hint: string; href: string; icon: LucideIcon; tone: Tone };

const statusHref = (status: string) => `/admin/pendaftar?status=${encodeURIComponent(status)}`;

const CARD = 'group flex h-full min-w-0 flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_28px_-22px_rgba(15,23,42,0.35)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_14px_32px_-20px_rgba(6,95,70,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5';

function StageCard({ stage, step, last }: { stage: Stage; step: number; last: boolean }) {
  const Icon = stage.icon;
  return (
    <li className="relative min-w-0">
      <Tooltip>
        <TooltipTrigger render={<Link href={stage.href} className={CARD} />}>
          <span className="flex items-start justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">{step}</span>
              <span className="truncate text-xs font-semibold leading-5 text-slate-500">{stage.label}</span>
            </span>
            <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl ring-1', TONES[stage.tone])}><Icon aria-hidden="true" className="size-[18px]" /></span>
          </span>
          <span className="mt-1 block text-3xl font-bold tracking-[-0.04em] text-slate-950">{stage.value}</span>
          <span className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <span className="min-w-0 flex-1">{stage.detail}</span>
            <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600 motion-reduce:transition-none" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom">{stage.hint}</TooltipContent>
      </Tooltip>
      {/* Penanda arah alur di antara kartu; di layar sempit urutan nomor sudah cukup. */}
      {!last && (
        <span aria-hidden="true" className="absolute top-1/2 -right-5 z-10 hidden size-6 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm xl:flex">
          <ChevronRight className="size-3.5" />
        </span>
      )}
    </li>
  );
}

/**
 * Tahap OKB dari Pendaftar Terverifikasi sampai Keputusan Penerimaan. Setiap kartu membuka daftar yang angkanya sama persis;
 * Hasil OKB membuka tab Pengumuman karena Data Pendaftar tidak dapat menyaring Diterima dan Ditolak sekaligus.
 */
export function OkbPipeline({ pipeline }: { pipeline: Pipeline }) {
  const decided = pipeline.diterima + pipeline.ditolak;
  const stages: Stage[] = [
    {
      label: 'Perlu dijadwalkan', value: pipeline.perluDijadwalkan, detail: 'Terverifikasi, belum ada Jadwal OKB',
      hint: 'Pendaftar Terverifikasi yang belum punya Jadwal OKB. Jadwal OKB ditetapkan di detail Pendaftar.',
      href: statusHref('Terverifikasi'), icon: CalendarPlus, tone: 'emerald',
    },
    {
      label: 'Terjadwal OKB', value: pipeline.terjadwal,
      detail: pipeline.tidakHadir > 0 ? `${pipeline.mendatang} mendatang · ${pipeline.tidakHadir} sudah lewat` : `${pipeline.mendatang} pada tanggal mendatang`,
      hint: 'Semua Pendaftar Terjadwal OKB, termasuk yang tanggalnya sudah lewat tanpa Scan Kehadiran.',
      href: statusHref('Terjadwal OKB'), icon: CalendarClock, tone: 'sky',
    },
    {
      label: 'Sudah OKB', value: pipeline.sudahOkb, detail: 'Menunggu Keputusan Penerimaan',
      hint: 'Pendaftar yang tercatat hadir lewat Scan Kehadiran dan belum mendapat Keputusan Penerimaan.',
      href: statusHref('Sudah OKB'), icon: ScanLine, tone: 'amber',
    },
    {
      label: 'Hasil OKB', value: decided, detail: `${pipeline.diterima} Diterima · ${pipeline.ditolak} Ditolak`,
      hint: pipeline.belumDiumumkan > 0
        ? `Keputusan Penerimaan dari Panitia; ${pipeline.belumDiumumkan} belum diumumkan kepada orang tua.`
        : 'Keputusan Penerimaan dari Panitia; semuanya sudah diumumkan kepada orang tua.',
      href: '/admin/okb/pengumuman', icon: Gavel, tone: 'violet',
    },
  ];

  return (
    <TooltipProvider delay={400}>
      <ol aria-label="Tahap OKB" className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        {stages.map((stage, index) => <StageCard key={stage.label} stage={stage} step={index + 1} last={index === stages.length - 1} />)}
      </ol>
      {pipeline.tidakHadir > 0 && (
        <Link href="/admin/pendaftar?okb=terlewat" className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-900 hover:bg-amber-100/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <CalendarX2 aria-hidden="true" className="size-4 shrink-0" />
          <span className="min-w-0 flex-1">{pipeline.tidakHadir} Pendaftar Tidak Hadir OKB<span className="font-normal text-amber-800"> · jadwalkan ulang atau batalkan</span></span>
          <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
        </Link>
      )}
    </TooltipProvider>
  );
}
