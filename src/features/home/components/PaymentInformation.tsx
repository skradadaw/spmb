import { Download, FileText, Landmark, ShieldCheck } from 'lucide-react';
import { registrationInfo } from '@/features/home/data';
import CopyAccountButton from './CopyAccountButton';
import SectionHeading from './SectionHeading';

export default function PaymentInformation() {
  return (
    <section
      id="biaya"
      aria-labelledby="payment-title"
      className="relative isolate scroll-mt-24 overflow-hidden bg-public-deep px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8"
    >
      <div aria-hidden="true" className="hero-grid absolute inset-0 -z-10 opacity-20" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-20 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
      />
      <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-lime-300/15 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-32 -left-24 -z-10 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="payment-title"
          tone="dark"
          eyebrow="Biaya dan rekening"
          title="Pembayaran OKB"
          description="Pembayaran OKB dilakukan melalui rekening resmi sekolah. Rincian biaya pendidikan tersedia dalam PDF resmi."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="flex flex-col rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl shadow-emerald-950/30 backdrop-blur-md sm:p-8">
            <p className="flex items-center gap-2 text-sm font-bold text-emerald-100">
              <Landmark aria-hidden="true" size={18} className="text-amber-300" /> Rekening pembayaran OKB
            </p>
            <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-base text-emerald-100">{registrationInfo.okb.bank}</p>
                <p className="mt-1 select-all break-all font-mono text-3xl font-black tracking-wider sm:text-4xl">
                  {registrationInfo.okb.accountNumber}
                </p>
              </div>
              <CopyAccountButton accountNumber={registrationInfo.okb.accountNumber} />
            </div>
            <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-white/15 pt-5 lg:mt-auto">
              <span className="text-sm font-semibold text-emerald-100">Nominal</span>
              <strong className="text-2xl font-black text-amber-300">{registrationInfo.okb.fee}</strong>
            </div>
          </article>

          <article className="flex flex-col justify-between rounded-3xl bg-white p-6 text-slate-950 shadow-2xl shadow-emerald-950/30 sm:p-8">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                <FileText aria-hidden="true" size={24} />
              </span>
              <h3 className="mt-5 text-xl font-bold">Rincian biaya resmi</h3>
              <p className="mt-2 text-[0.95rem] leading-7 text-slate-600">
                Unduh PDF registrasi Tahun Pelajaran {registrationInfo.academicYear} untuk
                melihat rincian biaya secara lengkap.
              </p>
              <p className="mt-4 flex items-start gap-2 text-sm font-semibold text-public-green">
                <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
                PDF resmi dari SD Plus 3 Al-Muhajirin.
              </p>
            </div>
            <a
              href={registrationInfo.feeDocument}
              download
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-public-green px-6 py-3 text-base font-bold text-white transition-colors hover:bg-public-green-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-green"
            >
              <Download aria-hidden="true" size={19} /> Unduh Rincian Biaya PDF
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
