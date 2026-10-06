import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CircleArrowRight,
  ClipboardCheck,
  GraduationCap,
  LockKeyhole,
  Sparkles,
  WalletCards,
} from 'lucide-react';
import { registrationInfo } from '@/features/home/data';
import { Button } from '@/components/ui/button';
import MobileNavigation from './MobileNavigation';

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
    <header className="sticky top-0 z-40 border-b border-emerald-950/10 bg-white/90 shadow-[0_1px_12px_rgba(6,78,27,0.07)] backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:gap-5 lg:px-8">
        <a
          href="#atas"
          className="group flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#007A10]"
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
            <span className="truncate text-[11px] font-semibold text-[#007A10] sm:text-xs">
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
              className="relative inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-slate-600 transition-colors after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-[#007A10] after:transition-transform hover:text-emerald-900 hover:after:scale-x-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007A10] motion-reduce:after:transition-none"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Button
            variant="ghost"
            render={<Link href="/login" aria-label="Login Panitia" />}
            className="h-[42px] min-w-11 gap-2 rounded-none border-transparent bg-transparent px-2.5 font-semibold whitespace-nowrap text-slate-600 shadow-none hover:border-transparent hover:bg-transparent hover:text-slate-950 focus-visible:border-transparent focus-visible:ring-slate-400/25 sm:ml-1 sm:border-l sm:border-l-slate-200 sm:pl-5 sm:pr-3"
          >
            <LockKeyhole aria-hidden="true" className="size-4 text-slate-600" strokeWidth={2.2} />
            <span className="hidden sm:inline">Login Panitia</span>
          </Button>
          <Button
            render={<Link href="/pendaftaran" aria-label="Daftar Sekarang" />}
            className="h-[42px] gap-2 rounded-full border border-emerald-950/10 bg-[#008A12] px-4.5 font-bold whitespace-nowrap text-white shadow-[0_3px_8px_rgba(0,85,11,0.22)] hover:bg-[#006F0E] hover:text-white hover:shadow-[0_4px_10px_rgba(0,85,11,0.26)] focus-visible:border-emerald-700 focus-visible:ring-[#007A10]/25 sm:px-5"
          >
            <CircleArrowRight aria-hidden="true" className="size-[17px] text-amber-100" strokeWidth={2.4} />
            <span className="hidden sm:inline">Daftar Sekarang</span>
            <span className="sm:hidden">Daftar</span>
          </Button>
        </div>

        <MobileNavigation items={navigationItems} />
      </div>
    </header>
  );
}

function BookingProgress({ completedCount }: { completedCount: number | null }) {
  if (completedCount === null) {
    return (
      <section
        aria-labelledby="capacity-title"
        className="rounded-xl border border-emerald-700/25 bg-gradient-to-r from-emerald-900/15 via-emerald-700/10 to-lime-600/15 p-3.5 shadow-sm shadow-emerald-950/10 ring-1 ring-inset ring-white/25"
      >
        <p id="capacity-title" className="text-sm font-extrabold text-emerald-950">
          Progress peserta
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

  const safeCount = Math.max(0, completedCount);
  const progressValue = Math.min(safeCount, registrationInfo.capacity);
  const percentage = Math.min(100, Math.round((safeCount / registrationInfo.capacity) * 100));
  const label = `${safeCount} dari ${registrationInfo.capacity} peserta telah menyelesaikan pendaftaran`;

  return (
    <section
      aria-labelledby="capacity-title"
      className="rounded-xl border border-emerald-700/25 bg-gradient-to-r from-emerald-900/15 via-emerald-700/10 to-lime-600/15 p-3.5 shadow-sm shadow-emerald-950/10 ring-1 ring-inset ring-white/25"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p id="capacity-title" className="text-sm font-bold text-emerald-950">
          Progress peserta
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#007A10] shadow-sm shadow-emerald-900/5 ring-1 ring-inset ring-emerald-950/10">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00AA13]" />
          </span>
          {safeCount} / {registrationInfo.capacity}
        </span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-emerald-950/20 ring-1 ring-inset ring-emerald-950/5">
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={registrationInfo.capacity}
          aria-valuenow={progressValue}
          className="h-full rounded-full bg-gradient-to-r from-[#007A10] to-emerald-500 transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-2.5 text-xs font-medium leading-relaxed text-emerald-950/80">
        Kuota terbatas! Segera daftarkan putra-putri Ayah & Bunda dan lengkapi berkas sebelum kuota penuh.
      </p>
    </section>
  );
}

export default function HomeHero({ completedCount }: { completedCount: number | null }) {
  return (
    <section id="atas" className="relative isolate overflow-hidden bg-[#064E1B] text-white">
      <div aria-hidden="true" className="hero-grid absolute inset-0 -z-20 opacity-20" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 opacity-25 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]"
      />
      <div aria-hidden="true" className="absolute -left-32 top-16 -z-10 h-80 w-80 rounded-full bg-emerald-300/25 blur-3xl sm:h-96 sm:w-96" />
      <div aria-hidden="true" className="absolute -right-28 -top-24 -z-10 h-96 w-96 rounded-full bg-lime-300/20 blur-3xl sm:h-[30rem] sm:w-[30rem]" />
      <div aria-hidden="true" className="absolute bottom-10 left-1/2 -z-10 h-52 w-52 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />

      <div
        aria-hidden="true"
        className="absolute left-[4%] top-28 hidden h-16 w-16 -rotate-12 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-amber-300 shadow-xl shadow-emerald-950/20 backdrop-blur-md xl:flex"
      >
        <BookOpen size={29} strokeWidth={1.8} />
      </div>
      <div
        aria-hidden="true"
        className="absolute right-[3%] top-36 hidden h-[4.5rem] w-[4.5rem] rotate-12 items-center justify-center rounded-full border border-amber-200/25 bg-amber-300/10 text-amber-200 shadow-xl shadow-emerald-950/20 backdrop-blur-md xl:flex"
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
          <p className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-extrabold tracking-wide text-emerald-50 shadow-lg shadow-emerald-950/10 backdrop-blur-md">
            <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-50 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-300" />
            </span>
            Pendaftaran {registrationInfo.wave.name}
          </p>

          <h1 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-black leading-[1.06] tracking-[-0.03em] text-white sm:mt-6 sm:text-5xl lg:mx-0 lg:text-[3.5rem] xl:text-[3.75rem]">
            Open Booking SD Plus 3 Al-Muhajirin{' '}
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
            <span className="mt-5 block text-xl font-extrabold leading-snug tracking-[-0.015em] text-emerald-100 sm:text-2xl">
              Tahun Pelajaran {registrationInfo.academicYear}
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-emerald-50/90 sm:mt-6 sm:text-lg sm:leading-8 lg:mx-0">
            Temukan seluruh informasi pendaftaran dalam satu halaman, mulai dari jadwal, biaya OKB,
            hingga dokumen yang perlu Ayah dan Bunda siapkan.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row lg:justify-start">
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

        </div>

        <aside
          id="jadwal"
          aria-labelledby="jadwal-title"
          className="relative w-full scroll-mt-24 justify-self-center rounded-[2rem] border border-emerald-100/25 bg-gradient-to-br from-emerald-200/25 via-emerald-100/10 to-lime-200/15 p-4 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl sm:p-5 lg:max-w-[34rem] lg:justify-self-end"
        >
          <span aria-hidden="true" className="absolute -right-3 -top-3 h-7 w-7 rounded-full border-[6px] border-amber-300 bg-[#064E1B] shadow-lg" />
          <span aria-hidden="true" className="absolute -bottom-4 -left-4 hidden h-12 w-12 rounded-2xl border border-white/20 bg-emerald-300/15 backdrop-blur-md sm:block" />

          <div className="relative overflow-hidden rounded-[1.35rem] border border-emerald-200/80 bg-gradient-to-br from-emerald-100 via-green-50 to-lime-100 p-4 text-slate-950 shadow-xl shadow-emerald-950/20 ring-1 ring-emerald-950/5 sm:p-5">
            <span aria-hidden="true" className="absolute -right-14 -top-16 h-40 w-40 rounded-full bg-lime-300/25 blur-3xl" />
            <span aria-hidden="true" className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-emerald-400/25 blur-3xl" />

            <div className="relative border-b border-emerald-900/15 pb-3.5">
              <div aria-hidden="true" className="mb-2.5 h-1 w-10 rounded-full bg-amber-400" />
              <p className="text-xs font-bold uppercase leading-5 tracking-wider text-[#007A10]">
                Ringkasan Open Booking
              </p>
              <h2 id="jadwal-title" className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950">
                Jadwal penting
              </h2>
            </div>

            <dl className="relative divide-y divide-emerald-900/15">
              <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-3 py-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-200/70 text-[#007A10] ring-1 ring-inset ring-emerald-300/70">
                  <CalendarDays aria-hidden="true" size={19} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <dt className="text-sm font-medium text-emerald-950/70">Gelombang 1</dt>
                  <dd className="mt-0.5 text-base font-bold text-slate-900">
                    1 Okt–17 Nov 2026
                  </dd>
                  <dd className="mt-1 text-sm text-slate-600">Periode Open Booking</dd>
                </div>
              </div>

              <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-3 py-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-200/70 text-amber-800 ring-1 ring-inset ring-amber-300/70">
                  <ClipboardCheck aria-hidden="true" size={19} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <dt className="text-sm font-medium text-emerald-950/70">Tes OKB</dt>
                  <dd className="mt-0.5 text-base font-bold text-slate-900">
                    25 November 2026
                  </dd>
                  <dd className="mt-1 text-sm text-slate-600">
                    Jadwal observasi kesiapan belajar
                  </dd>
                </div>
              </div>

              <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-3 py-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-200/70 text-lime-800 ring-1 ring-inset ring-lime-300/70">
                  <WalletCards aria-hidden="true" size={19} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <dt className="text-sm font-medium text-emerald-950/70">Biaya OKB</dt>
                  <dd className="mt-0.5 text-base font-bold text-slate-900">
                    Rp375.000
                  </dd>
                  <dd className="mt-1 text-sm text-slate-600">
                    Simpan bukti pembayaran untuk diunggah saat pendaftaran.
                  </dd>
                </div>
              </div>
            </dl>

            <div className="relative mt-3">
              <BookingProgress completedCount={completedCount} />
            </div>
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
