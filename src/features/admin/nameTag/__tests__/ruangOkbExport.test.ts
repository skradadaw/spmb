import { strFromU8, unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { buildXlsx } from '@/lib/xlsx';
import { parseRuangOkbExportSelection, ruangOkbExportFilename, ruangOkbExportHref, ruangOkbExportSheet, type RuangOkbExportRow } from '../ruangOkbExport';

const row = (ruangOkb: string, namaLengkap: string, extra: Partial<RuangOkbExportRow> = {}): RuangOkbExportRow => ({
  nomorPendaftaran: null, namaLengkap, jenisKelamin: 'Perempuan', pilihanKelas: 'Reguler', jenisPendaftaran: 'Siswa Baru', ruangOkb, ...extra,
});
const selection = { tanggal: '2026-11-21', gelombang: 1 as const };

describe('ruangOkbExportSheet', () => {
  it('lists Pendaftar per room in natural order, then by name, numbered from 1', () => {
    const sheet = ruangOkbExportSheet([row('Ruang 10', 'bilal'), row('Ruang 2', 'citra'), row('Ruang 2', 'AISYAH putri')], selection);
    expect(sheet.rows.map(cells => [cells[0], cells[1], cells[3]])).toEqual([
      ['1', 'Ruang 2', 'Aisyah Putri'],
      ['2', 'Ruang 2', 'Citra'],
      ['3', 'Ruang 10', 'Bilal'],
    ]);
  });

  it('writes every column the committee needs, with the OKB date and Gelombang spelled out', () => {
    const sheet = ruangOkbExportSheet([row('Al-Bashir', 'Afiza', { nomorPendaftaran: 'OB-2027-001', pilihanKelas: 'Tahfizh', jenisKelamin: 'Laki-laki' })], selection);
    expect(sheet.sheetName).toBe('Ruang OKB');
    expect(sheet.headers).toEqual(['No', 'Ruang OKB', 'Nomor Pendaftaran', 'Nama Lengkap', 'Jenis Kelamin', 'Pilihan Kelas', 'Jenis Pendaftaran', 'Tanggal OKB', 'Gelombang OKB']);
    expect(sheet.rows[0]).toEqual(['1', 'Al-Bashir', 'OB-2027-001', 'Afiza', 'Laki-laki', 'Tahfizh', 'Siswa Baru', 'Sabtu, 21 November 2026', 'Gelombang 1']);
    expect(sheet.widths).toHaveLength(sheet.headers.length);
  });

  it('leaves blanks for missing data instead of writing null', () => {
    const sheet = ruangOkbExportSheet([row('Al-Latif', 'Bilal', { jenisKelamin: null, pilihanKelas: null, jenisPendaftaran: null })], selection);
    expect(sheet.rows[0].slice(2, 7)).toEqual(['', 'Bilal', '', '', '']);
  });

  it('produces a valid one-sheet workbook named Ruang OKB', () => {
    const files = unzipSync(new Uint8Array(buildXlsx(ruangOkbExportSheet([row('Al-Bashir', 'Afiza')], selection))));
    expect(strFromU8(files['xl/workbook.xml'])).toContain('<sheet name="Ruang OKB"');
    const sheetXml = strFromU8(files['xl/worksheets/sheet1.xml']);
    expect(sheetXml).toContain('>Nama Lengkap<');
    expect(sheetXml).toContain('>Al-Bashir<');
  });
});

describe('ruangOkbExport URLs', () => {
  it('names the file and links the download after the group', () => {
    expect(ruangOkbExportFilename(selection)).toBe('ruang-okb-2026-11-21-gelombang-1.xlsx');
    expect(ruangOkbExportHref(selection)).toBe('/admin/okb/name-tag/ekspor?tanggal=2026-11-21&gelombang=1');
  });

  it('accepts only a real date and a known Gelombang', () => {
    expect(parseRuangOkbExportSelection(new URLSearchParams('tanggal=2026-11-21&gelombang=2'))).toEqual({ tanggal: '2026-11-21', gelombang: 2 });
    expect(parseRuangOkbExportSelection(new URLSearchParams('tanggal=21-11-2026&gelombang=1'))).toBeNull();
    expect(parseRuangOkbExportSelection(new URLSearchParams('tanggal=2026-11-21&gelombang=4'))).toBeNull();
    expect(parseRuangOkbExportSelection(new URLSearchParams('gelombang=1'))).toBeNull();
  });
});
