import Link from 'next/link';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AudioLines, BookOpenText, Calculator, ChevronRight, Route } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { DashboardCardTitle } from '@/features/admin/components/DashboardCardTitle';
import { OVERVIEW_CARD } from './okbDayFormat';

const OKB_TESTS: { name: string; icon: LucideIcon }[] = [
  { name: 'Literasi', icon: BookOpenText },
  { name: 'Numerasi', icon: Calculator },
  { name: 'Tahsin', icon: AudioLines },
];

type Step = { title: string; body: ReactNode; link?: { href: string; label: string } };

const STEPS: Step[] = [
  {
    title: 'Bagi Ruang OKB dan cetak Name Tag',
    body: 'Sebelum hari OKB, per tanggal dan Gelombang OKB. Ruang OKB kosong lagi bila Jadwal OKB Pendaftar diubah.',
    link: { href: '/admin/okb/name-tag', label: 'Buka Name Tag' },
  },
  {
    title: 'Scan Kehadiran',
    body: 'Pindai QR di Bukti Pendaftaran saat Pendaftar datang; statusnya langsung menjadi Sudah OKB. Hanya berlaku pada tanggal Jadwal OKB-nya.',
    link: { href: '/admin/scan', label: 'Buka Scan Kehadiran' },
  },
  {
    title: 'Tiga Tes OKB di Ruang OKB',
    body: (
      <>
        <ul aria-label="Tes OKB" className="my-1.5 flex flex-wrap gap-1.5">
          {OKB_TESTS.map(({ name, icon: Icon }) => (
            <li key={name} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              <Icon aria-hidden="true" className="size-3.5" />{name}
            </li>
          ))}
        </ul>
        Tes yang sudah diikuti ditandai stiker bintang di Name Tag dan tidak dicatat di sistem.
      </>
    ),
  },
  {
    title: 'Keputusan Penerimaan',
    body: 'Ditetapkan Panitia berdasarkan hasil OKB, lalu dimasukkan admin di detail Pendaftar; Pendaftar Diterima sekaligus mendapat Kelas Penempatan.',
    link: { href: `/admin/pendaftar?status=${encodeURIComponent('Sudah OKB')}`, label: 'Lihat yang menunggu keputusan' },
  },
  {
    title: 'Pengumuman Hasil OKB',
    body: 'Per Gelombang OKB atau per Pendaftar. Orang tua melihatnya dengan Nomor Pendaftaran dan tanggal lahir anak.',
    link: { href: '/admin/okb/pengumuman', label: 'Buka Pengumuman' },
  },
];

/** Alur satu kegiatan OKB dari persiapan sampai Pengumuman Hasil OKB, dengan tautan ke tempat setiap langkah dikerjakan. */
export function OkbGuideCard() {
  return (
    <Card className={OVERVIEW_CARD}>
      <div className="p-5 pb-4 sm:p-6 sm:pb-4">
        <DashboardCardTitle icon={Route} title="Alur kegiatan OKB" description="Observasi Kesiapan Belajar, dari persiapan sampai pengumuman" />
      </div>
      <ol className="px-5 pb-5 sm:px-6 sm:pb-6">
        {STEPS.map((step, index) => (
          <li key={step.title} className="relative flex gap-3 pb-4 last:pb-0">
            {/* Garis penghubung antarlangkah. */}
            {index < STEPS.length - 1 && <span aria-hidden="true" className="absolute top-7 bottom-0 left-[13px] w-px bg-slate-200" />}
            <span aria-hidden="true" className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--admin-sidebar)] text-xs font-bold text-white">{index + 1}</span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">{step.title}</p>
              <div className="mt-0.5 text-xs leading-5 text-slate-500">{step.body}</div>
              {step.link && (
                <Link href={step.link.href} className="mt-1 inline-flex items-center gap-0.5 rounded text-xs font-semibold text-emerald-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  {step.link.label}<ChevronRight aria-hidden="true" className="size-3.5" />
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
