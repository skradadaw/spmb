import { inflateRawSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { participantExportXlsx } from '../export';

describe('participant Excel export', () => {
  it('creates an XLSX workbook with styled headers, readable data, and no formula cells', async () => {
    const bytes = await participantExportXlsx([{ id: '1', createdAt: '2026-10-11T00:00:00Z', updatedAt: null, status: 'Diterima', adminNote: 'Periksa berkas', fields: { namaLengkap: '=HYPERLINK("x")', jenisPendaftaran: 'Siswa Baru', pilihanKelas: 'Reguler', asalSekolah: 'TK Melati', fatherNama: 'Budi' } }]);
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
    expect(sheet).toContain('A1:BC2');
    expect(sheet).toContain('11 Oktober 2026');
    expect(sheet).toContain('HYPERLINK');
    expect(sheet).not.toContain('<f>');
    expect(sheet).toContain('autoFilter');
    expect(styles).toContain('FF217A52');
    expect(workbook).toContain('Pendaftar');
  });
});
