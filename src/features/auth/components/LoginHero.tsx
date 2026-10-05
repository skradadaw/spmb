import React from 'react';
import Image from 'next/image';
import { ShieldCheck, LockKeyhole, Sparkles } from 'lucide-react';

export function LoginHero() {
  return (
    <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#00550B] via-[#007A10] to-[#00A315] p-10 text-white lg:flex lg:w-1/2 lg:p-14 xl:p-16">
      {/* Decorative background blurs and patterns */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl"
      />

      {/* Top Header / Branding */}
      <div className="relative z-10 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/30 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-200 backdrop-blur-md">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          <span>Portal Khusus Panitia SPMB</span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/20 p-1 shadow-lg backdrop-blur-md ring-2 ring-white/30">
            <Image
              src="/logo.png"
              alt="Logo SD Plus 3 Al-Muhajirin"
              width={56}
              height={56}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              SD Plus 3 Al-Muhajirin
            </h1>
            <p className="text-xs font-medium text-emerald-200/90 sm:text-sm">
              Sistem Penerimaan Murid Baru
            </p>
          </div>
        </div>
      </div>

      {/* Centerpiece / Statement */}
      <div className="relative z-10 my-10 space-y-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Keamanan & Privasi Data</span>
        </div>
        <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white lg:text-4xl">
          Kelola data pendaftar dengan aman, cepat, dan transparan.
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-emerald-100/90 sm:text-base">
          Panel administrasi ini memungkinkan panitia memeriksa kelengkapan berkas murid,
          memvalidasi pembayaran, dan memperbarui status pendaftaran secara real-time.
        </p>
      </div>

      {/* Bottom Security Card */}
      <div className="relative z-10 rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-200">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              Akses Khusus & Terproteksi
            </h3>
            <p className="text-xs leading-relaxed text-emerald-100/80">
              Halaman ini dilindungi pembatasan akses. Pastikan tidak membagikan PIN keamanan Anda
              kepada pihak yang tidak berkepentingan demi kerahasiaan data calon murid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
