import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

export function LoginHero() {
  return (
    <aside
      aria-labelledby="login-hero-title"
      className="relative hidden min-h-screen w-1/2 overflow-hidden bg-[#064A18] text-white lg:block"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(0,170,19,0.34),transparent_32%),radial-gradient(circle_at_88%_84%,rgba(16,185,129,0.22),transparent_36%),linear-gradient(135deg,#064A18_0%,#075C1C_52%,#087A20_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom_right,black,transparent_78%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-16 h-64 w-64 rotate-12 rounded-[3rem] border border-white/8 bg-white/[0.025]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 top-32 h-64 w-64 rotate-12 rounded-[3rem] border border-white/7" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-9rem] left-[-7rem] h-80 w-80 rounded-full border border-white/8" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-px bg-white/15" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl items-center px-12 py-10 xl:px-16 xl:py-12">
        <div className="w-full max-w-xl space-y-10 xl:space-y-12">
          <header className="w-fit">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center">
                <span aria-hidden="true" className="absolute inset-2 rounded-full bg-emerald-300/12 blur-xl" />
                <span aria-hidden="true" className="absolute inset-1 rounded-full border border-emerald-200/12" />
                <Image
                  src="/logo.png"
                  alt="Logo SD Plus 3 Al-Muhajirin"
                  width={88}
                  height={88}
                  className="relative h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,32,7,0.48)]"
                  priority
                />
              </div>

              <span aria-hidden="true" className="h-12 w-px shrink-0 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

              <div className="min-w-0 space-y-2">
                <p className="truncate text-[1.3rem] font-bold leading-none tracking-[-0.025em] text-white xl:text-[1.4rem]">
                  SD PLUS 3 AL-MUHAJIRIN
                </p>
                <p className="text-[0.65rem] font-semibold uppercase leading-none tracking-[0.14em] text-emerald-100/75 xl:text-[0.7rem]">
                  Sistem Penerimaan Murid Baru
                </p>
              </div>
            </div>
          </header>

          <div>
            <div className="max-w-lg">
              <h1
                id="login-hero-title"
                className="text-[2.7rem] font-extrabold leading-[1.08] tracking-[-0.045em] text-white text-balance xl:text-[3.5rem]"
              >
                Panel Administrasi SPMB
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/78 xl:text-[15px] xl:leading-7">
                Digunakan panitia untuk meninjau data pendaftar dan kelengkapan berkas calon murid.
              </p>
            </div>
          </div>

          <div className="max-w-xl rounded-2xl border border-white/20 bg-emerald-950/20 p-4 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.5)] backdrop-blur-md xl:p-5">
            <div className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-100 ring-1 ring-white/15">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
              <h2 className="text-xs font-bold text-white">Akses khusus panitia</h2>
              <p className="mt-1 text-[11px] leading-5 text-white/70">
                Jangan bagikan PIN akses kepada pihak lain demi menjaga keamanan data calon siswa.
              </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
