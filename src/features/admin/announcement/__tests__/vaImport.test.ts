import { describe, expect, it } from 'vitest';
import { classifyVaImport, type VaImportApplicant } from '../vaImport';

const applicant = (nomor: string, overrides: Partial<VaImportApplicant> = {}): [string, VaImportApplicant] => [nomor, {
  nomorPendaftaran: nomor, namaLengkap: 'SITI AMINAH', status: 'Diterima', nomorVa: null, diumumkanPada: null, ...overrides,
}];

const applicants = new Map([
  applicant('OB-2027-001'),
  applicant('OB-2027-002', { nomorVa: '1111222233334444' }),
  applicant('OB-2027-003', { status: 'Ditolak' }),
  applicant('OB-2027-004', { diumumkanPada: '2027-02-09T01:00:00Z' }),
  applicant('OB-2027-005', { nomorVa: '5555666677778888' }),
  applicant('OB-2027-006'),
  applicant('OB-2027-007'),
  applicant('OB-2027-008'),
  applicant('OB-2027-009'),
]);
const vaOwners = new Map([['1111222233334444', 'OB-2027-002'], ['5555666677778888', 'OB-2027-005'], ['9999000011112222', 'OB-2027-050']]);

describe('Nomor VA import report', () => {
  it('puts every row in exactly one group and saves only the ready ones', () => {
    const report = classifyVaImport([
      { line: 2, nomorPendaftaran: ' ob-2027-001 ', nomorVa: '7456 0126 2730 0120' },
      { line: 3, nomorPendaftaran: 'OB-2027-002', nomorVa: '1111222233334444' },
      { line: 4, nomorPendaftaran: 'OB-2027-003', nomorVa: '7456012627300121' },
      { line: 5, nomorPendaftaran: 'OB-2027-004', nomorVa: '7456012627300122' },
      { line: 6, nomorPendaftaran: 'OB-2027-005', nomorVa: '7456012627300123' },
      { line: 7, nomorPendaftaran: 'OB-2027-999', nomorVa: '7456012627300124' },
      { line: 8, nomorPendaftaran: 'OB-2027-006', nomorVa: '74560126' },
      { line: 9, nomorPendaftaran: 'OB-2027-007', nomorVa: '9999000011112222' },
      { line: 10, nomorPendaftaran: 'OB-2027-008', nomorVa: '7456012627300199' },
      { line: 11, nomorPendaftaran: 'OB-2027-009', nomorVa: '7456012627300199' },
    ], applicants, vaOwners);

    const lines = Object.fromEntries(report.groups.map(group => [group.key, group.rows.map(row => row.line)]));
    expect(lines).toEqual({
      cocok: [2],
      'tidak-berubah': [3],
      'nomor-tidak-dikenal': [7],
      'va-tidak-valid': [8],
      'va-ganda': [9, 10, 11],
      'bukan-diterima': [4],
      'va-berbeda': [6],
      terkunci: [5],
    });
    expect(report.toSave).toEqual([{ nomorPendaftaran: 'OB-2027-001', nomorVa: '7456012627300120' }]);
    expect(report.groups.find(group => group.key === 'va-ganda')!.rows[0].note).toBe('Dipakai OB-2027-050.');
  });

  it('rejects a Nomor Pendaftaran listed twice', () => {
    const report = classifyVaImport([
      { line: 2, nomorPendaftaran: 'OB-2027-001', nomorVa: '7456012627300120' },
      { line: 3, nomorPendaftaran: 'OB-2027-001', nomorVa: '7456012627300121' },
    ], applicants, new Map());
    expect(report.groups.map(group => group.key)).toEqual(['nomor-ganda']);
    expect(report.toSave).toEqual([]);
  });

  it('explains a 16-digit number that Excel already rounded', () => {
    const report = classifyVaImport([{ line: 2, nomorPendaftaran: 'OB-2027-001', nomorVa: '7.45601262730012E+15', numericOverflow: true }], applicants, new Map());
    expect(report.groups[0].key).toBe('va-tidak-valid');
    expect(report.groups[0].rows[0].note).toContain('Format kolom Nomor VA sebagai Teks');
  });
});
