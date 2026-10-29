import { okbWaveLabel, parseOkbWave } from '@/features/admin/okbWave';
import type { AcceptanceLetterData } from './acceptanceLetter';
import type { ApplicantResultRecord, ResultCheckApplicant, ResultView } from './contracts';

/** Batas percobaan gagal per klien dalam satu jendela waktu sebelum Cek Hasil OKB dikunci sementara. */
export const RESULT_CHECK_LIMIT = 10;
export const RESULT_CHECK_WINDOW_SECONDS = 15 * 60;

export type ResultCheckRepository = {
  findByNomorPendaftaran(nomorPendaftaran: string): Promise<ApplicantResultRecord | null>;
  isLocked(clientKey: string): Promise<boolean>;
  recordFailure(clientKey: string): Promise<void>;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** "ob-2027-001 " dan "OB - 2027 - 001" sama-sama dikenali sebagai OB-2027-001. */
export function normalizeNomorPendaftaran(value: string) {
  return value.replace(/\s+/g, '').toUpperCase();
}

function applicantOf(record: ApplicantResultRecord): ResultCheckApplicant {
  return { namaLengkap: record.namaLengkap ?? '', nomorPendaftaran: record.nomorPendaftaran };
}

function viewOf(record: ApplicantResultRecord): ResultView | null {
  const applicant = applicantOf(record);
  switch (record.status) {
    case 'Menunggu Verifikasi':
    case 'Terverifikasi':
      return { kind: 'stage', applicant, stage: record.status, jadwal: null };
    case 'Terjadwal OKB': {
      const wave = parseOkbWave(record.jadwalGelombang);
      const jadwal = record.jadwalTanggal && wave ? { tanggal: record.jadwalTanggal.slice(0, 10), gelombang: okbWaveLabel(wave) } : null;
      return { kind: 'stage', applicant, stage: 'Terjadwal OKB', jadwal };
    }
    // Keputusan Penerimaan baru terlihat setelah Pengumuman Hasil OKB.
    case 'Diterima':
      if (!record.diumumkanPada) break;
      return {
        kind: 'accepted',
        applicant,
        kelasPenempatan: record.kelasPenempatan,
        kelasTujuan: record.jenisPendaftaran === 'Pindahan' ? record.kelasTujuan : null,
        nomorVa: record.nomorVa,
      };
    case 'Ditolak':
      if (!record.diumumkanPada) break;
      return { kind: 'rejected', applicant };
    case 'Sudah OKB':
      break;
    case 'Dibatalkan':
      return { kind: 'cancelled', applicant };
    // Menunggu Unggahan belum dianggap mendaftar.
    default:
      return null;
  }
  return { kind: 'stage', applicant, stage: 'Menunggu Pengumuman', jadwal: null };
}

type ResultCheckInput = { nomorPendaftaran: string; tanggalLahir: string };

async function verify(input: ResultCheckInput, clientKey: string, repository: ResultCheckRepository): Promise<{ view: ResultView; record: ApplicantResultRecord | null }> {
  const nomorPendaftaran = normalizeNomorPendaftaran(input.nomorPendaftaran);
  const tanggalLahir = input.tanggalLahir.trim();
  if (!nomorPendaftaran || !DATE_PATTERN.test(tanggalLahir)) {
    return { view: { kind: 'invalid', message: 'Isi Nomor Pendaftaran dan tanggal lahir anak.' }, record: null };
  }

  if (await repository.isLocked(clientKey)) return { view: { kind: 'locked' }, record: null };

  const record = await repository.findByNomorPendaftaran(nomorPendaftaran);
  const view = record && record.tanggalLahir?.slice(0, 10) === tanggalLahir ? viewOf(record) : null;
  if (!view) {
    await repository.recordFailure(clientKey);
    return { view: { kind: 'not-found' }, record: null };
  }
  return { view, record };
}

/** Cek Hasil OKB untuk orang tua: Nomor Pendaftaran dan tanggal lahir anak harus cocok. */
export async function checkResult(input: ResultCheckInput, clientKey: string, repository: ResultCheckRepository): Promise<ResultView> {
  return (await verify(input, clientKey, repository)).view;
}

/**
 * Data Surat Penerimaan untuk unduhan orang tua, diotorisasi ulang di setiap permintaan:
 * hanya Pendaftar Diterima yang sudah diumumkan dan punya Nomor VA.
 */
export async function authorizeAcceptanceLetter(
  input: ResultCheckInput,
  clientKey: string,
  repository: ResultCheckRepository,
): Promise<{ allowed: true; letter: AcceptanceLetterData; nomorPendaftaran: string } | { allowed: false; view: ResultView }> {
  const { view, record } = await verify(input, clientKey, repository);
  if (view.kind !== 'accepted' || !view.nomorVa || !record) return { allowed: false, view };
  return {
    allowed: true,
    nomorPendaftaran: record.nomorPendaftaran,
    letter: { namaLengkap: record.namaLengkap ?? '', nomorVa: view.nomorVa, tempatLahir: record.tempatLahir, tanggalLahir: record.tanggalLahir },
  };
}
