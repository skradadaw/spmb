import React from 'react';
import Image from 'next/image';
import { ShieldCheck, LockKeyhole, Sparkles, Database, FileCheck2, Cpu } from 'lucide-react';

export function LoginHero() {
  return (
    <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#012211] p-10 text-white lg:flex lg:w-1/2 lg:p-14 xl:p-16">
      {/* Background Tech Mesh & Radial Gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px] opacity-15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-teal-400/15 blur-[100px]"
      />

      {/* Top Header / Branding with Clear Sized Logo */}
      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-200 backdrop-blur-md shadow-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Portal Khusus Panitia SPMB</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1.5 shadow-2xl ring-4 ring-emerald-400/30">
            <Image
              src="/logo.png"
              alt="Logo SD Plus 3 Al-Muhajirin"
              width={80}
              height={80}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              SD Plus 3 Al-Muhajirin
            </h1>
            <p className="text-xs font-semibold text-emerald-300/90 sm:text-sm">
              Sistem Penerimaan Murid Baru
            </p>
            <span className="mt-1 inline-block text-[11px] font-medium text-emerald-200/60 uppercase tracking-widest">
              Purwakarta — Jawa Barat
            </span>
          </div>
        </div>
      </div>

      {/* Centerpiece / Modern Tech Highlights */}
      <div className="relative z-10 my-8 space-y-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>Keamanan & Privasi Data</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-black leading-tight tracking-tight text-white lg:text-4xl">
            Kelola data pendaftar dengan aman, cepat, dan transparan.
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-emerald-100/80 sm:text-base">
            Panel administrasi ini memungkinkan panitia memeriksa kelengkapan berkas murid,
            memvalidasi pembayaran, dan memperbarui status pendaftaran secara real-time.
          </p>
        </div>

        {/* Feature Cards Grid (Modern Tech Style) */}
        <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3.5 backdrop-blur-md">
            <Database className="h-4 w-4 text-emerald-400 mb-1.5" />
            <div className="text-xs font-bold text-white">Database Terenkripsi</div>
            <div className="text-[11px] text-emerald-200/70">Data siswa terproteksi</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3.5 backdrop-blur-md">
            <FileCheck2 className="h-4 w-4 text-emerald-400 mb-1.5" />
            <div className="text-xs font-bold text-white">Verifikasi Instan</div>
            <div className="text-[11px] text-emerald-200/70">Validasi berkas & slip</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3.5 backdrop-blur-md">
            <Cpu className="h-4 w-4 text-emerald-400 mb-1.5" />
            <div className="text-xs font-bold text-white">Anti Brute-Force</div>
            <div className="text-[11px] text-emerald-200/70">Rate limiting cerdas</div>
          </div>
        </div>
      </div>

      {/* Bottom Security Card */}
      <div className="relative z-10 rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30">
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
