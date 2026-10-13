// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildRegistrationProofPdf, proofFileName } from '../registrationProofPdf';

const proof = {
  nomorPendaftaran: 'OB-2027-001',
  namaLengkap: 'Siti Aminah',
  jenisPendaftaran: 'Siswa Baru',
  pilihanKelas: 'Bilingual',
  kelasTujuan: null,
};

describe('registration proof PDF', () => {
  it('prints the registration number, child name, and class choice with a QR image', async () => {
    const pdf = (await buildRegistrationProofPdf(proof, null)).output();

    expect(pdf.startsWith('%PDF-')).toBe(true);
    expect(pdf).toContain('BUKTI PENDAFTARAN');
    expect(pdf).toContain('OB-2027-001');
    expect(pdf).toContain('Siti Aminah');
    expect(pdf).toContain('Bilingual');
    expect(pdf).toContain('/Subtype /Image');
    expect(pdf).not.toContain('Kelas Tujuan');
  });

  it('adds the target grade only for Pindahan applicants', async () => {
    const pdf = (await buildRegistrationProofPdf({ ...proof, jenisPendaftaran: 'Pindahan', kelasTujuan: '4' }, null)).output();

    expect(pdf).toContain('Kelas Tujuan');
    expect(pdf).toContain('Kelas 4');
  });

  it('names the file after the registration number', () => {
    expect(proofFileName(proof)).toBe('Bukti-Pendaftaran-OB-2027-001.pdf');
  });
});
