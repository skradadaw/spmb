import React from 'react';
import Image from 'next/image';
import { ShieldCheck, LockKeyhole } from 'lucide-react';

export function LoginHero() {
  return (
    <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#00550B] via-[#006E0E] to-[#00AA13] p-10 text-white lg:flex lg:w-1/2 lg:p-14 xl:p-16">
      {/* Soft Ambient Glows (Clean, no noisy dot matrix) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#00AA13]/30 blur-3xl"
      />

      {/* Top Header / Branding */}
      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white/95 backdrop-blur-md">
          <ShieldCheck className="h-4 w-4 text-emerald-200" />
          <span>Portal Khusus Panitia SPMB</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center sm:h-20 sm:w-20">
            <Image
              src="/logo.png"
              alt="Logo SD Plus 3 Al-Muhajirin"
              width={80}
              height={80}
              className="h-full w-full object-contain drop-shadow-md"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              SD Plus 3 Al-Muhajirin
            </h1>
            <p className="text-xs font-semibold text-emerald-100/90 sm:text-sm">
              Sistem Penerimaan Murid Baru
            </p>
            <span className="mt-0.5 inline-block text-[11px] font-medium text-emerald-200/70 uppercase tracking-widest">
              Purwakarta — Jawa Barat
            </span>
          </div>
        </div>
      </div>

      {/* Centerpiece: Clean, Spacious & Professional */}
      <div className="relative z-10 my-auto max-w-lg space-y-4 py-8">
        <h2 className="text-3xl font-black leading-tight tracking-tight text-white lg:text-4xl">
          Kelola data pendaftar dengan aman, cepat, dan transparan.
        </h2>
        <p className="text-sm leading-relaxed text-emerald-50/90 sm:text-base">
          Panel administrasi ini memungkinkan panitia memeriksa kelengkapan berkas murid,
          memvalidasi pembayaran, dan memperbarui status pendaftaran secara real-time.
        </p>
      </div>

      {/* Bottom Security Assurance: Minimalist */}
      <div className="relative z-10 flex items-center gap-3.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur-md shadow-lg">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <div className="text-xs leading-relaxed text-white/95">
          <span className="font-bold text-white">Akses Khusus & Terproteksi.</span>{' '}
          Pastikan tidak membagikan PIN keamanan Anda kepada pihak yang tidak berkepentingan demi kerahasiaan data calon murid.
        </div>
      </div>
    </div>
  );
}
