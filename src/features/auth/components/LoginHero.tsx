import React from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

export function LoginHero() {
  return (
    <div className="flex w-full flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-left">
      <div className="space-y-2">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#00880F]">
          Portal Khusus Panitia SPMB
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-[40px] lg:leading-[1.18]">
          Selamat datang di <br />
          <span className="text-[#00AA13]">SD Plus 3 Al-Muhajirin</span>
        </h1>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Purwakarta — Jawa Barat
        </p>
      </div>

      {/* Official School Logo replacing the GoFood illustration */}
      <div className="my-8 flex h-48 w-48 sm:h-56 sm:w-56 items-center justify-center">
        <Image
          src="/logo.png"
          alt="Logo SD Plus 3 Al-Muhajirin"
          width={220}
          height={220}
          className="h-full w-full object-contain drop-shadow-sm"
          priority
        />
      </div>

      {/* Security note matching test assertions */}
      <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200/80 px-4 py-2.5 text-xs text-gray-600 shadow-xs">
        <ShieldCheck className="h-4 w-4 text-[#00AA13] shrink-0" />
        <span>
          <strong className="font-semibold text-gray-800">Akses Khusus & Terproteksi.</strong>{' '}
          Pastikan tidak membagikan PIN keamanan Anda kepada pihak yang tidak berkepentingan demi kerahasiaan data calon murid.
        </span>
      </div>
    </div>
  );
}
