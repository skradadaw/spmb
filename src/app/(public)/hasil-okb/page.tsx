import type { Metadata } from 'next';
import { ResultCheck } from '@/features/announcement';
import { registrationInfo } from '@/features/home';

export const metadata: Metadata = {
  title: 'Cek Hasil OKB | SD Plus 3 Al-Muhajirin',
  description: 'Cek tahap pendaftaran dan Pengumuman Hasil OKB Open Booking SD Plus 3 Al-Muhajirin.',
};

export default function HasilOkbPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-public-tint via-public-canvas to-white px-4 py-10 sm:px-6 sm:py-14">
      <header className="mx-auto mb-8 max-w-xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-public-green">Open Booking {registrationInfo.academicYear}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Cek Hasil OKB</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Lihat tahap pendaftaran dan Pengumuman Hasil OKB Ananda di SD Plus 3 Al-Muhajirin.
        </p>
      </header>
      <ResultCheck />
    </main>
  );
}
