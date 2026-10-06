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
  it('keeps registration open regardless of date while capacity remains', async () => {
    vi.stubEnv('REGISTRATION_OVERRIDE', 'closed');
    vi.stubEnv('REGISTRATION_OPENS_AT', '2099-01-01T00:00:00+07:00');
    const repository = {
      consumeRateLimit: vi.fn().mockResolvedValue(true),
      hasCapacity: vi.fn().mockResolvedValue(true),
    } as unknown as SignedUploadRepository;

    await expect(prepareSignedRegistration(new FormData(), 'source', repository, vi.fn()))
      .resolves.toEqual({ success: false, error: 'Data pendaftaran atau dokumen tidak valid.' });
    expect(repository.hasCapacity).toHaveBeenCalledWith(112);
    vi.unstubAllEnvs();
  });

  it('closes registration preparation as soon as 112 completed participants are reached', async () => {
    const repository = {
      consumeRateLimit: vi.fn().mockResolvedValue(true),
      hasCapacity: vi.fn().mockResolvedValue(false),
    } as unknown as SignedUploadRepository;

    await expect(prepareSignedRegistration(new FormData(), 'source', repository, vi.fn()))
      .resolves.toEqual({
        success: false,
        error: 'Kuota pendaftaran sudah penuh (112 peserta). Silakan hubungi panitia untuk informasi lebih lanjut.',
      });
  });

  it('finalizes through the atomic 112-participant capacity check', async () => {
    const repository = repositoryWithCapacity(true);

    await expect(finalizeSignedRegistration(credentials(), repository)).resolves.toEqual({ success: true });
    expect(repository.finalize).toHaveBeenCalledWith(submissionId, 112);
    expect(repository.removePending).not.toHaveBeenCalled();
  });

  it('rejects participant 113 and cleans up the pending row and documents', async () => {
    const repository = repositoryWithCapacity(false);

    await expect(finalizeSignedRegistration(credentials(), repository)).resolves.toEqual({
      success: false,
      error: 'Kuota pendaftaran sudah penuh (112 peserta). Silakan hubungi panitia untuk informasi lebih lanjut.',
    });
    expect(repository.removePending).toHaveBeenCalledWith(submissionId, Object.values(paths));
  });

  it('maps repository finalization to the atomic capacity RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    const repository = createSignedUploadRepository({ rpc } as never);

    await expect(repository.finalize(submissionId, 112)).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith('finalize_registration_with_capacity', {
      p_submission_id: submissionId,
      p_capacity: 112,
    });
  });

  it('checks preparation capacity from completed database registrations', async () => {
    const neq = vi.fn().mockResolvedValue({ count: 111, error: null });
    const select = vi.fn().mockReturnValue({ neq });
    const from = vi.fn().mockReturnValue({ select });
    const repository = createSignedUploadRepository({ from } as never);

    await expect(repository.hasCapacity(112)).resolves.toBe(true);
    expect(select).toHaveBeenCalledWith('id', { count: 'exact', head: true });
    expect(neq).toHaveBeenCalledWith('status', 'Menunggu Unggahan');
  });
});
