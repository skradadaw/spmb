import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  WalletCards,
} from 'lucide-react';
import { registrationInfo } from '@/features/home/data';

const keyFacts = [
  {
    label: registrationInfo.wave.name,
    value: registrationInfo.wave.period,
    icon: CalendarDays,
  },
  {
    label: 'Tes OKB',
    value: registrationInfo.wave.testDate,
    icon: ClipboardCheck,
  },
  {
    label: 'Biaya OKB',
    value: registrationInfo.okb.fee,
    icon: WalletCards,
  },
] as const;

export function HomeHeader() {
  return (
    <header className="relative z-20 border-b border-emerald-900/10 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="#atas"
          className="flex items-center gap-3"
          aria-label="SD Plus 3 Al-Muhajirin - kembali ke atas"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00AA13] text-white shadow-md shadow-emerald-600/20">
            <GraduationCap size={23} />
          </span>
          <span>
            <span className="block text-sm font-black text-gray-950 sm:text-base">
              SD Plus 3 Al-Muhajirin
            </span>
            <span className="block text-[11px] font-semibold text-gray-500 sm:text-xs">
              SPMB {registrationInfo.academicYear}
            </span>
          </span>
        </a>
        <nav
          aria-label="Navigasi halaman"
          className="hidden items-center gap-1 lg:flex"
        >
          {[
            ['Informasi', '#informasi'],
            ['Biaya', '#biaya'],
            ['Persyaratan', '#persyaratan'],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-full px-4 py-2 text-sm font-bold text-gray-600 transition hover:bg-emerald-50 hover:text-[#007A10] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007A10]"
            >
              {label}
            </a>
          ))}
        </nav>
        <Link
          href="/pendaftaran"
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#007A10] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-[#00550B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007A10] sm:px-6"
        >
          Daftar Sekarang <ArrowRight size={17} />
        </Link>
      </div>
    </header>
  );
}

export default function HomeHero() {
  return (
    <section
      id="atas"
      className="relative overflow-hidden bg-gradient-to-b from-[#F3FAF4] via-[#F8FAF8] to-white px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl text-center">
        <p className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#007A10] shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#00AA13]" />
          Pendaftaran Gelombang 1
        </p>
        <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-gray-950 sm:text-5xl lg:text-7xl">
          Seleksi Penerimaan Murid Baru{' '}
          <span className="text-[#00AA13]">{registrationInfo.academicYear}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
          Langkah awal menuju pendidikan yang unggul, berkarakter Islami, dan
          bertumbuh bersama potensi terbaik anak.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/pendaftaran"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#007A10] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:-translate-y-0.5 hover:bg-[#00550B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007A10]"
          >
            Daftar Sekarang <ArrowRight size={18} />
          </Link>
          <a
            href="#informasi"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-7 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:border-emerald-300 hover:text-[#007A10] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007A10]"
          >
            Lihat Informasi
          </a>
        </div>
        <div id="informasi" className="mt-12 grid scroll-mt-24 gap-4 text-left md:grid-cols-3">
          {keyFacts.map(({ label, value, icon: Icon }) => (
            <article
              key={label}
              className="rounded-3xl border border-gray-100 bg-white/95 p-5 shadow-lg shadow-gray-200/50"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00AA13]/10 text-[#00AA13]">
                <Icon size={21} />
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {label}
              </p>
              <p className="mt-2 text-lg font-black text-gray-950">{value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
