import { Download, FileText, Landmark, ShieldCheck } from 'lucide-react';
import { registrationInfo } from '@/features/home/data';
import CopyAccountButton from './CopyAccountButton';

export default function PaymentInformation() {
  return (
    <section
      id="biaya"
      aria-labelledby="payment-title"
      className="scroll-mt-24 bg-[#F5F8F2] px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#007A10]">
              Biaya dan rekening
            </p>
            <h2 id="payment-title" className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Informasi pembayaran yang perlu disiapkan
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-slate-700 lg:justify-self-end">
            Pembayaran OKB dilakukan melalui rekening resmi sekolah. Rincian biaya pendidikan
            tersedia pada dokumen PDF resmi.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <article className="overflow-hidden rounded-[2rem] bg-[#075B1B] p-6 text-white shadow-xl shadow-emerald-950/15 sm:p-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-emerald-100">
                  <Landmark aria-hidden="true" size={18} /> Rekening pembayaran OKB
                </p>
                <p className="mt-4 text-base text-emerald-100">{registrationInfo.okb.bank}</p>
                <p className="mt-1 select-all font-mono text-3xl font-black tracking-wider sm:text-4xl">
                  {registrationInfo.okb.accountNumber}
                </p>
                <p className="mt-4 text-base text-emerald-50">
                  Nominal: <strong>{registrationInfo.okb.fee}</strong>
                </p>
              </div>
              <CopyAccountButton accountNumber={registrationInfo.okb.accountNumber} />
            </div>
          </article>

          <article className="flex flex-col justify-between rounded-[2rem] border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-200 text-amber-900">
                <FileText aria-hidden="true" size={24} />
              </span>
              <h3 className="mt-5 text-2xl font-black text-slate-950">Rincian biaya resmi</h3>
              <p className="mt-3 text-base leading-7 text-slate-700">
                Unduh dokumen registrasi Tahun Pelajaran {registrationInfo.academicYear} untuk
                melihat rincian biaya secara lengkap.
              </p>
              <p className="mt-4 flex items-start gap-2 text-sm font-semibold text-emerald-900">
                <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
                Dokumen PDF resmi dari SD Plus 3 Al-Muhajirin.
              </p>
            </div>
            <a
              href={registrationInfo.feeDocument}
              download
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-base font-extrabold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
            >
              <Download aria-hidden="true" size={19} /> Unduh Rincian Biaya PDF
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
