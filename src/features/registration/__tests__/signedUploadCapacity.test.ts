import { describe, expect, it, vi } from 'vitest';
import { finalizeSignedRegistration, prepareSignedRegistration } from '../server/signedUploadService';
import { createSignedUploadRepository, type SignedUploadRepository } from '../server/signedUploadRepository';

vi.mock('../server/supabaseAdmin', async (importOriginal) => ({
  ...await importOriginal<typeof import('../server/supabaseAdmin')>(),
  matchesSubmissionSecret: () => true,
}));

const submissionId = '123e4567-e89b-12d3-a456-426614174000';
const submissionSecret = 'a'.repeat(43);
const paths = {
  aktaKelahiran: `registrations/${submissionId}/aktaKelahiran.pdf`,
  kartuKeluarga: `registrations/${submissionId}/kartuKeluarga.jpg`,
  pasFoto: `registrations/${submissionId}/pasFoto.png`,
  buktiPembayaran: `registrations/${submissionId}/buktiPembayaran.webp`,
};

const CAPACITY_ERROR = 'Kuota Pilihan Kelas yang dipilih sudah penuh. Silakan pilih kelas lain atau hubungi panitia untuk informasi lebih lanjut.';

const registrationData = (overrides: Record<string, string> = {}) => ({
  jenisPendaftaran: 'Siswa Baru',
  pilihanKelas: 'Bilingual',
  namaLengkap: 'Siti Aminah',
  jenisKelamin: 'Perempuan',
  tempatLahir: 'Purwakarta',
  tanggalLahir: '2018-01-01',
  nik: '1234567890123456',
  nisn: '1234567890',
  bekerjaDiDirektorat2: 'Tidak',
  saudaraDiDirektorat2: 'Tidak',
  adaPengusul: 'Tidak',
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
  ...overrides,
});

function preparationInput(overrides: Record<string, string> = {}) {
  const input = credentials();
  input.set('payload', JSON.stringify(registrationData(overrides)));
  input.set('metadata', JSON.stringify([
    { id: 'aktaKelahiran', size: 100, type: 'application/pdf' },
    { id: 'kartuKeluarga', size: 100, type: 'image/jpeg' },
    { id: 'pasFoto', size: 100, type: 'image/png' },
    { id: 'buktiPembayaran', size: 100, type: 'image/webp' },
  ]));
  return input;
}

function preparationRepository(bilingualUsed: number) {
  return {
    consumeRateLimit: vi.fn().mockResolvedValue(true),
    getClassCapacities: vi.fn().mockResolvedValue([
      { pilihanKelas: 'Reguler', kuota: 28, terpakai: 0 },
      { pilihanKelas: 'Bilingual', kuota: 56, terpakai: bilingualUsed },
      { pilihanKelas: 'Tahfizh', kuota: 28, terpakai: 0 },
    ]),
    getPending: vi.fn().mockResolvedValue(null),
    createPending: vi.fn().mockResolvedValue(undefined),
    createUploadToken: vi.fn().mockResolvedValue('token'),
  } as unknown as SignedUploadRepository & {
    getClassCapacities: ReturnType<typeof vi.fn>;
    createPending: ReturnType<typeof vi.fn>;
  };
}

function credentials() {
  const input = new FormData();
  input.set('submissionId', submissionId);
  input.set('submissionSecret', submissionSecret);
  return input;
}

function validDocuments() {
  return [
    new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], { type: 'application/pdf' }),
    new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: 'image/jpeg' }),
    new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], { type: 'image/png' }),
    new Blob([new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])], { type: 'image/webp' }),
  ];
}

function repositoryWithCapacity(available: boolean) {
  const documents = validDocuments();
  const repository = {
    getPending: vi.fn().mockResolvedValue({
      submission_id: submissionId,
      submission_secret_hash: 'trusted',
      upload_expires_at: '2099-01-01T00:00:00.000Z',
      status: 'Menunggu Unggahan',
      dokumen_akta_kelahiran: paths.aktaKelahiran,
      dokumen_kartu_keluarga: paths.kartuKeluarga,
      dokumen_pas_foto: paths.pasFoto,
      dokumen_bukti_pembayaran: paths.buktiPembayaran,
    }),
    pathsFromRow: vi.fn().mockReturnValue(paths),
    download: vi.fn().mockImplementation(() => Promise.resolve(documents.shift())),
    finalize: vi.fn().mockResolvedValue(available),
    removePending: vi.fn().mockResolvedValue(undefined),
  };
  return repository as unknown as SignedUploadRepository & {
    finalize: ReturnType<typeof vi.fn>;
    removePending: ReturnType<typeof vi.fn>;
  };
}

describe('signed upload capacity', () => {
  it('accepts a Siswa Baru while the chosen class still has seats', async () => {
    const repository = preparationRepository(55);

    const result = await prepareSignedRegistration(preparationInput(), 'source', repository, () => 'hash');
    expect(result.success).toBe(true);
    expect(repository.createPending).toHaveBeenCalledOnce();
  });

  it('rejects a Siswa Baru when the chosen class is full without creating a pending row', async () => {
    const repository = preparationRepository(56);

    await expect(prepareSignedRegistration(preparationInput(), 'source', repository, () => 'hash'))
      .resolves.toEqual({ success: false, error: CAPACITY_ERROR });
    expect(repository.createPending).not.toHaveBeenCalled();
  });

  it('lets a Pindahan register even when the chosen class is full', async () => {
    const repository = preparationRepository(56);

    const result = await prepareSignedRegistration(
      preparationInput({ jenisPendaftaran: 'Pindahan', kelasTujuan: '3' }),
      'source',
      repository,
      () => 'hash',
    );
    expect(result.success).toBe(true);
    expect(repository.getClassCapacities).not.toHaveBeenCalled();
  });

  it('finalizes through the atomic class capacity check', async () => {
    const repository = repositoryWithCapacity(true);

    await expect(finalizeSignedRegistration(credentials(), repository)).resolves.toEqual({ success: true });
    expect(repository.finalize).toHaveBeenCalledWith(submissionId);
    expect(repository.removePending).not.toHaveBeenCalled();
  });

  it('rejects finalization when the class filled up meanwhile and cleans up the pending row and documents', async () => {
    const repository = repositoryWithCapacity(false);

    await expect(finalizeSignedRegistration(credentials(), repository)).resolves.toEqual({
      success: false,
      error: CAPACITY_ERROR,
    });
    expect(repository.removePending).toHaveBeenCalledWith(submissionId, Object.values(paths));
  });

  it('maps repository finalization to the atomic capacity RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    const repository = createSignedUploadRepository({ rpc } as never);

    await expect(repository.finalize(submissionId)).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith('finalize_registration_with_capacity', {
      p_submission_id: submissionId,
    });
  });

  it('reads class capacity from the usage RPC in a fixed class order', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        { pilihan_kelas: 'Tahfizh', kuota: 28, terpakai: 3 },
        { pilihan_kelas: 'Bilingual', kuota: 56, terpakai: 40 },
      ],
      error: null,
    });
    const repository = createSignedUploadRepository({ rpc } as never);

    await expect(repository.getClassCapacities()).resolves.toEqual([
      { pilihanKelas: 'Reguler', kuota: 0, terpakai: 0 },
      { pilihanKelas: 'Bilingual', kuota: 56, terpakai: 40 },
      { pilihanKelas: 'Tahfizh', kuota: 28, terpakai: 3 },
    ]);
    expect(rpc).toHaveBeenCalledWith('get_class_capacity_usage');
  });
});
