import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export function MobileLoginHeader() {
  return (
    <header
      data-testid="mobile-login-header"
      className="relative isolate flex min-h-[42dvh] flex-col overflow-hidden bg-[#064A18] px-5 pb-14 pt-[max(0.75rem,env(safe-area-inset-top))] text-white sm:px-10 lg:hidden"
    >
      {/* Latar: mengikuti bahasa visual hero desktop. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_62%,rgba(0,170,19,0.34),transparent_42%),radial-gradient(circle_at_100%_0%,rgba(16,185,129,0.22),transparent_45%),linear-gradient(160deg,#064A18_0%,#075C1C_55%,#087A20_100%)]" />
        <div className="absolute inset-0 opacity-50 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_65%)]" />
        <div className="absolute -right-20 -top-10 h-52 w-52 rotate-12 rounded-[2.75rem] border border-white/10 bg-white/[0.03]" />
        <div className="absolute -right-8 top-6 h-52 w-52 rotate-12 rounded-[2.75rem] border border-white/[0.06]" />
      </div>

      <div className="flex items-center justify-between">
        <Link
          href="/"
          aria-label="Kembali ke beranda SPMB"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/15 active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50 ring-1 ring-white/15 backdrop-blur-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
          Akses Admin
        </span>
      </div>

      <div className="mt-auto pt-10">
        {/* Logo sebagai pusat cincin yang memancar ke latar. */}
        <div className="relative h-16 w-16">
          <span aria-hidden="true" className="absolute -inset-5 rounded-full border border-white/[0.14]" />
          <span aria-hidden="true" className="absolute -inset-12 rounded-full border border-white/[0.08]" />
          <span aria-hidden="true" className="absolute -inset-20 rounded-full border border-white/[0.05]" />
          <span aria-hidden="true" className="absolute -inset-2 rounded-full bg-[#00AA13]/35 blur-xl" />
          <span aria-hidden="true" className="absolute -inset-1.5 rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur-sm" />
          <Image
            src="/logo.png"
            alt="Logo SD Plus 3 Al-Muhajirin"
            width={64}
            height={64}
            className="relative h-16 w-16 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.3)]"
            priority
          />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-200">
          SD Plus 3 Al-Muhajirin <span aria-hidden="true" className="text-emerald-200/50">·</span> SPMB
        </p>
        <h1 className="mt-1.5 text-[1.875rem] font-extrabold leading-[1.1] tracking-[-0.04em]">Masuk Panel Admin</h1>
        <p className="mt-2 text-sm leading-6 text-white/75">Masukkan PIN Admin untuk melanjutkan.</p>
      </div>
    </header>
  );
}
