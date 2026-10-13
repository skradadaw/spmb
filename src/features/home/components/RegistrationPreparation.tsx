import {
  CircleCheck,
  Download,
  FileBadge,
  FolderCheck,
  Hash,
  Landmark,
  ReceiptText,
  ScanLine,
  SquareUserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { registrationInfo } from '@/features/home/data';
import CopyAccountButton from './CopyAccountButton';
import SectionHeading from './SectionHeading';
import { actionClass } from './actionStyles';

const berkasIcons: Record<(typeof registrationInfo.berkas)[number], LucideIcon> = {
  'Akta Kelahiran': FileBadge,
  'Kartu Keluarga': Users,
  'Pas Foto': SquareUserRound,
  'Bukti Pembayaran OKB': ReceiptText,
};

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
      className="relative isolate scroll-mt-24 overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div aria-hidden="true" className="texture-dots absolute inset-x-0 top-0 -z-10 h-64" />
      <div aria-hidden="true" className="absolute -left-28 top-1/3 -z-10 h-80 w-80 rounded-full bg-public-line/35 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-20 -right-24 -z-10 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          id="persiapan-title"
          eyebrow="Persiapan pendaftaran"
          title="Biaya dan Berkas"
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
              <p className="mt-3 border-t border-white/15 pt-3 text-sm text-public-mint">
                a.n. <span className="font-bold text-white">{registrationInfo.okb.accountName}</span>
              </p>
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
                className={actionClass('solidOnDeep', 'lg', 'w-full')}
              >
                <Download aria-hidden="true" /> Unduh Rincian Biaya PDF
              </a>
              <p className="mt-2 text-center text-xs text-public-mint/70">
                Rincian biaya pendidikan Tahun Pelajaran {registrationInfo.academicYear} dalam PDF resmi.
              </p>
            </div>
          </article>

          <article
            aria-labelledby="berkas-title"
            className="relative isolate flex flex-col overflow-hidden rounded-3xl border border-public-deep/10 bg-public-canvas p-6 shadow-sm shadow-public-deep/5 sm:p-8"
          >
            <div aria-hidden="true" className="texture-dots absolute inset-x-0 top-0 -z-10 h-48" />
            <div aria-hidden="true" className="absolute -right-16 -top-16 -z-10 h-56 w-56 rounded-full bg-public-line/40 blur-3xl" />
            <FolderCheck
              aria-hidden="true"
              size={150}
              strokeWidth={1.2}
              className="absolute -right-8 -top-6 -z-10 rotate-12 text-public-green/[0.07]"
            />

            <StepLabel step={2} tone="light" />
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <h3 id="berkas-title" className="text-2xl font-bold text-slate-950">
                Berkas yang Disiapkan
              </h3>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900 ring-1 ring-inset ring-amber-300">
                {registrationInfo.berkas.length} Berkas wajib
              </span>
            </div>

            <ol aria-label="Daftar Berkas" className="mt-6 grid gap-3 sm:grid-cols-2">
              {registrationInfo.berkas.map((item) => {
                const BerkasIcon = berkasIcons[item];
                return (
                  <li
                    key={item}
                    className="group flex items-center gap-3.5 rounded-2xl border border-public-deep/10 bg-white p-4 shadow-sm shadow-public-deep/5 transition duration-200 hover:-translate-y-0.5 hover:border-public-green/30 hover:shadow-md motion-reduce:hover:translate-y-0"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-public-tint text-public-green ring-1 ring-inset ring-public-line transition-colors group-hover:bg-public-green group-hover:text-white"
                    >
                      <BerkasIcon size={21} />
                    </span>
                    <span className="min-w-0 flex-1 text-[0.95rem] font-bold leading-snug text-slate-950">{item}</span>
                    <CircleCheck aria-hidden="true" size={18} className="shrink-0 text-public-green/30" />
                  </li>
                );
              })}
            </ol>

            <div className="mt-auto pt-6">
              <div className="divide-y divide-public-deep/10 rounded-2xl border border-public-deep/10 bg-white/70 backdrop-blur-sm">
                <p className="flex items-start gap-3 p-4 text-sm leading-6 text-slate-700">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-public-tint text-public-green">
                    <ScanLine aria-hidden="true" size={17} />
                  </span>
                  <span className="pt-1">Berupa foto atau scan yang jelas dan terbaca.</span>
                </p>
                <p className="flex items-start gap-3 p-4 text-sm leading-6 text-slate-700">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Hash aria-hidden="true" size={17} />
                  </span>
                  <span className="pt-1">NISN diisi langsung di formulir, tidak perlu diunggah.</span>
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
