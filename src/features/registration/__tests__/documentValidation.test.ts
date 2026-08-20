import { describe, expect, it } from 'vitest';
import { parseRegistrationSubmission } from '@/features/registration/server/documentValidation';

const MAX_FILE_SIZE = 5_242_880;

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

const pdfFile = () => new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], 'akta.pdf', { type: 'application/pdf' });
const jpegFile = () => new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], 'kk.jpg', { type: 'image/jpeg' });
const pngFile = () => new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], 'foto.png', { type: 'image/png' });
const webpFile = () => new File([new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])], 'bukti.webp', { type: 'image/webp' });

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

describe('parseRegistrationSubmission', () => {
  it('accepts 4-10 digit NISN and rejects fewer than 4 digits', async () => {
    const fourDigitSubmission = makeValidSubmission();
    fourDigitSubmission.set('payload', JSON.stringify({
      ...makeValidRegistrationData(),
      nisn: '1234',
    }));

    await expect(parseRegistrationSubmission(fourDigitSubmission)).resolves.toMatchObject({
      success: true,
    });

    const threeDigitSubmission = makeValidSubmission();
    threeDigitSubmission.set('payload', JSON.stringify({
      ...makeValidRegistrationData(),
      nisn: '123',
    }));

    await expect(parseRegistrationSubmission(threeDigitSubmission)).resolves.toEqual({
      success: false,
      error: 'Data pendaftaran tidak valid.',
    });
  });

  it('returns validated registration data and the trusted document extensions', async () => {
    const result = await parseRegistrationSubmission(makeValidSubmission());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(makeValidRegistrationData());
      expect(result.documents.aktaKelahiran.extension).toBe('pdf');
      expect(result.documents.kartuKeluarga.extension).toBe('jpg');
      expect(result.documents.pasFoto.extension).toBe('png');
      expect(result.documents.buktiPembayaran.extension).toBe('webp');
    }
  });

  it.each([
    ['aktaKelahiran', pdfFile, 'pdf'],
    ['kartuKeluarga', jpegFile, 'jpg'],
    ['pasFoto', pngFile, 'png'],
    ['buktiPembayaran', webpFile, 'webp'],
  ] as const)('trusts the %s document type only when its signature matches', async (id, makeFile, extension) => {
    const submission = makeValidSubmission();
    submission.set(id, makeFile());

    const result = await parseRegistrationSubmission(submission);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.documents[id].extension).toBe(extension);
    }
  });

  it('rejects malformed JSON payloads', async () => {
    const submission = makeValidSubmission();
    submission.set('payload', '{');

    await expect(parseRegistrationSubmission(submission)).resolves.toEqual({
      success: false,
      error: 'Format data pendaftaran tidak valid.',
    });
  });

  it('rejects Zod-invalid registration data', async () => {
    const submission = makeValidSubmission();
    submission.set('payload', JSON.stringify({ ...makeValidRegistrationData(), nik: 'invalid' }));

    await expect(parseRegistrationSubmission(submission)).resolves.toEqual({
      success: false,
      error: 'Data pendaftaran tidak valid.',
    });
  });

  it('rejects a filled honeypot field', async () => {
    const submission = makeValidSubmission();
    submission.set('website', 'spam.example');

    await expect(parseRegistrationSubmission(submission)).resolves.toEqual({
      success: false,
      error: 'Permintaan tidak dapat diproses.',
    });
  });

  it('rejects a missing required document', async () => {
    const submission = makeValidSubmission();
    submission.delete('aktaKelahiran');

    await expect(parseRegistrationSubmission(submission)).resolves.toEqual({
      success: false,
      error: 'Dokumen Akta Kelahiran wajib diunggah.',
    });
  });

  it('rejects a non-File document value', async () => {
    const submission = makeValidSubmission();
    submission.set('aktaKelahiran', 'not-a-file');

    await expect(parseRegistrationSubmission(submission)).resolves.toEqual({
      success: false,
      error: 'Dokumen Akta Kelahiran wajib diunggah.',
    });
  });

  it('rejects an empty document', async () => {
    const submission = makeValidSubmission();
    submission.set('aktaKelahiran', new File([], 'empty.pdf', { type: 'application/pdf' }));

    await expect(parseRegistrationSubmission(submission)).resolves.toEqual({
      success: false,
      error: 'Dokumen Akta Kelahiran tidak boleh kosong.',
    });
  });

  it('rejects a document larger than 5 MiB', async () => {
    const submission = makeValidSubmission();
    submission.set('aktaKelahiran', new File([new Uint8Array(MAX_FILE_SIZE + 1)], 'large.pdf', { type: 'application/pdf' }));

    await expect(parseRegistrationSubmission(submission)).resolves.toEqual({
      success: false,
      error: 'Ukuran dokumen Akta Kelahiran melebihi batas 5 MB.',
    });
  });

  it('rejects unsupported document MIME types', async () => {
    const submission = makeValidSubmission();
    submission.set('aktaKelahiran', new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], 'akta.txt', { type: 'text/plain' }));

    await expect(parseRegistrationSubmission(submission)).resolves.toEqual({
      success: false,
      error: 'Jenis file dokumen Akta Kelahiran tidak didukung.',
    });
  });

  it('rejects a document whose MIME type and signature do not match', async () => {
    const submission = makeValidSubmission();
    submission.set('aktaKelahiran', new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'akta.pdf', { type: 'application/pdf' }));

    await expect(parseRegistrationSubmission(submission)).resolves.toEqual({
      success: false,
      error: 'Isi dokumen Akta Kelahiran tidak sesuai dengan jenis file.',
    });
  });

  it('returns a safe failure when a document header cannot be read', async () => {
    class UnreadableFile extends File {
      override slice() {
        return {
          arrayBuffer: async () => {
            throw new Error('unreadable');
          },
        } as unknown as Blob;
      }
    }

    const submission = makeValidSubmission();
    submission.set('aktaKelahiran', new UnreadableFile([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], 'akta.pdf', { type: 'application/pdf' }));

    await expect(parseRegistrationSubmission(submission)).resolves.toEqual({
      success: false,
      error: 'Dokumen Akta Kelahiran tidak dapat diperiksa.',
    });
  });

  it('never includes submitted identifiers, names, or original filenames in parser errors', async () => {
    const sentinelNik = '9876543210987654';
    const sentinelName = 'NAMA-RAHASIA-SENTINEL';
    const sentinelFilename = `dokumen-${sentinelNik}-${sentinelName}.pdf`;
    const submission = makeValidSubmission();
    submission.set(
      'payload',
      JSON.stringify({
        ...makeValidRegistrationData(),
        nik: sentinelNik,
        namaLengkap: sentinelName,
      }),
    );
    submission.set(
      'aktaKelahiran',
      new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], sentinelFilename, {
        type: 'application/pdf',
      }),
    );

    const result = await parseRegistrationSubmission(submission);

    expect(result).toEqual({
      success: false,
      error: 'Isi dokumen Akta Kelahiran tidak sesuai dengan jenis file.',
    });
    expect(JSON.stringify(result)).not.toContain(sentinelNik);
    expect(JSON.stringify(result)).not.toContain(sentinelName);
    expect(JSON.stringify(result)).not.toContain(sentinelFilename);
  });
});
