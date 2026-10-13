import { Camera, FileCheck2, Hash } from 'lucide-react';
import { registrationInfo } from '@/features/home/data';
import SectionHeading from './SectionHeading';

export default function RegistrationPreparation() {
  return (
    <section
      id="berkas"
      aria-labelledby="berkas-title"
      className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeading
            id="berkas-title"
            eyebrow="Persiapan pendaftaran"
            title="Berkas yang Disiapkan"
            description="Siapkan keempat Berkas sebelum mulai mengisi formulir agar proses unggah lebih cepat."
          />
          <div className="mt-6 space-y-3">
            <p className="flex items-start gap-3 rounded-2xl bg-public-tint p-4 text-[0.95rem] leading-7 text-emerald-950">
              <Camera aria-hidden="true" className="mt-1 shrink-0 text-public-green" size={18} />
              Berupa foto atau scan yang jelas dan terbaca, bukan salinan kertas.
            </p>
            <p className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-[0.95rem] leading-7 text-slate-700">
              <Hash aria-hidden="true" className="mt-1 shrink-0 text-amber-600" size={18} />
              NISN anak cukup diisi sebagai nomor di formulir.
            </p>
          </div>
        </div>

        <ol aria-label="Daftar Berkas" className="grid gap-4 sm:grid-cols-2">
          {registrationInfo.berkas.map((item) => (
            <li
              key={item}
              className="flex items-center gap-4 rounded-3xl border border-emerald-900/10 bg-public-canvas p-5 transition-colors hover:border-emerald-300 sm:p-6"
            >
              <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-public-green shadow-sm ring-1 ring-emerald-900/5"
              >
                <FileCheck2 size={22} />
              </span>
              <span className="text-base font-bold text-slate-950">{item}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
