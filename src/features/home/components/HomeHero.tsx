import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  LogIn,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { registrationInfo } from '@/features/home/data';

const keyFacts = [
  {
    label: registrationInfo.wave.name,
    value: registrationInfo.wave.period,
    helper: 'Periode Open Booking',
    icon: CalendarDays,
  },
  {
    label: 'Tes OKB',
    value: registrationInfo.wave.testDate,
    helper: 'Jadwal observasi kesiapan belajar',
    icon: ClipboardCheck,
  },
  {
    label: 'Biaya OKB',
    value: registrationInfo.okb.fee,
    helper: 'Siapkan bukti pembayarannya',
    icon: WalletCards,
  },
] as const;

const navigationItems = [
  ['Jadwal', '#jadwal'],
  ['Cara Daftar', '#cara-daftar'],
  ['Biaya', '#biaya'],
  ['Persyaratan', '#persyaratan'],
] as const;

const primaryActionClass =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#007A10] px-6 py-3 text-base font-extrabold text-white shadow-lg shadow-emerald-950/20 transition-colors hover:bg-[#00550B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-emerald-950/10 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#atas"
          className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#007A10]"
          aria-label="SD Plus 3 Al-Muhajirin - kembali ke atas"
        >
          <Image
            src="/logo.png"
            alt="Logo SD Plus 3 Al-Muhajirin"
            width={52}
            height={52}
            className="h-12 w-12 shrink-0 object-contain sm:h-[52px] sm:w-[52px]"
            priority
          />
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-base font-extrabold text-slate-950">
              SD Plus 3 Al-Muhajirin
            </span>
            <span className="block text-xs font-semibold text-[#007A10]">
              Open Booking {registrationInfo.academicYear}
            </span>
          </span>
        </a>

        <nav aria-label="Navigasi halaman" className="hidden items-center gap-1 lg:flex">
          {navigationItems.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-[#007A10] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007A10]"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            aria-label="Login Panitia"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007A10] sm:px-4"
          >
            <LogIn aria-hidden="true" size={18} />
            <span className="hidden sm:inline">Login Panitia</span>
          </Link>
          <Link
            href="/pendaftaran"
            aria-label="Mulai Pendaftaran"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#007A10] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-[#00550B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007A10] sm:px-5"
          >
            <span className="hidden sm:inline">Mulai Pendaftaran</span>
            <span className="sm:hidden">Daftar</span>
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function BookingProgress({ completedCount }: { completedCount: number | null }) {
  if (completedCount === null) {
    return (
      <section aria-labelledby="capacity-title" className="rounded-2xl border border-white/15 bg-slate-950/30 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p id="capacity-title" className="flex items-center gap-2 text-sm font-bold text-emerald-100">
              <UsersRound aria-hidden="true" size={18} /> Progress peserta
            </p>
            <p className="mt-2 text-lg font-black text-white">Progress sementara tidak tersedia</p>
          </div>
          <p className="text-right text-sm font-bold text-amber-300">
            Target {registrationInfo.capacity} peserta
          </p>
        </div>
        <p className="mt-3 text-sm leading-6 text-emerald-50/90">
          Data akan ditampilkan kembali setelah koneksi sistem pulih.
        </p>
      </section>
    );
  }

  const safeCount = Math.max(0, completedCount);
  const progressValue = Math.min(safeCount, registrationInfo.capacity);
  const percentage = Math.min(100, Math.round((safeCount / registrationInfo.capacity) * 100));
  const label = `${safeCount} dari ${registrationInfo.capacity} peserta telah menyelesaikan pendaftaran`;

  return (
    <section aria-labelledby="capacity-title" className="rounded-2xl border border-white/15 bg-slate-950/30 p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p id="capacity-title" className="flex items-center gap-2 text-sm font-bold text-emerald-100">
            <UsersRound aria-hidden="true" size={18} /> Progress peserta
          </p>
          <p className="mt-2 text-2xl font-black text-white">{safeCount} peserta</p>
        </div>
        <p className="text-right text-sm font-bold text-amber-300">
          Target {registrationInfo.capacity} peserta
        </p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={registrationInfo.capacity}
          aria-valuenow={progressValue}
          className="h-full rounded-full bg-amber-400 transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-emerald-50/90">
        Kuota dihitung dari formulir yang sudah selesai beserta seluruh dokumennya.
      </p>
    </section>
  );
}

export default function HomeHero({ completedCount }: { completedCount: number | null }) {
  return (
    <section id="atas" className="relative overflow-hidden bg-[#064E1B] text-white">
      <div aria-hidden="true" className="hero-grid absolute inset-0 opacity-20" />
      <div aria-hidden="true" className="absolute -left-28 top-20 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-24 -top-20 h-96 w-96 rounded-full bg-lime-300/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 pt-14 sm:px-6 sm:pb-28 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-32 lg:pt-24">
        <div className="text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-extrabold text-emerald-50 backdrop-blur-sm">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Open Booking Pendaftaran · {registrationInfo.wave.name}
          </p>

          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-black leading-[1.08] tracking-[-0.035em] text-white sm:text-5xl lg:mx-0 lg:text-6xl">
            Awali perjalanan pendidikan Ananda bersama{' '}
            <span className="text-amber-300">Al-Muhajirin</span>
            <span className="mt-4 block text-2xl tracking-[-0.02em] text-emerald-100 sm:text-3xl">
              Tahun Pelajaran {registrationInfo.academicYear}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-emerald-50/90 sm:text-lg lg:mx-0">
            Informasi Open Booking Pendaftaran tersedia dalam satu halaman agar orang tua mudah
            memeriksa jadwal, biaya OKB, dan dokumen yang perlu disiapkan.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link href="/pendaftaran" className={primaryActionClass}>
              Mulai Pendaftaran <ArrowRight aria-hidden="true" size={19} />
            </Link>
            <a
              href="#jadwal"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-base font-extrabold text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Lihat jadwal penting
            </a>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-100 lg:justify-start">
            <CheckCircle2 aria-hidden="true" className="text-amber-300" size={19} />
            Kuota terbatas untuk 112 peserta yang menyelesaikan pendaftaran.
          </p>
        </div>

        <aside
          id="jadwal"
          aria-labelledby="jadwal-title"
          className="scroll-mt-24 rounded-[2rem] border border-white/20 bg-white/10 p-5 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl sm:p-7"
        >
          <BookingProgress completedCount={completedCount} />

          <div className="mt-5 rounded-2xl bg-white p-5 text-slate-950 sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-[#007A10]">
                  Ringkasan Open Booking
                </p>
                <h2 id="jadwal-title" className="mt-2 text-2xl font-black tracking-tight">
                  Jadwal penting
                </h2>
              </div>
              <span className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-extrabold text-amber-900">
                {registrationInfo.academicYear}
              </span>
            </div>

            <dl className="divide-y divide-slate-200">
              {keyFacts.map(({ label, value, helper, icon: Icon }) => (
                <div key={label} className="grid grid-cols-[auto_1fr] gap-4 py-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#007A10]">
                    <Icon aria-hidden="true" size={21} />
                  </span>
                  <div>
                    <dt className="text-sm font-bold text-slate-600">{label}</dt>
                    <dd className="mt-1 text-lg font-black leading-snug text-slate-950">{value}</dd>
                    <dd className="mt-1 text-sm text-slate-600">{helper}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 1440 80"
        className="absolute bottom-0 left-0 h-12 w-full text-white sm:h-16"
        preserveAspectRatio="none"
      >
        <path d="M0 32L120 44C240 56 480 70 720 52C960 34 1200 12 1320 22L1440 32V80H0Z" fill="currentColor" />
      </svg>
    </section>
  );
}
