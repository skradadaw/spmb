'use client';

import dynamic from 'next/dynamic';
import { 
  Sparkles, 
  BookOpen, 
  Pencil, 
  Rocket, 
  Star, 
  GraduationCap, 
  Sun, 
  Palette, 
  Smile, 
  Heart 
} from 'lucide-react';

const RegistrationForm = dynamic(
  () => import('@/features/registration/components/RegistrationForm'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-6xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl p-16 text-center shadow-xl border border-gray-100 min-h-[420px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00AA13] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 font-semibold text-sm">Memuat Formulir Pendaftaran...</p>
      </div>
    ),
  }
);

export default function PendaftaranPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3FAF4] via-[#F8FAF8] to-gray-50 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* ========================================================================= */}
      {/* SOFT PASTEL BACKGROUND GLOWS & SIDE DOODLES                                */}
      {/* ========================================================================= */}
      <div className="absolute top-[-50px] left-1/4 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-20 right-10 w-80 h-80 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/2 left-[-60px] w-80 h-80 bg-sky-200/20 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-40 right-[-40px] w-72 h-72 bg-pink-200/15 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Side Doodles */}
      <div className="pointer-events-none select-none -z-0">
        <div className="absolute top-[38%] left-4 sm:left-10 text-blue-500/20 rotate-45 hidden lg:block">
          <Pencil size={30} strokeWidth={1.8} />
        </div>
        <div className="absolute top-[55%] left-8 text-pink-500/20 -rotate-12 hidden xl:block">
          <Palette size={28} strokeWidth={1.8} />
        </div>
        <div className="absolute top-[40%] right-6 sm:right-12 text-purple-500/20 -rotate-45 hidden lg:block">
          <Rocket size={32} strokeWidth={1.8} />
        </div>
        <div className="absolute top-[58%] right-10 text-emerald-600/20 rotate-12 hidden xl:block">
          <GraduationCap size={30} strokeWidth={1.8} />
        </div>
        <div className="absolute top-44 left-1/3 text-emerald-400/20 rotate-12 hidden sm:block">
          <Star size={16} fill="currentColor" />
        </div>
        <div className="absolute top-36 right-1/3 text-pink-400/20 -rotate-12 hidden sm:block">
          <Heart size={16} fill="currentColor" />
        </div>
        <div className="absolute bottom-24 left-16 text-amber-500/20 rotate-12 hidden md:block">
          <Smile size={26} strokeWidth={1.8} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTENT                                                              */}
      {/* ========================================================================= */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section Framed with Book & Sun */}
        <div className="text-center mb-8 sm:mb-12 relative max-w-xl md:max-w-5xl lg:max-w-6xl mx-auto px-4">
          {/* Top-Left Book Doodle */}
          <div className="absolute -top-3 left-0 sm:left-2 md:-left-6 lg:-left-10 text-emerald-600/30 -rotate-12 pointer-events-none select-none">
            <BookOpen size={34} strokeWidth={1.8} />
          </div>

          {/* Top-Right Sun Doodle */}
          <div className="absolute -top-3 right-0 sm:right-2 md:-right-6 lg:-right-10 text-amber-400/40 rotate-12 pointer-events-none select-none">
            <Sun size={36} strokeWidth={1.8} />
          </div>

          {/* Main Title: 2 lines on mobile, 1 perfect single line on PC/Desktop */}
          <h1 className="text-2xl sm:text-3xl md:text-[34px] lg:text-[40px] xl:text-[44px] font-black tracking-tight text-gray-900 mb-3 leading-snug md:leading-tight md:whitespace-nowrap">
            <span className="block md:inline">Formulir Seleksi </span>
            <span className="block md:inline">Penerimaan Murid Baru</span>
          </h1>

          {/* School & Academic Year */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-base font-semibold text-gray-700 mb-2">
            <span>SD Plus 3 Al-Muhajirin</span>
            <span className="text-[#00AA13]/50 font-bold">|</span>
            <span>Tahun Ajaran 2026/2027</span>
          </div>

          {/* Subtitle Instruction */}
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            Mohon lengkapi data diri calon siswa dengan benar sesuai dengan dokumen asli.
          </p>
        </div>

        {/* Form Container */}
        <RegistrationForm />
      </div>
    </div>
  );
}
