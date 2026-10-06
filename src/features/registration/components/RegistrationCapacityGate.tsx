import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, PhoneCall } from 'lucide-react';
import { REGISTRATION_CAPACITY } from '@/lib/registrationConfig';

interface RegistrationCapacityGateProps {
  isFull: boolean;
  children: React.ReactNode;
}

export default function RegistrationCapacityGate({
  isFull,
  children,
}: RegistrationCapacityGateProps) {
  if (!isFull) {
    return <>{children}</>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-12 text-center shadow-xl border border-amber-100 relative overflow-hidden">
      <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-200/60">
        <AlertCircle size={32} strokeWidth={2} />
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
        Kuota pendaftaran sudah penuh
      </h2>

      <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8">
        Mohon maaf, kuota pendaftaran telah mencapai batas maksimal{' '}
        <span className="font-semibold text-gray-900">{REGISTRATION_CAPACITY} peserta</span>.
        Formulir pendaftaran saat ini telah ditutup secara otomatis. Silakan hubungi panitia
        SPMB SD Plus 3 Al-Muhajirin jika Anda memerlukan bantuan atau informasi lebih lanjut.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#00AA13] text-white text-sm font-semibold hover:bg-[#008f10] transition-colors shadow-md shadow-emerald-600/20"
        >
          <PhoneCall size={16} />
          Hubungi Panitia
        </a>
      </div>
    </div>
  );
}
