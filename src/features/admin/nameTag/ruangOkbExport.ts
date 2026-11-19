import { formatOkbDate } from '@/features/admin/okbDate';
import { okbWaveLabel, parseOkbWave } from '@/features/admin/okbWave';
import { formatParticipantFieldValue } from '@/features/admin/participants/presentation';
import type { NameTagSelection } from './nameTagGroups';

/** Satu Pendaftar yang sudah mendapat Ruang OKB pada kelompok yang diekspor. */
export type RuangOkbExportRow = {
  nomorPendaftaran: string | null;
  namaLengkap: string;
  jenisKelamin: string | null;
  pilihanKelas: string | null;
  jenisPendaftaran: string | null;
  ruangOkb: string;
};

const HEADERS = ['No', 'Ruang OKB', 'Nomor Pendaftaran', 'Nama Lengkap', 'Jenis Kelamin', 'Pilihan Kelas', 'Jenis Pendaftaran', 'Tanggal OKB', 'Gelombang OKB'];
const WIDTHS = [6, 20, 20, 36, 16, 16, 18, 28, 16];

const compareText = (left: string, right: string) => left.localeCompare(right, 'id-ID', { numeric: true, sensitivity: 'base' });
const tidyName = (name: string) => (name.trim() ? formatParticipantFieldValue('identity', 'namaLengkap', name) : '');

/** Pembagian Ruang OKB satu kelompok sebagai satu lembar: urut ruangan (Ruang 2 sebelum Ruang 10), lalu nama. */
export function ruangOkbExportSheet(rows: RuangOkbExportRow[], { tanggal, gelombang }: NameTagSelection) {
  const date = formatOkbDate(tanggal, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const wave = okbWaveLabel(gelombang);
  const sorted = rows
    .map(row => ({ ...row, namaLengkap: tidyName(row.namaLengkap) }))
    .sort((left, right) => compareText(left.ruangOkb, right.ruangOkb) || compareText(left.namaLengkap, right.namaLengkap));
  return {
    sheetName: 'Ruang OKB',
    headers: HEADERS,
    widths: WIDTHS,
    rows: sorted.map((row, index) => [
      String(index + 1), row.ruangOkb, row.nomorPendaftaran ?? '', row.namaLengkap, row.jenisKelamin ?? '',
      row.pilihanKelas ?? '', row.jenisPendaftaran ?? '', date, wave,
    ]),
  };
}

export const ruangOkbExportFilename = ({ tanggal, gelombang }: NameTagSelection) => `ruang-okb-${tanggal}-gelombang-${gelombang}.xlsx`;

export function ruangOkbExportHref({ tanggal, gelombang }: NameTagSelection) {
  return `/admin/okb/name-tag/ekspor?${new URLSearchParams({ tanggal, gelombang: String(gelombang) })}`;
}

/** Kelompok dari URL ekspor; null bila tanggal atau Gelombang tidak sah. */
export function parseRuangOkbExportSelection(params: URLSearchParams): NameTagSelection | null {
  const tanggal = params.get('tanggal') ?? '';
  const gelombang = parseOkbWave(params.get('gelombang'));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || Number.isNaN(Date.parse(`${tanggal}T00:00:00Z`)) || !gelombang) return null;
  return { tanggal, gelombang };
}
