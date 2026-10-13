import Link from 'next/link';
import { ArrowRight, Clock3 } from 'lucide-react';
import { contactInfo, registrationInfo } from '@/features/home/data';
import { WhatsAppLink } from './ContactLinks';
import Eyebrow from './Eyebrow';
import { actionClass } from './actionStyles';

export default function ClosingCta() {
  return (
    <section
      aria-labelledby="cta-title"
      className="bg-public-canvas px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8"
    >
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-public-deep px-6 py-12 text-white shadow-2xl shadow-public-deep/40 sm:px-10 sm:py-16 lg:px-16">
        <div aria-hidden="true" className="hero-grid absolute inset-0 -z-10 opacity-20" />
        <div aria-hidden="true" className="absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-public-line/20 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-24 left-1/3 -z-10 h-56 w-56 rounded-full bg-amber-300/15 blur-3xl" />

        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-12">
          <div>
            <Eyebrow tone="dark">
              {registrationInfo.wave.name} Tahun Pelajaran {registrationInfo.academicYear}
            </Eyebrow>
            <h2
              id="cta-title"
              className="mt-3 max-w-2xl text-balance text-3xl font-black tracking-[-0.02em] sm:text-4xl"
            >
              Siap melanjutkan Open Booking Pendaftaran?
            </h2>
            <p className="mt-4 max-w-[60ch] text-base leading-7 text-public-mint/85">
              Pastikan keempat Berkas sudah siap, lalu isi formulir dengan data yang benar.
              Kuota setiap Pilihan Kelas terbatas.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/pendaftaran"
              className={actionClass('accent')}
            >
              Mulai Pendaftaran <ArrowRight aria-hidden="true" />
            </Link>
            <WhatsAppLink className={actionClass('outlineOnDeep')}>
              Tanya via WhatsApp
            </WhatsAppLink>
          </div>
          {/* Stands in for the FAQ contact card, which is hidden below lg */}
          <div className="border-t border-white/15 pt-5 lg:hidden">
            <p className="font-bold">Masih ada pertanyaan?</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-public-mint">
              <Clock3 aria-hidden="true" size={16} className="shrink-0 text-amber-300" />
              Layanan panitia {contactInfo.serviceDays}, pukul {contactInfo.serviceHours}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
