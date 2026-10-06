import Link from 'next/link';
import { ArrowRight, FileCheck2 } from 'lucide-react';
import HomeHero, { HomeHeader } from './HomeHero';
import PaymentInformation from './PaymentInformation';
import RegistrationPreparation from './RegistrationPreparation';
import RegistrationSteps from './RegistrationSteps';
import { registrationInfo } from '../data';

export default function LandingPage({ completedCount }: { completedCount: number | null }) {
  return (
    <div className="min-h-screen bg-[#F7F8F4] text-slate-950">
      <a
        href="#konten-utama"
        className="sr-only fixed left-4 top-4 z-50 rounded-lg bg-slate-950 px-4 py-3 font-bold text-white focus:not-sr-only"
      >
        Lewati ke konten utama
      </a>
      <HomeHeader />
      <main id="konten-utama">
        <HomeHero completedCount={completedCount} />
        <RegistrationSteps />
        <PaymentInformation />
        <RegistrationPreparation />
        <section className="bg-white px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#075B1B] px-6 py-12 text-white shadow-[0_24px_60px_-28px_rgba(0,75,18,0.7)] sm:px-10 sm:py-16 lg:px-16">
            <div aria-hidden="true" className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[44px] border-white/5" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <FileCheck2 aria-hidden="true" className="text-amber-300" size={36} />
                <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
                  Siap melanjutkan Open Booking Pendaftaran?
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-emerald-50">
                  Pastikan dokumen dan bukti pembayaran telah disiapkan, lalu isi formulir
                  Tahun Pelajaran {registrationInfo.academicYear} dengan data yang benar.
                </p>
              </div>
              <Link
                href="/pendaftaran"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#007A10] px-6 py-3 text-base font-extrabold text-white shadow-lg shadow-emerald-950/30 ring-1 ring-white/30 transition-colors hover:bg-[#00550B] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Mulai Pendaftaran <ArrowRight aria-hidden="true" size={19} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-800 bg-slate-950 px-4 py-10 text-center text-sm text-slate-400">
        <p className="font-bold text-white">SD Plus 3 Al-Muhajirin</p>
        <p className="mt-2">Open Booking Pendaftaran · {registrationInfo.academicYear}</p>
      </footer>
    </div>
  );
}
