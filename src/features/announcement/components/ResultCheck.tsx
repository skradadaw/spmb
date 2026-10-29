'use client';

import { useActionState, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { format, parse } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { ArrowLeft, CalendarDays, Check, CircleAlert, Clock3, Copy, Download, FileSearch, Hourglass, Info, Loader2, MessageCircle, PartyPopper, ShieldCheck, XCircle } from 'lucide-react';
import { contactInfo, registrationInfo } from '@/features/home/data';
import { actionClass } from '@/features/home/components/actionStyles';
import { formatProperName } from '@/lib/properName';
import { cn } from '@/lib/utils';
import { checkResultAction } from '../actions';
import type { ResultCheckApplicant, ResultCheckState, ResultView } from '../contracts';
import { RESULT_CHECK_WINDOW_SECONDS } from '../resultCheck';

const initialState: ResultCheckState = { view: null, nomorPendaftaran: '', tanggalLahir: '' };
const FIELD = 'h-12 w-full rounded-xl border border-public-deep/15 bg-white px-4 text-base text-slate-900 shadow-xs outline-none transition-colors placeholder:text-slate-400 focus:border-public-green focus:ring-2 focus:ring-public-green/20';

/** Halaman publik Cek Hasil OKB: orang tua cukup memasukkan Nomor Pendaftaran dan tanggal lahir anak. */
export function ResultCheck() {
  const [state, formAction, pending] = useActionState(checkResultAction, initialState);
  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      <form action={formAction} className="space-y-4 rounded-3xl border border-public-deep/10 bg-white p-5 shadow-sm sm:p-7">
        <div className="space-y-1.5">
          <label htmlFor="nomor-pendaftaran" className="text-sm font-semibold text-slate-800">Nomor Pendaftaran</label>
          <input
            id="nomor-pendaftaran"
            name="nomorPendaftaran"
            defaultValue={state.nomorPendaftaran}
            placeholder="OB-2027-001"
            autoComplete="off"
            autoCapitalize="characters"
            required
            className={cn(FIELD, 'font-mono uppercase tracking-wide')}
          />
          <p className="text-xs text-slate-500">Tertera di Bukti Pendaftaran yang diterima saat mendaftar.</p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="tanggal-lahir" className="text-sm font-semibold text-slate-800">Tanggal lahir anak</label>
          <input id="tanggal-lahir" name="tanggalLahir" type="date" defaultValue={state.tanggalLahir} required className={FIELD} />
        </div>
        <button type="submit" disabled={pending} className={actionClass('primary', 'lg', 'w-full disabled:opacity-70')}>
          {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : <FileSearch aria-hidden="true" />}
          {pending ? 'Memeriksa...' : 'Cek Hasil'}
        </button>
        <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-public-green" />
          Tanggal lahir diminta agar hasil Ananda hanya dapat dilihat oleh keluarga sendiri.
        </p>
      </form>

      {state.view && <div aria-live="polite"><ResultCard view={state.view} credentials={state} /></div>}

      <Link href="/" className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-public-green hover:text-public-green-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-public-green">
        <ArrowLeft aria-hidden="true" className="size-4" />Kembali ke beranda
      </Link>
    </div>
  );
}

type Credentials = Pick<ResultCheckState, 'nomorPendaftaran' | 'tanggalLahir'>;

function ResultCard({ view, credentials }: { view: ResultView; credentials: Credentials }) {
  switch (view.kind) {
    case 'invalid':
      return <Notice tone="warning" icon={<CircleAlert />} title={view.message} />;
    case 'not-found':
      return <Notice tone="warning" icon={<CircleAlert />} title="Data tidak ditemukan" body="Periksa kembali Nomor Pendaftaran dan tanggal lahir anak, lalu coba lagi." />;
    case 'locked':
      return <Notice tone="danger" icon={<Clock3 />} title="Terlalu banyak percobaan" body={`Demi keamanan, pengecekan dikunci sementara. Silakan coba lagi dalam ${RESULT_CHECK_WINDOW_SECONDS / 60} menit.`} />;
    case 'cancelled':
      return (
        <Notice tone="danger" icon={<XCircle />} title="Pendaftaran dibatalkan" applicant={view.applicant} body="Pendaftaran Ananda sudah dibatalkan. Silakan hubungi panitia untuk informasi lebih lanjut.">
          <ContactPanitia />
        </Notice>
      );
    case 'stage':
      return <StageCard view={view} />;
    case 'accepted':
      return <AcceptedCard view={view} credentials={credentials} />;
    case 'rejected':
      return (
        <Notice tone="neutral" icon={<Info />} title="Ananda belum dapat kami terima" applicant={view.applicant} body={`Mohon maaf, berdasarkan hasil OKB Ananda belum dapat kami terima di SD Plus 3 Al-Muhajirin tahun ajaran ${registrationInfo.academicYear}. Terima kasih atas kepercayaan Bapak/Ibu kepada kami.`}>
          <ContactPanitia />
        </Notice>
      );
  }
}

function AcceptedCard({ view, credentials }: { view: Extract<ResultView, { kind: 'accepted' }>; credentials: Credentials }) {
  return (
    <Notice tone="success" icon={<PartyPopper />} title="Selamat, Ananda Diterima" applicant={view.applicant} body={`Ananda diterima sebagai Peserta Didik Baru SD Plus 3 Al-Muhajirin tahun ajaran ${registrationInfo.academicYear}.`}>
      <dl className="mt-4 divide-y divide-public-deep/10 overflow-hidden rounded-2xl border border-public-deep/10 bg-white">
        {view.kelasPenempatan && (
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <dt className="text-xs text-slate-500">Kelas Penempatan</dt>
            <dd className="text-sm font-bold text-slate-900">{view.kelasPenempatan}</dd>
          </div>
        )}
        {view.kelasTujuan && (
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <dt className="text-xs text-slate-500">Kelas Tujuan</dt>
            <dd className="text-sm font-bold text-slate-900">Kelas {view.kelasTujuan}</dd>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <dt className="text-xs text-slate-500">Nomor VA Daftar Ulang</dt>
          <dd className="flex items-center gap-2">
            {view.nomorVa
              ? <><span className="font-mono text-base font-bold tracking-wide text-slate-900">{view.nomorVa}</span><CopyVaButton nomorVa={view.nomorVa} /></>
              : <span className="text-sm font-medium text-amber-700">Sedang disiapkan panitia</span>}
          </dd>
        </div>
      </dl>
      {view.nomorVa && <DownloadLetterButton credentials={credentials} />}
      <p className="mt-3 text-xs leading-5 text-slate-600">Bayar Daftar Ulang melalui Nomor VA di atas sesuai jadwal pada Surat Penerimaan. Cetak Surat Pernyataan di halaman 2 dan tanda tangani di atas materai.</p>
    </Notice>
  );
}

/** Surat Penerimaan diminta lewat POST agar tanggal lahir tidak masuk ke URL; server memeriksanya ulang. */
function DownloadLetterButton({ credentials }: { credentials: Credentials }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function download() {
    setDownloading(true);
    setError(null);
    try {
      const body = new FormData();
      body.set('nomorPendaftaran', credentials.nomorPendaftaran);
      body.set('tanggalLahir', credentials.tanggalLahir);
      const response = await fetch('/hasil-okb/surat', { method: 'POST', body });
      if (!response.ok) {
        const message = await response.json().then((data: { error?: string }) => data.error).catch(() => null);
        return setError(message ?? 'Surat Penerimaan belum dapat diunduh. Silakan coba lagi.');
      }
      const fileName = response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] ?? 'Surat-Penerimaan.pdf';
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Surat Penerimaan gagal diunduh. Periksa koneksi lalu coba lagi.');
    } finally {
      setDownloading(false);
    }
  }
  return (
    <div className="mt-4 space-y-2">
      <button type="button" onClick={download} disabled={downloading} className={actionClass('primary', 'lg', 'w-full disabled:opacity-70')}>
        {downloading ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Download aria-hidden="true" />}
        {downloading ? 'Menyiapkan surat...' : 'Unduh Surat Penerimaan'}
      </button>
      {error && <p role="alert" className="text-xs font-semibold text-rose-700">{error}</p>}
    </div>
  );
}

function CopyVaButton({ nomorVa }: { nomorVa: string }) {
  const [copied, setCopied] = useState<boolean | null>(null);
  async function copy() {
    try {
      await navigator.clipboard.writeText(nomorVa);
      setCopied(true);
      window.setTimeout(() => setCopied(null), 2_000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button type="button" onClick={copy} aria-label="Salin Nomor VA" className="inline-flex size-8 items-center justify-center rounded-lg text-public-green hover:bg-public-tint focus-visible:outline-2 focus-visible:outline-public-green">
      {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
      <span role="status" className="sr-only">{copied === true ? 'Nomor VA disalin.' : copied === false ? 'Clipboard tidak tersedia. Silakan salin manual.' : ''}</span>
    </button>
  );
}

function StageCard({ view }: { view: Extract<ResultView, { kind: 'stage' }> }) {
  switch (view.stage) {
    case 'Menunggu Verifikasi':
      return <Notice tone="info" icon={<FileSearch />} title="Berkas sedang diverifikasi" applicant={view.applicant} body="Panitia sedang memeriksa Berkas Ananda. Jadwal OKB diberikan setelah semua Berkas terverifikasi." />;
    case 'Terverifikasi':
      return <Notice tone="info" icon={<ShieldCheck />} title="Berkas sudah terverifikasi" applicant={view.applicant} body="Semua Berkas sudah dinyatakan sah. Panitia akan segera menetapkan Jadwal OKB." />;
    case 'Terjadwal OKB':
      return (
        <Notice tone="info" icon={<CalendarDays />} title="Terjadwal OKB" applicant={view.applicant} body="Datang ke sekolah pada jadwal berikut dengan membawa Bukti Pendaftaran.">
          {view.jadwal && (
            <dl className="mt-4 grid grid-cols-2 divide-x divide-public-deep/10 overflow-hidden rounded-2xl border border-public-deep/10 bg-white">
              <div className="px-4 py-3">
                <dt className="text-xs text-slate-500">Tanggal</dt>
                <dd className="mt-0.5 text-sm font-bold text-slate-900">{format(parse(view.jadwal.tanggal, 'yyyy-MM-dd', new Date()), 'EEEE, d MMMM yyyy', { locale: idLocale })}</dd>
              </div>
              <div className="px-4 py-3">
                <dt className="text-xs text-slate-500">Gelombang</dt>
                <dd className="mt-0.5 text-sm font-bold text-slate-900">{view.jadwal.gelombang}</dd>
              </div>
            </dl>
          )}
        </Notice>
      );
    case 'Menunggu Pengumuman':
      return <Notice tone="info" icon={<Hourglass />} title="Hasil OKB belum diumumkan" applicant={view.applicant} body="Ananda sudah mengikuti OKB. Hasilnya akan diumumkan panitia; silakan cek kembali halaman ini secara berkala." />;
  }
}

const TONES = {
  info: 'border-public-line bg-public-tint text-public-deep',
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  neutral: 'border-slate-200 bg-white text-slate-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  danger: 'border-rose-200 bg-rose-50 text-rose-900',
} as const;

function Notice({ tone, icon, title, body, applicant, children }: {
  tone: keyof typeof TONES;
  icon: ReactNode;
  title: string;
  body?: string;
  applicant?: ResultCheckApplicant;
  children?: ReactNode;
}) {
  return (
    <section data-result={title} className={cn('rounded-3xl border p-5 sm:p-6', TONES[tone])}>
      {applicant && (
        <div className="mb-4 border-b border-current/10 pb-4">
          <p className="text-lg font-bold leading-6 text-slate-900">{formatProperName(applicant.namaLengkap)}</p>
          <p className="mt-0.5 font-mono text-xs text-slate-500">{applicant.nomorPendaftaran}</p>
        </div>
      )}
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-0.5 shrink-0 [&_svg]:size-5">{icon}</span>
        <div className="min-w-0">
          <h2 className="text-base font-bold leading-6">{title}</h2>
          {body && <p className="mt-1 text-sm leading-6 text-slate-700">{body}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function ContactPanitia() {
  return (
    <a href={contactInfo.whatsappUrl} target="_blank" rel="noreferrer" className={actionClass('outline', 'sm', 'mt-4')}>
      <MessageCircle aria-hidden="true" />Hubungi panitia ({contactInfo.whatsappLabel})
    </a>
  );
}
