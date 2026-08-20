import Link from 'next/link';
import { ArrowRight, FileCheck2 } from 'lucide-react';
import HomeHero, { HomeHeader } from '@/features/home/components/HomeHero';
import PaymentInformation from '@/features/home/components/PaymentInformation';
import RegistrationPreparation from '@/features/home/components/RegistrationPreparation';
import { registrationInfo } from '@/features/home/data';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-950">
      <HomeHeader />
      <main>
        <HomeHero />
        <PaymentInformation />
        <RegistrationPreparation />
        <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#00550B] via-[#007A10] to-[#00A315] px-6 py-12 text-center text-white shadow-2xl shadow-emerald-900/20 sm:px-10 sm:py-16">
            <FileCheck2 className="mx-auto text-emerald-200" size={38} />
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Sudah siap mendaftarkan putra-putri Anda?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-emerald-50">
              Pastikan dokumen telah disiapkan, lalu isi formulir SPMB {registrationInfo.academicYear}{' '}
              dengan data yang benar.
            </p>
            <Link
              href="/pendaftaran"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-black text-[#007A10] shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Mulai Pendaftaran <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-gray-100 bg-gray-950 px-4 py-10 text-center text-sm text-gray-400">
        <p className="font-bold text-white">SD Plus 3 Al-Muhajirin</p>
        <p className="mt-2">SPMB Tahun Ajaran {registrationInfo.academicYear}</p>
      </footer>
    </div>
  );
}
