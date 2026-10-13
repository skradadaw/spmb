import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  revalidatePath: vi.fn(),
  readRow: vi.fn(),
  update: vi.fn(),
  updateResult: vi.fn(),
  deleteReview: vi.fn(),
  createSignedUploadUrl: vi.fn(),
  download: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => table === 'verifikasi_dokumen'
      ? { delete: () => ({ eq: () => ({ eq: (_column: string, value: unknown) => mocks.deleteReview(value) }) }) }
      : {
          select: () => ({ eq: () => ({ maybeSingle: mocks.readRow }) }),
          update: (values: unknown) => { mocks.update(values); return { eq: mocks.updateResult }; },
        },
    storage: { from: () => ({ createSignedUploadUrl: mocks.createSignedUploadUrl, download: mocks.download, remove: mocks.remove }) },
  }),
}));

import { commitDocumentReplacementAction, prepareDocumentReplacementAction } from '../replaceDocumentActions';

const participantId = '123e4567-e89b-12d3-a456-426614174000';
const submissionId = '223e4567-e89b-12d3-a456-426614174000';
const oldPath = `registrations/${submissionId}/kartuKeluarga.jpg`;
const newPath = `registrations/${submissionId}/kartuKeluarga-r1760400000000.pdf`;
const pdf = new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], { type: 'application/pdf' });

describe('admin document replacement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue(true);
    mocks.readRow.mockResolvedValue({ data: { id: participantId, submission_id: submissionId, dokumen_kartu_keluarga: oldPath }, error: null });
    mocks.createSignedUploadUrl.mockResolvedValue({ data: { token: 'signed-token' }, error: null });
    mocks.download.mockResolvedValue({ data: pdf, error: null });
    mocks.remove.mockResolvedValue({ error: null });
    mocks.updateResult.mockResolvedValue({ error: null });
    mocks.deleteReview.mockResolvedValue({ error: null });
  });

  it('prepares a signed upload to a new versioned path without touching the row', async () => {
    const result = await prepareDocumentReplacementAction(participantId, 'kartuKeluarga', { size: 1000, type: 'application/pdf' });

    expect(result).toMatchObject({ success: true, token: 'signed-token' });
    expect(result.success && result.path).toMatch(new RegExp(`^registrations/${submissionId}/kartuKeluarga-r\\d{13}\\.pdf$`));
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('applies the registration file rules before issuing an upload URL', async () => {
    await expect(prepareDocumentReplacementAction(participantId, 'kartuKeluarga', { size: 1000, type: 'image/gif' }))
      .resolves.toEqual({ success: false, error: 'Format berkas harus PDF, JPG, PNG, atau WebP.' });
    await expect(prepareDocumentReplacementAction(participantId, 'kartuKeluarga', { size: 5_242_881, type: 'image/png' }))
      .resolves.toEqual({ success: false, error: 'Ukuran berkas maksimal 5 MB.' });
    expect(mocks.createSignedUploadUrl).not.toHaveBeenCalled();
  });

  it('swaps in a valid replacement, resets its review, then deletes the old file', async () => {
    await expect(commitDocumentReplacementAction(participantId, 'kartuKeluarga', newPath)).resolves.toEqual({ success: true });

    expect(mocks.update).toHaveBeenCalledWith({ dokumen_kartu_keluarga: newPath });
    expect(mocks.deleteReview).toHaveBeenCalledWith('kartuKeluarga');
    expect(mocks.remove).toHaveBeenCalledWith([oldPath]);
    expect(mocks.update.mock.invocationCallOrder[0]).toBeLessThan(mocks.remove.mock.invocationCallOrder[0]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/admin/pendaftar/${participantId}`);
  });

  it('fills a document that was never uploaded', async () => {
    mocks.readRow.mockResolvedValue({ data: { id: participantId, submission_id: submissionId, dokumen_kartu_keluarga: null }, error: null });

    await expect(commitDocumentReplacementAction(participantId, 'kartuKeluarga', newPath)).resolves.toEqual({ success: true });
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it('discards an upload whose content is not a real document and keeps the old file', async () => {
    mocks.download.mockResolvedValue({ data: new Blob(['not a pdf'], { type: 'application/pdf' }), error: null });

    const result = await commitDocumentReplacementAction(participantId, 'kartuKeluarga', newPath);
    expect(result).toMatchObject({ success: false });
    expect(mocks.remove).toHaveBeenCalledWith([newPath]);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rejects paths outside this applicant, for another document, or the current file', async () => {
    const otherSubmission = `registrations/323e4567-e89b-12d3-a456-426614174000/kartuKeluarga-r1760400000000.pdf`;
    for (const path of [otherSubmission, `registrations/${submissionId}/pasFoto-r1760400000000.pdf`, oldPath, '../secret']) {
      await expect(commitDocumentReplacementAction(participantId, 'kartuKeluarga', path)).resolves.toEqual({ success: false, error: 'Data berkas tidak valid.' });
    }
    expect(mocks.download).not.toHaveBeenCalled();
  });

  it('requires a valid admin session', async () => {
    mocks.session.mockResolvedValue(false);
    await expect(prepareDocumentReplacementAction(participantId, 'kartuKeluarga', { size: 1000, type: 'application/pdf' })).resolves.toMatchObject({ success: false });
    await expect(commitDocumentReplacementAction(participantId, 'kartuKeluarga', newPath)).resolves.toMatchObject({ success: false });
    expect(mocks.readRow).not.toHaveBeenCalled();
  });
});
