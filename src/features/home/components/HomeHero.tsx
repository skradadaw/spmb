import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Sparkles,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { navigationItems, registrationInfo } from '@/features/home/data';
import MobileNavigation from './MobileNavigation';
import SectionWave from './SectionWave';
import { actionClass } from './actionStyles';

/** Header buttons: quiet, flat and at the nav links' height and weight, so the bar reads as one row. */
const HEADER_ACTION =
  'tap-press inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-green motion-reduce:transition-none';

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-public-deep/10 bg-white/90 shadow-sm shadow-public-deep/10 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:gap-5 lg:px-8">
        <a
          href="#atas"
          className="group flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-public-green"
          aria-label="SD Plus 3 Al-Muhajirin - kembali ke atas"
        >
          <Image
            src="/logo.png"
            alt="Logo SD Plus 3 Al-Muhajirin"
            width={52}
            height={52}
            className="h-12 w-12 shrink-0 object-contain transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transition-none sm:h-[50px] sm:w-[50px]"
            priority
          />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-extrabold tracking-tight text-slate-950 sm:text-base">
              SD Plus 3 Al-Muhajirin
            </span>
            <span className="truncate text-[11px] font-semibold text-public-green sm:text-xs">
              Open Booking {registrationInfo.academicYear}
            </span>
          </span>
        </a>

        <nav
          aria-label="Navigasi halaman"
          className="hidden items-center gap-1 bg-transparent lg:flex"
        >
          {navigationItems.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="relative inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-slate-600 transition-colors after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-public-green after:transition-transform hover:text-public-deep hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-green motion-reduce:after:transition-none"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Link
            href="/login"
            aria-label="Login Panitia"
            title="Login Panitia"
            className={`${HEADER_ACTION} text-slate-700 ring-1 ring-inset ring-public-deep/15 hover:bg-public-tint hover:text-public-deep active:bg-public-tint`}
          >
            <UserRound aria-hidden="true" className="size-4" strokeWidth={2.4} />
            Login
          </Link>
          <Link
            href="/pendaftaran"
            aria-label="Daftar Sekarang"
            className={`group ${HEADER_ACTION} bg-public-green text-white shadow-sm shadow-public-green/20 hover:bg-public-green-hover active:bg-public-green-hover`}
          >
            Daftar Sekarang
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              strokeWidth={2.4}
            />
          </Link>
        </div>

        <MobileNavigation items={navigationItems} />
      </div>
    </header>
  );
}

const scheduleItems = [
  {
    icon: CalendarDays,
    label: registrationInfo.wave.name,
    value: registrationInfo.wave.period,
    note: 'Periode Open Booking',
  },
  {
    icon: ClipboardCheck,
    label: 'Tes OKB',
    value: registrationInfo.okb.date,
    note: 'Jadwal observasi kesiapan belajar',
  },
  {
    icon: WalletCards,
    label: 'Biaya OKB',
    value: registrationInfo.okb.fee,
    note: 'Simpan bukti pembayaran untuk diunggah saat pendaftaran.',
  },
] as const;

function BookingProgress({ usedSeats }: { usedSeats: number | null }) {
  if (usedSeats === null) {
    return (
      <section aria-labelledby="capacity-title" className="border-t border-public-deep/15 pt-4">
        <p id="capacity-title" className="text-sm font-bold text-public-deep">
          Progress pendaftar
        </p>
        <p className="mt-1 text-sm font-bold leading-5 text-slate-800">
          Progress sementara tidak tersedia
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          Data akan ditampilkan kembali setelah koneksi sistem pulih.
        </p>
      </section>
    );
  }

  const safeCount = Math.max(0, usedSeats);
  const progressValue = Math.min(safeCount, registrationInfo.capacity);
  const percentage = Math.min(100, Math.round((safeCount / registrationInfo.capacity) * 100));
  const label = `${safeCount} dari ${registrationInfo.capacity} pendaftar telah menyelesaikan pendaftaran`;

  return (
    <section aria-labelledby="capacity-title" className="border-t border-public-deep/15 pt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p id="capacity-title" className="text-sm font-bold text-public-deep">
          Progress pendaftar
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-public-green shadow-sm shadow-public-deep/5 ring-1 ring-inset ring-public-deep/10">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-public-green opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-public-green" />
          </span>
          {safeCount} / {registrationInfo.capacity}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-public-deep/15">
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={registrationInfo.capacity}
          aria-valuenow={progressValue}
          className="h-full rounded-full bg-public-green transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-3 text-xs font-medium leading-relaxed text-public-deep/80">
        Kuota terbatas. Segera daftarkan putra-putri Ayah dan Bunda, lalu lengkapi Berkas sebelum kuota penuh.
      </p>
    </section>
  );
}

export default function HomeHero({ usedSeats }: { usedSeats: number | null }) {
  return (
    <section id="atas" className="relative isolate overflow-hidden bg-public-deep text-white">
      <div aria-hidden="true" className="hero-grid absolute inset-0 -z-20 opacity-20" />
      <div
        aria-hidden="true"
        className="texture-dots-on-deep absolute inset-0 -z-20 opacity-25"
      />
      <div aria-hidden="true" className="absolute -left-32 top-16 -z-10 h-80 w-80 rounded-full bg-public-line/25 blur-3xl sm:h-96 sm:w-96" />
      <div aria-hidden="true" className="absolute -right-28 -top-24 -z-10 h-96 w-96 rounded-full bg-public-line/20 blur-3xl sm:h-[30rem] sm:w-[30rem]" />
      <div aria-hidden="true" className="absolute bottom-10 left-1/2 -z-10 h-52 w-52 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />

      <div
        aria-hidden="true"
        className="absolute left-[4%] top-28 hidden h-16 w-16 -rotate-12 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-amber-300 shadow-xl shadow-public-deep/20 backdrop-blur-md xl:flex"
      >
        <BookOpen size={29} strokeWidth={1.8} />
      </div>
      <div
        aria-hidden="true"
        className="absolute right-[3%] top-36 hidden h-[4.5rem] w-[4.5rem] rotate-12 items-center justify-center rounded-full border border-amber-200/25 bg-amber-300/10 text-amber-200 shadow-xl shadow-public-deep/20 backdrop-blur-md xl:flex"
      >
        <GraduationCap size={34} strokeWidth={1.8} />
      </div>
      <Sparkles
        aria-hidden="true"
        className="absolute left-[47%] top-20 hidden text-amber-300/80 lg:block"
        size={30}
        strokeWidth={1.7}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-24 pt-12 sm:px-6 sm:pb-28 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8 lg:pb-32 lg:pt-20">
        <div className="text-center lg:text-left">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-extrabold tracking-wide text-public-mint shadow-lg shadow-public-deep/10 backdrop-blur-md">
            <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-50 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-300" />
            </span>
            Pendaftaran {registrationInfo.wave.name}
          </p>

          <h1 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-black leading-[1.06] tracking-[-0.03em] text-white sm:mt-6 sm:text-5xl lg:mx-0 lg:text-[3.5rem] xl:text-[3.75rem]">
            <span className="block sm:inline">Open Booking</span>{' '}
            <span className="block sm:inline">
              SD Plus 3 <span className="whitespace-nowrap">Al-Muhajirin</span>
            </span>{' '}
            <span className="block sm:inline">
              <span className="relative inline-block text-amber-300">
                Telah Dibuka
                <svg
                  aria-hidden="true"
                  viewBox="0 0 260 18"
                  preserveAspectRatio="none"
                  className="absolute -bottom-2 left-0 h-3 w-full text-amber-300/70"
                >
                  <path d="M4 12C72 2 178 2 256 10" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </span>
            </span>
            <span className="mt-5 block text-xl font-extrabold leading-snug tracking-[-0.015em] text-public-mint sm:text-2xl">
              Tahun Pelajaran {registrationInfo.academicYear}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-public-mint/90 sm:mt-6 sm:text-lg sm:leading-8 lg:mx-0">
            Temukan seluruh informasi pendaftaran dalam satu halaman, mulai dari jadwal, biaya OKB,
            hingga Berkas yang perlu Ayah dan Bunda siapkan.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row lg:justify-start">
            <Link href="/pendaftaran" className={actionClass('primary', 'lg', 'focus-visible:outline-white')}>
              Mulai Pendaftaran <ArrowRight aria-hidden="true" />
            </Link>
            <a
              href="/hasil-okb"
              className={actionClass('outlineOnDeep')}
            >
              Cek Hasil OKB
            </a>
          </div>

        </div>

        <aside
          id="jadwal"
          aria-labelledby="jadwal-title"
          className="relative w-full scroll-mt-24 justify-self-center rounded-[1.75rem] border border-white/40 bg-public-tint p-5 text-slate-950 shadow-2xl shadow-black/25 ring-8 ring-white/10 sm:p-6 lg:max-w-[32rem] lg:justify-self-end"
        >
          <span aria-hidden="true" className="absolute -right-2.5 -top-2.5 h-7 w-7 rounded-full border-[6px] border-amber-300 bg-public-deep shadow-lg" />

          <div className="border-b border-public-deep/15 pb-4">
            <div aria-hidden="true" className="mb-3 h-1 w-10 rounded-full bg-amber-400" />
            <p className="text-xs font-bold uppercase leading-5 tracking-wider text-public-green">
              Ringkasan Open Booking
            </p>
            <h2 id="jadwal-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Jadwal penting
            </h2>
          </div>

          <dl className="divide-y divide-public-deep/10">
            {scheduleItems.map(({ icon: Icon, label, value, note }) => (
              <div key={label} className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-3.5 py-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-public-green shadow-sm shadow-public-deep/10 ring-1 ring-inset ring-public-line">
                  <Icon aria-hidden="true" size={20} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs font-bold uppercase tracking-wider text-public-deep/65">{label}</dt>
                  <dd className="mt-1 text-lg font-extrabold leading-snug tracking-tight text-slate-950">
                    {value}
                  </dd>
                  <dd className="mt-1 text-sm leading-5 text-slate-600">{note}</dd>
                </div>
              </div>
            ))}
          </dl>

          <BookingProgress usedSeats={usedSeats} />
        </aside>
      </div>

      <SectionWave className="text-white" />
    </section>
  );
}
