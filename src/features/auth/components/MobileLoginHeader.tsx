import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { registrationInfo } from '@/features/home/data';

export function MobileLoginHeader() {
  return (
    <header
      data-testid="mobile-login-header"
      className="relative isolate overflow-hidden rounded-b-[2rem] bg-brand-green px-5 pb-20 pt-[max(0.75rem,env(safe-area-inset-top))] text-center text-white sm:px-10 lg:hidden"
    >
      {/* Dekorasi: cincin besar di kanan atas dan lingkaran samar di kiri. */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-28 -z-10 h-80 w-80 rounded-full border-[2.5rem] border-white/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 top-44 -z-10 h-40 w-40 rounded-full bg-white/10" />

      <div className="flex h-11 items-center">
        <Link
          href="/"
          aria-label="Kembali ke beranda SPMB"
          className="tap-press flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl shadow-public-deep/30">
        <Image src="/logo.png" alt="Logo SD Plus 3 Al-Muhajirin" width={80} height={80} className="h-20 w-20 object-contain" priority />
      </div>

      <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.08em] text-white/90">
        SPMB {registrationInfo.academicYear} · Panel Admin
      </p>
      <h1 className="mt-1.5 text-[1.625rem] font-extrabold leading-tight tracking-[-0.03em]">SD Plus 3 Al-Muhajirin</h1>
      <p className="mt-1.5 text-sm text-white/90">Masuk untuk mengelola pendaftaran murid baru.</p>
    </header>
  );
}
