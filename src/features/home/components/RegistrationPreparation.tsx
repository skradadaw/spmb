import { Camera, Download, FileCheck2, Hash, Landmark } from 'lucide-react';
import { registrationInfo } from '@/features/home/data';
import CopyAccountButton from './CopyAccountButton';
import SectionHeading from './SectionHeading';

function StepLabel({ step, tone }: { step: number; tone: 'light' | 'dark' }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
        tone === 'dark' ? 'bg-amber-300 text-public-deep' : 'bg-public-tint text-public-green'
      }`}
    >
      Langkah {step}
    </span>
  );
}

export default function RegistrationPreparation() {
  return (
    <section
      id="persiapan"
      aria-labelledby="persiapan-title"
      className="relative scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="persiapan-title"
          eyebrow="Persiapan pendaftaran"
          title="Biaya & Berkas"
          description="Bayar biaya OKB lebih dulu, lalu siapkan keempat Berkas sebelum mulai mengisi formulir."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article
            aria-labelledby="pembayaran-title"
            className="relative isolate flex flex-col overflow-hidden rounded-3xl bg-public-deep p-6 text-white shadow-xl shadow-public-deep/20 sm:p-8"
          >
            <div aria-hidden="true" className="hero-grid absolute inset-0 -z-10 opacity-25" />
            <StepLabel step={1} tone="dark" />
            <h3 id="pembayaran-title" className="mt-4 text-2xl font-bold">
              Pembayaran OKB
            </h3>

            <div className="mt-6 rounded-2xl bg-white/10 p-5 ring-1 ring-inset ring-white/15">
              <p className="flex items-center gap-2 text-sm font-semibold text-public-mint">
                <Landmark aria-hidden="true" size={17} className="text-amber-300" />
                {registrationInfo.okb.bank}
              </p>
              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="select-all break-all font-mono text-3xl font-black tracking-wider">
                  {registrationInfo.okb.accountNumber}
                </p>
                <CopyAccountButton accountNumber={registrationInfo.okb.accountNumber} />
              </div>
            </div>

            <div className="mt-5 flex items-baseline justify-between gap-4">
              <span className="text-sm font-semibold text-public-mint">Nominal</span>
              <strong className="text-2xl font-black text-amber-300">{registrationInfo.okb.fee}</strong>
            </div>
            <p className="mt-2 text-sm leading-6 text-public-mint/80">
              Simpan bukti transfer, karena akan diunggah sebagai Bukti Pembayaran OKB.
            </p>

            <div className="mt-auto pt-7">
              <a
                href={registrationInfo.feeDocument}
                download
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-base font-bold text-public-deep tap-press hover:bg-public-tint active:bg-public-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Download aria-hidden="true" size={19} /> Unduh Rincian Biaya PDF
              </a>
              <p className="mt-2 text-center text-xs text-public-mint/70">
                Rincian biaya pendidikan Tahun Pelajaran {registrationInfo.academicYear} dalam PDF resmi.
              </p>
            </div>
          </article>

          <article
            aria-labelledby="berkas-title"
            className="flex flex-col rounded-3xl border border-public-deep/10 bg-public-canvas p-6 sm:p-8"
          >
            <StepLabel step={2} tone="light" />
            <h3 id="berkas-title" className="mt-4 text-2xl font-bold text-slate-950">
              Berkas yang Disiapkan
            </h3>

            <ol aria-label="Daftar Berkas" className="mt-6 grid gap-3 sm:grid-cols-2">
              {registrationInfo.berkas.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-public-deep/10 bg-white p-4"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-public-tint text-public-green"
                  >
                    <FileCheck2 size={20} />
                  </span>
                  <span className="text-[0.95rem] font-bold text-slate-950">{item}</span>
                </li>
              ))}
            </ol>

            <div className="mt-auto space-y-3 pt-6">
              <p className="flex items-start gap-3 text-[0.95rem] leading-7 text-slate-700">
                <Camera aria-hidden="true" className="mt-1 shrink-0 text-public-green" size={18} />
                Berupa foto atau scan yang jelas dan terbaca.
              </p>
              <p className="flex items-start gap-3 text-[0.95rem] leading-7 text-slate-700">
                <Hash aria-hidden="true" className="mt-1 shrink-0 text-amber-600" size={18} />
                NISN diisi langsung di formulir, tidak perlu diunggah.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
