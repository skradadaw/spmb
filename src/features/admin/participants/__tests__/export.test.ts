import { inflateRawSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { participantExportXlsx } from '../export';

describe('participant Excel export', () => {
  it('creates an XLSX workbook with styled headers, readable data, and no formula cells', async () => {
    const bytes = await participantExportXlsx([{ id: '1', createdAt: '2026-10-11T00:00:00Z', updatedAt: null, status: 'Diterima', adminNote: 'Periksa berkas', nisnMismatch: true, fields: { namaLengkap: '=HYPERLINK("x")', jenisPendaftaran: 'Siswa Baru', pilihanKelas: 'Reguler', asalSekolah: 'TK Melati', fatherNama: 'Budi' } }]);
    expect(new TextDecoder().decode(bytes.slice(0, 2))).toBe('PK');
    const entries: Record<string, string> = {};
    for (let offset = 0; bytes.readUInt32LE(offset) === 0x04034b50;) {
      const nameLength = bytes.readUInt16LE(offset + 26);
      const extraLength = bytes.readUInt16LE(offset + 28);
      const compressedSize = bytes.readUInt32LE(offset + 18);
      const dataOffset = offset + 30 + nameLength + extraLength;
      const name = new TextDecoder().decode(bytes.subarray(offset + 30, offset + 30 + nameLength));
      entries[name] = inflateRawSync(bytes.subarray(dataOffset, dataOffset + compressedSize)).toString('utf8');
      offset = dataOffset + compressedSize;
    }
    const sheet = entries['xl/worksheets/sheet1.xml'];
    const styles = entries['xl/styles.xml'];
    const workbook = entries['xl/workbook.xml'];
    expect(sheet).toContain('Identitas siswa - Nama lengkap');
    expect(sheet).toContain('Data ayah - Nama ayah');
    expect(sheet).toContain('Administrasi - Catatan admin');
    expect(sheet).toContain('Rujukan murid - Kategori pengusul');
    expect(sheet).toContain('OKB - Tanggal OKB');
    expect(sheet).toContain('Budi');
    expect(sheet).toContain('A1:BD2');
    expect(sheet).toContain('Administrasi - NISN tidak sesuai');
    expect(sheet).toContain('>Ya<');
    expect(sheet).toContain('11 Oktober 2026');
    expect(sheet).toContain('&apos;=Hyperlink');
    expect(sheet).not.toContain('<f>');
    expect(sheet).toContain('autoFilter');
    expect(styles).toContain('FF217A52');
    expect(workbook).toContain('Pendaftar');
  });

  it('keeps long numbers such as NIK as text, even after a cell is edited', async () => {
    const bytes = await participantExportXlsx([{ id: '1', createdAt: null, updatedAt: null, status: 'Diterima', adminNote: null, nisnMismatch: false, fields: { nik: '3301150101200001', teleponAyah: '081234567890', alamatJalan: 'JL. MELATI NO.5', rt: '2', rw: '3', kelurahan: 'CIBODAS', kecamatan: 'MANIIS', kota: 'KABUPATEN PURWAKARTA', provinsi: 'JAWA BARAT', alamatRumah: 'JL. MELATI NO.5, RT 2/RW 3, Kel. CIBODAS, Kec. MANIIS, Kota/Kab. KABUPATEN PURWAKARTA, Prov. JAWA BARAT' } }]);
    const entries: Record<string, string> = {};
    for (let offset = 0; bytes.readUInt32LE(offset) === 0x04034b50;) {
      const nameLength = bytes.readUInt16LE(offset + 26);
      const dataOffset = offset + 30 + nameLength + bytes.readUInt16LE(offset + 28);
      const compressedSize = bytes.readUInt32LE(offset + 18);
      entries[new TextDecoder().decode(bytes.subarray(offset + 30, offset + 30 + nameLength))] = inflateRawSync(bytes.subarray(dataOffset, dataOffset + compressedSize)).toString('utf8');
      offset = dataOffset + compressedSize;
    }
    const sheet = entries['xl/worksheets/sheet1.xml'];
    expect(sheet).toContain('t="inlineStr"><is><t xml:space="preserve">3301150101200001<');
    // Alamat ditulis seperti di layar, dan Alamat rumah disusun ulang tanpa kata wilayah ganda.
    expect(sheet).toContain('>Jl. Melati No. 5<');
    expect(sheet).toContain('>Jawa Barat<');
    expect(sheet).toContain('>Jl. Melati No. 5, RT 02/RW 03, Kel. Cibodas, Kec. Maniis, Kabupaten Purwakarta, Jawa Barat<');
    expect(sheet).not.toContain('Kota/Kab.');
    expect(sheet).toContain('style="2"');
    expect(sheet).toContain('numberStoredAsText="1"');
    expect(entries['xl/styles.xml'].match(/numFmtId="49"/g)).toHaveLength(2);
    // Excel menolak seluruh styles.xml bila urutan sisi border tidak sesuai skema (left, right, top, bottom, diagonal).
    const borders = entries['xl/styles.xml'].match(/<border>.*?<\/border>/g) ?? [];
    expect(borders).toHaveLength(2);
    for (const border of borders) expect(border).toMatch(/^<border><left\/><right\/><top\/><bottom[^>]*>.*<diagonal\/><\/border>$/);
  });
});
