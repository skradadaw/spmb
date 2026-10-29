import { normalizeNomorPendaftaran } from '@/features/announcement/resultCheck';
import { isValidNomorVa, normalizeNomorVa } from '@/features/admin/participants/nomorVa';
import { formatProperName } from '@/lib/properName';

/** Satu baris file impor; line adalah nomor baris di file agar admin mudah memperbaikinya. */
export type VaImportRow = { line: number; nomorPendaftaran: string; nomorVa: string; /** Sel angka Excel: digit ke-16 sudah hilang. */ numericOverflow?: boolean };

export type VaImportApplicant = { nomorPendaftaran: string; namaLengkap: string | null; status: string; nomorVa: string | null; diumumkanPada: string | null };

export const VA_IMPORT_GROUPS = {
  cocok: 'Siap disimpan',
  'tidak-berubah': 'Sama dengan data tersimpan',
  'nomor-tidak-dikenal': 'Nomor Pendaftaran tidak dikenal',
  'nomor-ganda': 'Nomor Pendaftaran muncul lebih dari sekali di file',
  'va-tidak-valid': 'Nomor VA tidak valid',
  'va-ganda': 'Nomor VA ganda (di file atau dipakai pendaftar lain)',
  'bukan-diterima': 'Pendaftar bukan Diterima',
  'va-berbeda': 'Sudah punya Nomor VA yang berbeda',
  terkunci: 'Hasil sudah diumumkan, Nomor VA terkunci',
} as const;
export type VaImportGroup = keyof typeof VA_IMPORT_GROUPS;

export type VaImportReportRow = { line: number; nomorPendaftaran: string; nomorVa: string; namaLengkap: string | null; note?: string };
export type VaImportReport = {
  groups: Array<{ key: VaImportGroup; label: string; rows: VaImportReportRow[] }>;
  /** Hanya baris "Siap disimpan". */
  toSave: Array<{ nomorPendaftaran: string; nomorVa: string }>;
};

/**
 * Mengelompokkan setiap baris impor terhadap data tersimpan. Hanya baris yang cocok yang akan disimpan;
 * Nomor VA yang sudah berbeda atau terkunci tidak pernah ditimpa dari impor.
 */
export function classifyVaImport(
  rows: readonly VaImportRow[],
  applicants: ReadonlyMap<string, VaImportApplicant>,
  /** Nomor VA tersimpan → Nomor Pendaftaran pemiliknya. */
  vaOwners: ReadonlyMap<string, string>,
): VaImportReport {
  const normalized = rows.map(row => ({ ...row, nomorPendaftaran: normalizeNomorPendaftaran(row.nomorPendaftaran), nomorVa: normalizeNomorVa(row.nomorVa) }));
  const countBy = (values: string[]) => values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<string, number>());
  const nomorCounts = countBy(normalized.map(row => row.nomorPendaftaran));
  const vaCounts = countBy(normalized.map(row => row.nomorVa));

  const grouped = new Map<VaImportGroup, VaImportReportRow[]>();
  const toSave: VaImportReport['toSave'] = [];
  for (const row of normalized) {
    const applicant = applicants.get(row.nomorPendaftaran);
    const report: VaImportReportRow = { line: row.line, nomorPendaftaran: row.nomorPendaftaran, nomorVa: row.nomorVa, namaLengkap: applicant?.namaLengkap ? formatProperName(applicant.namaLengkap) : null };
    let group: VaImportGroup;
    const owner = vaOwners.get(row.nomorVa);
    if (!applicant) group = 'nomor-tidak-dikenal';
    else if ((nomorCounts.get(row.nomorPendaftaran) ?? 0) > 1) group = 'nomor-ganda';
    else if (row.numericOverflow) {
      group = 'va-tidak-valid';
      report.note = 'Excel menyimpan angka hanya 15 digit. Format kolom Nomor VA sebagai Teks lalu isi ulang.';
    } else if (!isValidNomorVa(row.nomorVa)) {
      group = 'va-tidak-valid';
      report.note = 'Harus 16 digit angka.';
    } else if (applicant.nomorVa === row.nomorVa) group = 'tidak-berubah';
    else if ((vaCounts.get(row.nomorVa) ?? 0) > 1 || (owner && owner !== row.nomorPendaftaran)) {
      group = 'va-ganda';
      if (owner && owner !== row.nomorPendaftaran) report.note = `Dipakai ${owner}.`;
    } else if (applicant.status !== 'Diterima') {
      group = 'bukan-diterima';
      report.note = `Status: ${applicant.status}.`;
    } else if (applicant.diumumkanPada) group = 'terkunci';
    else if (applicant.nomorVa) {
      group = 'va-berbeda';
      report.note = `Tersimpan: ${applicant.nomorVa}. Ubah dari detail Pendaftar bila memang perlu.`;
    } else {
      group = 'cocok';
      toSave.push({ nomorPendaftaran: row.nomorPendaftaran, nomorVa: row.nomorVa });
    }
    grouped.set(group, [...(grouped.get(group) ?? []), report]);
  }

  const order = Object.keys(VA_IMPORT_GROUPS) as VaImportGroup[];
  return {
    groups: order.filter(key => grouped.has(key)).map(key => ({ key, label: VA_IMPORT_GROUPS[key], rows: grouped.get(key)! })),
    toSave,
  };
}
