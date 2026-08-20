import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  acquireSubmissionLock,
  buildRegistrationPreparation,
  releaseSubmissionLock,
} from '@/features/registration/clientSubmission';
import type { RegistrationDocumentId } from '@/features/registration/contracts';
import type { FormData as RegistrationData } from '@/features/registration/schema';

const formSourcePath = resolve(
  process.cwd(),
  'src/features/registration/components/RegistrationForm.tsx',
);

const registrationData = {
  jenisPendaftaran: 'Siswa Baru',
  pilihanKelas: 'Reguler',
  namaLengkap: 'Siti Aminah',
  jenisKelamin: 'Perempuan',
  tempatLahir: 'Purwakarta',
  tanggalLahir: '2018-01-01',
  nik: '1234567890123456',
  nisn: '1234567890',
  bekerjaDiDirektorat2: 'Tidak',
  asalSekolah: 'TK Melati',
  jarakKeSekolah: '2 km',
  alamatJalan: 'Jalan Melati',
  rt: '01',
  rw: '02',
  kelurahan: 'Ciseureuh',
  kecamatan: 'Purwakarta',
  kota: 'Purwakarta',
  provinsi: 'Jawa Barat',
  namaAyah: 'Budi Santoso',
  nikAyah: '2345678901234567',
  pendidikanAyah: 'SMA',
  pekerjaanAyah: 'Wiraswasta',
  penghasilanAyah: '5-10 Juta',
  teleponAyah: '081234567890',
  alamatAyah: 'Jalan Melati Nomor 1',
  namaIbu: 'Ani Santoso',
  nikIbu: '3456789012345678',
  pendidikanIbu: 'SMA',
  pekerjaanIbu: 'Ibu Rumah Tangga',
  penghasilanIbu: '5-10 Juta',
  teleponIbu: '081234567891',
  alamatIbu: 'Jalan Melati Nomor 1',
} satisfies RegistrationData;

const files: Record<RegistrationDocumentId, File> = {
  aktaKelahiran: new File(['akta'], 'akta.pdf', { type: 'application/pdf' }),
  kartuKeluarga: new File(['kk'], 'kk.pdf', { type: 'application/pdf' }),
  pasFoto: new File(['foto'], 'foto.jpg', { type: 'image/jpeg' }),
  buktiPembayaran: new File(['bukti'], 'bukti.png', { type: 'image/png' }),
};

describe('buildRegistrationPreparation', () => {
  const credentials = {
    submissionId: '123e4567-e89b-42d3-a456-426614174000',
    submissionSecret: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQ',
  };

  it('sends only document metadata through the Server Action', () => {
    const submission = buildRegistrationPreparation(
      registrationData,
      files,
      'bot-trap-value',
      credentials,
    );

    expect(submission).toBeInstanceOf(FormData);
    expect([...submission.keys()]).toEqual([
      'payload',
      'metadata',
      'website',
      'submissionId',
      'submissionSecret',
    ]);
    expect(JSON.parse(submission.get('payload') as string)).toEqual(registrationData);
    expect(submission.get('website')).toBe('bot-trap-value');
    expect(JSON.parse(submission.get('metadata') as string)).toEqual([
      { id: 'aktaKelahiran', size: 4, type: 'application/pdf' },
      { id: 'kartuKeluarga', size: 2, type: 'application/pdf' },
      { id: 'pasFoto', size: 4, type: 'image/jpeg' },
      { id: 'buktiPembayaran', size: 5, type: 'image/png' },
    ]);
    expect([...submission.values()].some((value) => value instanceof File)).toBe(false);
  });

  it('throws a helpful error naming a missing required document', () => {
    const incompleteFiles: Partial<Record<RegistrationDocumentId, File>> = {
      ...files,
    };
    delete incompleteFiles.kartuKeluarga;

    expect(() =>
      buildRegistrationPreparation(registrationData, incompleteFiles, '', credentials),
    ).toThrow('Dokumen Kartu Keluarga wajib dipilih sebelum mengirim.');
  });
});

describe('submission lock', () => {
  it('acquires synchronously, rejects duplicate acquisition, and can be released', () => {
    const lock = { current: false };

    expect(acquireSubmissionLock(lock)).toBe(true);
    expect(acquireSubmissionLock(lock)).toBe(false);
    releaseSubmissionLock(lock);
    expect(acquireSubmissionLock(lock)).toBe(true);
  });
});

describe('RegistrationForm submission boundary', () => {
  it('does not import or invoke the browser Supabase upload utility', () => {
    const source = readFileSync(formSourcePath, 'utf8');

    expect(source).not.toContain('../utils/upload');
    expect(source).not.toContain('uploadRegistrationDocuments');
    expect(source).not.toContain('rollbackUploadedDocuments');
  });

  it('renders an off-screen text honeypot outside keyboard and accessibility navigation', () => {
    const source = readFileSync(formSourcePath, 'utf8');

    expect(source).toContain('name="website"');
    expect(source).toContain('type="text"');
    expect(source).toContain('aria-hidden="true"');
    expect(source).toContain('tabIndex={-1}');
  });

  it('does not log validation error objects that can retain submitted field references', () => {
    const source = readFileSync(formSourcePath, 'utf8');

    expect(source).not.toMatch(
      /console\.(?:debug|info|log|warn|error)\([^)]*\bformErrors\b/,
    );
  });
});
