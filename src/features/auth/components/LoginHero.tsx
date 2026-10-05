import React from 'react';
import Image from 'next/image';
import { ShieldCheck, LockKeyhole } from 'lucide-react';

export function LoginHero() {
  return (
    <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#00550B] via-[#006E0E] to-[#00AA13] p-10 text-white lg:flex lg:w-1/2 lg:p-12 xl:p-16">
      {/* Soft Ambient Glows (Clean & Calm) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#00AA13]/30 blur-3xl"
      />

      {/* Top Header / Branding */}
      <div className="relative z-10 space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-white/95 backdrop-blur-md">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
          <span>Portal Khusus Panitia SPMB</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center sm:h-18 sm:w-18">
            <Image
              src="/logo.png"
              alt="Logo SD Plus 3 Al-Muhajirin"
              width={72}
              height={72}
              className="h-full w-full object-contain drop-shadow-md"
              priority
            />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              SD Plus 3 Al-Muhajirin
            </h1>
            <p className="text-xs font-medium text-emerald-100/90 sm:text-sm">
              Sistem Penerimaan Murid Baru
            </p>
            <span className="inline-block text-[11px] font-semibold text-emerald-200/75 uppercase tracking-wider">
              Purwakarta — Jawa Barat
            </span>
          </div>
        </div>
      </div>

      {/* Centerpiece: Clean, Spacious & Proportional Typography */}
      <div className="relative z-10 my-auto max-w-lg space-y-3.5 py-8">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[34px] lg:leading-[1.25]">
          Kelola data pendaftar dengan aman, cepat, dan transparan.
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-emerald-50/85 font-normal">
          Panel administrasi ini memungkinkan panitia memeriksa kelengkapan berkas murid,
          memvalidasi pembayaran, dan memperbarui status pendaftaran secara real-time.
        </p>
      </div>

      {/* Bottom Security Assurance: Structured & Balanced */}
      <div className="relative z-10 flex items-start gap-3.5 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md shadow-lg">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white mt-0.5">
          <LockKeyhole className="h-4 w-4" />
        </div>
        <div className="space-y-1 text-xs">
          <h3 className="font-semibold text-white tracking-wide">
            Akses Khusus & Terproteksi
          </h3>
          <p className="leading-relaxed text-emerald-100/80">
            Pastikan tidak membagikan PIN keamanan Anda kepada pihak yang tidak berkepentingan demi kerahasiaan data calon murid.
          </p>
        </div>
      </div>
    </div>
  );
}
