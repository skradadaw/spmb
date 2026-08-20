import { describe, expect, it, vi } from 'vitest';
import {
  DuplicateRegistrationError,
  processRegistrationSubmission,
  type RegistrationPersistence,
} from '@/features/registration/server/submissionService';
import type {
  RegistrationDocumentId,
  ValidatedDocument,
} from '@/features/registration/contracts';
import type { FormData as RegistrationData } from '@/features/registration/schema';

const submissionId = '123e4567-e89b-12d3-a456-426614174000';
const duplicateNikMessage = 'Data dengan NIK ini sudah pernah terdaftar di sistem. Mohon gunakan NIK yang belum terdaftar.';
const savingErrorMessage = 'Terjadi kesalahan saat menyimpan data pendaftaran.';

const makeValidRegistrationData = () => ({
  jenisPendaftaran: 'Siswa Baru',
  pilihanKelas: 'Reguler',
  namaLengkap: 'Siti Aminah',
  jenisKelamin: 'Perempuan',
  tempatLahir: 'Purwakarta',
  tanggalLahir: '2018-01-01',
  nik: '1234567890123456',
  nisn: '1234567890',
  bekerjaDiDirektorat2: 'Tidak',
  saudaraDiDirektorat2: 'Tidak',
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
});

const pdfFile = () => new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], 'akta-kelahiran-Siti.pdf', { type: 'application/pdf' });
const jpegFile = () => new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], 'kartu-keluarga-Siti.jpg', { type: 'image/jpeg' });
const pngFile = () => new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], 'pas-foto-Siti.png', { type: 'image/png' });
const webpFile = () => new File([new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])], 'bukti-pembayaran-Siti.webp', { type: 'image/webp' });

const makeValidSubmission = () => {
  const submission = new FormData();
  submission.set('payload', JSON.stringify(makeValidRegistrationData()));
  submission.set('website', '');
  submission.set('aktaKelahiran', pdfFile());
  submission.set('kartuKeluarga', jpegFile());
  submission.set('pasFoto', pngFile());
  submission.set('buktiPembayaran', webpFile());
  return submission;
};

class InMemoryPersistence implements RegistrationPersistence {
  readonly events: string[] = [];
  readonly uploaded: Array<{ path: string; document: ValidatedDocument }> = [];
  readonly removed: string[][] = [];
  inserted: { data: RegistrationData; documentPaths: Record<RegistrationDocumentId, string> } | undefined;
  rateLimitAllowed = true;
  rateLimitError: Error | undefined;
  failUploadAt: number | undefined;
  insertError: Error | undefined;
  removeError: Error | undefined;

  async consumeRateLimit(key: string, limit: number, windowSeconds: number) {
    this.events.push(`rate-limit:${key}:${limit}:${windowSeconds}`);
    if (this.rateLimitError) {
      throw this.rateLimitError;
    }
    return this.rateLimitAllowed;
  }

  async uploadDocument(path: string, document: ValidatedDocument) {
    this.events.push(`upload:${path}`);
    if (this.failUploadAt === this.uploaded.length + 1) {
      throw new Error('upload failed');
    }
    this.uploaded.push({ path, document });
  }

  async removeDocuments(paths: string[]) {
    this.events.push(`remove:${paths.join(',')}`);
    this.removed.push(paths);
    if (this.removeError) {
      throw this.removeError;
    }
  }

  async insertRegistration(
    data: RegistrationData,
    documentPaths: Record<RegistrationDocumentId, string>,
  ) {
    this.events.push('insert');
    if (this.insertError) {
      throw this.insertError;
    }
    this.inserted = { data, documentPaths };
  }
}

describe('processRegistrationSubmission', () => {
  it('consumes the configured rate limit before sequentially uploading and inserting', async () => {
    const persistence = new InMemoryPersistence();

    const result = await processRegistrationSubmission(
      makeValidSubmission(),
      'ip:203.0.113.1',
      persistence,
      () => submissionId,
    );

    expect(result).toEqual({ success: true });
    expect(persistence.events).toEqual([
      'rate-limit:ip:203.0.113.1:5:900',
      `upload:registrations/${submissionId}/aktaKelahiran.pdf`,
      `upload:registrations/${submissionId}/kartuKeluarga.jpg`,
      `upload:registrations/${submissionId}/pasFoto.png`,
      `upload:registrations/${submissionId}/buktiPembayaran.webp`,
      'insert',
    ]);
  });

  it('skips rate limiting when the source key is unavailable', async () => {
    const persistence = new InMemoryPersistence();

    await expect(processRegistrationSubmission(makeValidSubmission(), null, persistence, () => submissionId))
      .resolves.toEqual({ success: true });

    expect(persistence.events).not.toContainEqual(expect.stringMatching(/^rate-limit:/));
  });

  it('rate limits an empty source key because only null means no key is available', async () => {
    const persistence = new InMemoryPersistence();

    await expect(processRegistrationSubmission(makeValidSubmission(), '', persistence, () => submissionId))
      .resolves.toEqual({ success: true });

    expect(persistence.events[0]).toBe('rate-limit::5:900');
  });

  it('returns a safe error without uploading when the rate limit denies the request', async () => {
    const persistence = new InMemoryPersistence();
    persistence.rateLimitAllowed = false;

    const result = await processRegistrationSubmission(makeValidSubmission(), 'ip:203.0.113.1', persistence, () => submissionId);

    expect(result).toEqual({ success: false, error: 'Terlalu banyak permintaan. Silakan coba lagi dalam 15 menit.' });
    expect(persistence.uploaded).toEqual([]);
    expect(persistence.inserted).toBeUndefined();
  });

  it('returns the primary safe error when rate-limit persistence fails', async () => {
    const persistence = new InMemoryPersistence();
    persistence.rateLimitError = new Error('rate limit unavailable');

    await expect(processRegistrationSubmission(makeValidSubmission(), 'ip:203.0.113.1', persistence, () => submissionId))
      .resolves.toEqual({ success: false, error: savingErrorMessage });

    expect(persistence.uploaded).toEqual([]);
    expect(persistence.inserted).toBeUndefined();
  });

  it('uses injected opaque UUID paths that exclude all identifiers and original filenames', async () => {
    const persistence = new InMemoryPersistence();

    await processRegistrationSubmission(makeValidSubmission(), null, persistence, () => submissionId);

    const paths = persistence.uploaded.map(({ path }) => path);
    expect(paths).toEqual([
      `registrations/${submissionId}/aktaKelahiran.pdf`,
      `registrations/${submissionId}/kartuKeluarga.jpg`,
      `registrations/${submissionId}/pasFoto.png`,
      `registrations/${submissionId}/buktiPembayaran.webp`,
    ]);
    expect(paths.join(' ')).not.toContain('1234567890123456');
    expect(paths.join(' ')).not.toContain('12345');
    expect(paths.join(' ')).not.toContain('Siti Aminah');
    expect(paths.join(' ')).not.toContain('akta-kelahiran-Siti.pdf');
  });

  it('uses the default Web Crypto UUID factory on a valid submission', async () => {
    const webCrypto = {
      randomUUID() {
        if (this !== webCrypto) {
          throw new TypeError('randomUUID must retain its Web Crypto receiver');
        }
        return submissionId;
      },
    };
    vi.stubGlobal('crypto', webCrypto);
    const persistence = new InMemoryPersistence();

    try {
      await expect(processRegistrationSubmission(makeValidSubmission(), null, persistence))
        .resolves.toEqual({ success: true });
      expect(persistence.uploaded[0]?.path).toBe(`registrations/${submissionId}/aktaKelahiran.pdf`);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('returns parser rejection before rate limiting, UUID generation, or persistence writes', async () => {
    const persistence = new InMemoryPersistence();
    let idCalls = 0;

    const result = await processRegistrationSubmission(
      new FormData(),
      'ip:203.0.113.1',
      persistence,
      () => {
        idCalls += 1;
        return submissionId;
      },
    );

    expect(result).toEqual({ success: false, error: 'Format data pendaftaran tidak valid.' });
    expect(idCalls).toBe(0);
    expect(persistence.events).toEqual([]);
    expect(persistence.uploaded).toEqual([]);
    expect(persistence.inserted).toBeUndefined();
    expect(persistence.removed).toEqual([]);
  });

  it.each([2, 3, 4])('rolls back every completed upload when upload %i fails', async (failedUpload) => {
    const persistence = new InMemoryPersistence();
    persistence.failUploadAt = failedUpload;

    const result = await processRegistrationSubmission(makeValidSubmission(), null, persistence, () => submissionId);

    expect(result).toEqual({ success: false, error: savingErrorMessage });
    expect(persistence.removed).toEqual([persistence.uploaded.map(({ path }) => path)]);
    expect(persistence.uploaded).toHaveLength(failedUpload - 1);
    expect(persistence.inserted).toBeUndefined();
  });

  it('rolls back all uploaded documents when inserting the registration fails', async () => {
    const persistence = new InMemoryPersistence();
    persistence.insertError = new Error('database unavailable');

    const result = await processRegistrationSubmission(makeValidSubmission(), null, persistence, () => submissionId);

    expect(result).toEqual({ success: false, error: savingErrorMessage });
    expect(persistence.removed).toEqual([persistence.uploaded.map(({ path }) => path)]);
    expect(persistence.uploaded).toHaveLength(4);
    expect(persistence.inserted).toBeUndefined();
  });

  it('maps a duplicate registration error to the friendly duplicate-NIK message', async () => {
    const persistence = new InMemoryPersistence();
    persistence.insertError = new DuplicateRegistrationError();

    await expect(processRegistrationSubmission(makeValidSubmission(), null, persistence, () => submissionId))
      .resolves.toEqual({ success: false, error: duplicateNikMessage });
  });

  it('preserves the primary safe error when rollback cleanup fails', async () => {
    const persistence = new InMemoryPersistence();
    persistence.insertError = new Error('database unavailable');
    persistence.removeError = new Error('cleanup unavailable');

    const result = await processRegistrationSubmission(makeValidSubmission(), null, persistence, () => submissionId);

    expect(result).toEqual({ success: false, error: savingErrorMessage });
    expect(persistence.removed).toHaveLength(1);
  });
});
