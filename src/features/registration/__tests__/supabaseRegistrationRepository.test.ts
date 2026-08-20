import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RegistrationDocumentId, ValidatedDocument } from '@/features/registration/contracts';
import type { FormData as RegistrationData } from '@/features/registration/schema';
import {
  DuplicateRegistrationError,
  processRegistrationSubmission,
} from '@/features/registration/server/submissionService';
import {
  RegistrationPersistenceError,
  createSupabaseRegistrationRepository,
} from '@/features/registration/server/supabaseRegistrationRepository';

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock,
}));

const registrationData: RegistrationData = {
  jenisPendaftaran: 'Siswa Baru',
  pilihanKelas: 'Reguler',
  namaLengkap: 'Siti Aminah',
  jenisKelamin: 'Perempuan',
  tempatLahir: 'Purwakarta',
  tanggalLahir: '2018-01-01',
  nik: '1234567890123456',
  nisn: '1234567890',
  bekerjaDiDirektorat2: 'Ya',
  profesiDiDirektorat2: 'Guru',
  asalSekolah: 'TK Melati',
  prestasiAnak: 'Juara menggambar',
  tingkatPrestasi: 'Kabupaten/Kota',
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
  penghasilanIbu: '2-5 Juta',
  teleponIbu: '081234567891',
  alamatIbu: 'Jalan Melati Nomor 1',
};

const documentPaths: Record<RegistrationDocumentId, string> = {
  aktaKelahiran: 'registrations/submission/aktaKelahiran.pdf',
  kartuKeluarga: 'registrations/submission/kartuKeluarga.jpg',
  pasFoto: 'registrations/submission/pasFoto.png',
  buktiPembayaran: 'registrations/submission/buktiPembayaran.webp',
};

type MockError = { code?: string; message: string } | null;

function makeClient(errors: {
  upload?: MockError;
  remove?: MockError;
  rpc?: MockError;
  insert?: MockError;
} = {}) {
  const upload = vi.fn().mockResolvedValue({ data: null, error: errors.upload ?? null });
  const remove = vi.fn().mockResolvedValue({ data: null, error: errors.remove ?? null });
  const storageFrom = vi.fn(() => ({ upload, remove }));
  const rpc = vi.fn().mockResolvedValue({ data: true, error: errors.rpc ?? null });
  const insert = vi.fn().mockResolvedValue({ data: null, error: errors.insert ?? null });
  const from = vi.fn(() => ({ insert }));

  return {
    client: { storage: { from: storageFrom }, rpc, from },
    spies: { upload, remove, storageFrom, rpc, insert, from },
  };
}

function makeValidSubmission() {
  const submission = new FormData();
  submission.set('payload', JSON.stringify(registrationData));
  submission.set('website', '');
  submission.set(
    'aktaKelahiran',
    new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], 'akta.pdf', {
      type: 'application/pdf',
    }),
  );
  submission.set(
    'kartuKeluarga',
    new File([new Uint8Array([0xff, 0xd8, 0xff])], 'kk.jpg', { type: 'image/jpeg' }),
  );
  submission.set(
    'pasFoto',
    new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      'foto.png',
      { type: 'image/png' },
    ),
  );
  submission.set(
    'buktiPembayaran',
    new File(
      [new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])],
      'bayar.webp',
      { type: 'image/webp' },
    ),
  );
  return submission;
}

describe('server-only Supabase admin helpers', () => {
  beforeEach(() => {
    vi.resetModules();
    createClientMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    ['NEXT_PUBLIC_SUPABASE_URL', '', 'test-service-role-key'],
    ['SUPABASE_SERVICE_ROLE_KEY', 'https://example.supabase.co', ''],
  ])('throws a controlled configuration error when %s is missing', async (_name, url, key) => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', url);
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', key);
    const { getSupabaseAdmin, SupabaseConfigurationError } = await import(
      '@/features/registration/server/supabaseAdmin'
    );

    expect(() => getSupabaseAdmin()).toThrow(SupabaseConfigurationError);
    expect(() => getSupabaseAdmin()).toThrow('Supabase server configuration is unavailable');
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('creates and memoizes the privileged client lazily with disabled session behavior', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');
    const adminClient = { kind: 'admin-client' };
    createClientMock.mockReturnValue(adminClient);
    const { getSupabaseAdmin } = await import('@/features/registration/server/supabaseAdmin');

    expect(createClientMock).not.toHaveBeenCalled();
    expect(getSupabaseAdmin()).toBe(adminClient);
    expect(getSupabaseAdmin()).toBe(adminClient);
    expect(createClientMock).toHaveBeenCalledOnce();
    expect(createClientMock).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'test-service-role-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );
  });

  it('prefers the trusted Vercel address and has a safe local fallback', async () => {
    const { getSourceAddress } = await import('@/features/registration/server/supabaseAdmin');

    expect(
      getSourceAddress(
        new Headers({
          'x-vercel-forwarded-for': ' 203.0.113.10 , 198.51.100.2 ',
          'x-real-ip': '192.0.2.9',
        }),
      ),
    ).toBe('203.0.113.10');
    expect(getSourceAddress(new Headers({ 'x-real-ip': ' 192.0.2.9 ' }))).toBe('192.0.2.9');
    expect(getSourceAddress(new Headers())).toBe('local-development');
  });

  it('HMAC-hashes a source deterministically without retaining the raw source', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');
    const { hashRegistrationSource } = await import(
      '@/features/registration/server/supabaseAdmin'
    );
    const source = '203.0.113.10';

    const first = hashRegistrationSource(source);
    const second = hashRegistrationSource(source);
    const other = hashRegistrationSource('203.0.113.11');

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toContain(source);
    expect(other).not.toBe(first);
  });

  it('marks both admin adapter modules as server-only and never references the anon key', () => {
    for (const relativePath of [
      'src/features/registration/server/supabaseAdmin.ts',
      'src/features/registration/server/supabaseRegistrationRepository.ts',
    ]) {
      const source = readFileSync(join(process.cwd(), relativePath), 'utf8');
      expect(source).toContain("import 'server-only'");
      expect(source).not.toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
  });
});

describe('createSupabaseRegistrationRepository', () => {
  it('uploads to the private document bucket with trusted immutable options', async () => {
    const { client, spies } = makeClient();
    const repository = createSupabaseRegistrationRepository(client);
    const file = new File(['not-a-real-png'], 'misleading.pdf', { type: 'application/pdf' });
    const document: ValidatedDocument = {
      file,
      extension: 'png',
      mimeType: 'image/png',
    };

    await repository.uploadDocument(documentPaths.pasFoto, document);

    expect(spies.storageFrom).toHaveBeenCalledWith('dokumen_pendaftaran');
    expect(spies.upload).toHaveBeenCalledWith(documentPaths.pasFoto, file, {
      upsert: false,
      contentType: 'image/png',
      cacheControl: '3600',
    });
  });

  it('removes exactly the supplied private paths from the document bucket', async () => {
    const { client, spies } = makeClient();
    const repository = createSupabaseRegistrationRepository(client);
    const paths = [documentPaths.aktaKelahiran, documentPaths.kartuKeluarga];

    await repository.removeDocuments(paths);

    expect(spies.storageFrom).toHaveBeenCalledWith('dokumen_pendaftaran');
    expect(spies.remove).toHaveBeenCalledWith(paths);
  });

  it('calls the atomic rate-limit RPC with the complete parameter mapping', async () => {
    const { client, spies } = makeClient();
    const repository = createSupabaseRegistrationRepository(client);

    await expect(repository.consumeRateLimit('identifier-hash', 5, 900)).resolves.toBe(true);
    expect(spies.rpc).toHaveBeenCalledWith('consume_registration_rate_limit', {
      p_identifier_hash: 'identifier-hash',
      p_limit: 5,
      p_window_seconds: 900,
    });
  });

  it('inserts every applicant column and all four private document paths', async () => {
    const { client, spies } = makeClient();
    const repository = createSupabaseRegistrationRepository(client);

    await repository.insertRegistration(registrationData, documentPaths);

    expect(spies.from).toHaveBeenCalledWith('pendaftar');
    expect(spies.insert).toHaveBeenCalledWith([
      {
        jenis_pendaftaran: 'Siswa Baru',
        pilihan_kelas: 'Reguler',
        nama_lengkap: 'Siti Aminah',
        jenis_kelamin: 'Perempuan',
        tempat_lahir: 'Purwakarta',
        tanggal_lahir: '2018-01-01',
        nik: '1234567890123456',
        nisn: '1234567890',
        bekerja_di_direktorat2: 'Ya',
        profesi_di_direktorat2: 'Guru',
        asal_sekolah: 'TK Melati',
        prestasi_anak: 'Juara menggambar',
        tingkat_prestasi: 'Kabupaten/Kota',
        jarak_ke_sekolah: '2 km',
        alamat_jalan: 'Jalan Melati',
        rt: '01',
        rw: '02',
        kelurahan: 'Ciseureuh',
        kecamatan: 'Purwakarta',
        kota: 'Purwakarta',
        provinsi: 'Jawa Barat',
        alamat_rumah:
          'Jalan Melati, RT 01/RW 02, Kel. Ciseureuh, Kec. Purwakarta, Kota/Kab. Purwakarta, Prov. Jawa Barat',
        nama_ayah: 'Budi Santoso',
        nik_ayah: '2345678901234567',
        pendidikan_ayah: 'SMA',
        pekerjaan_ayah: 'Wiraswasta',
        penghasilan_ayah: '5-10 Juta',
        telepon_ayah: '081234567890',
        no_telp: '081234567890',
        alamat_ayah: 'Jalan Melati Nomor 1',
        nama_ibu: 'Ani Santoso',
        nik_ibu: '3456789012345678',
        pendidikan_ibu: 'SMA',
        pekerjaan_ibu: 'Ibu Rumah Tangga',
        penghasilan_ibu: '2-5 Juta',
        telepon_ibu: '081234567891',
        alamat_ibu: 'Jalan Melati Nomor 1',
        dokumen_akta_kelahiran: documentPaths.aktaKelahiran,
        dokumen_kartu_keluarga: documentPaths.kartuKeluarga,
        dokumen_pas_foto: documentPaths.pasFoto,
        dokumen_bukti_pembayaran: documentPaths.buktiPembayaran,
      },
    ]);
  });

  it('maps database code 23505 to DuplicateRegistrationError', async () => {
    const { client } = makeClient({
      insert: { code: '23505', message: 'duplicate key violates constraint uq_pendaftar_nik' },
    });
    const repository = createSupabaseRegistrationRepository(client);

    await expect(repository.insertRegistration(registrationData, documentPaths)).rejects.toBeInstanceOf(
      DuplicateRegistrationError,
    );
  });

  it.each([
    ['upload', { upload: { message: 'raw upload details' } }, 'uploadDocument'],
    ['remove', { remove: { message: 'raw remove details' } }, 'removeDocuments'],
    ['RPC', { rpc: { message: 'raw RPC details' } }, 'consumeRateLimit'],
    ['insert', { insert: { message: 'raw database details' } }, 'insertRegistration'],
  ] as const)('turns a %s error into a typed safe internal error', async (_name, errors, method) => {
    const { client } = makeClient(errors);
    const repository = createSupabaseRegistrationRepository(client);
    const operation = {
      uploadDocument: () =>
        repository.uploadDocument(documentPaths.aktaKelahiran, {
          file: new File(['%PDF'], 'akta.pdf', { type: 'application/pdf' }),
          extension: 'pdf',
          mimeType: 'application/pdf',
        }),
      removeDocuments: () => repository.removeDocuments([documentPaths.aktaKelahiran]),
      consumeRateLimit: () => repository.consumeRateLimit('identifier-hash', 5, 900),
      insertRegistration: () => repository.insertRegistration(registrationData, documentPaths),
    }[method];

    const error = await operation().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(RegistrationPersistenceError);
    expect(error).toHaveProperty('message', 'Registration persistence operation failed');
    expect(String(error)).not.toContain('raw');
  });

  it('never exposes a raw Supabase storage message in an action result', async () => {
    const { client } = makeClient({ upload: { message: 'raw private bucket details' } });
    const repository = createSupabaseRegistrationRepository(client);

    const result = await processRegistrationSubmission(
      makeValidSubmission(),
      null,
      repository,
      () => '123e4567-e89b-12d3-a456-426614174000',
    );

    expect(result).toEqual({
      success: false,
      error: 'Terjadi kesalahan saat menyimpan data pendaftaran.',
    });
    expect(JSON.stringify(result)).not.toContain('raw private bucket details');
  });
});
