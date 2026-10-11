import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  getDocumentRow: vi.fn(),
  upsert: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: () => ({ from: () => ({ upsert: mocks.upsert }) }) }));
vi.mock('../../server/participantsRepository', () => ({ createParticipantsRepository: () => ({ getDocumentRow: mocks.getDocumentRow }) }));

import { saveDocumentReviewAction } from '../saveDocumentReviewAction';

const participantId = '123e4567-e89b-12d3-a456-426614174000';
function form(status: string) {
  const data = new FormData();
  data.set('participantId', participantId);
  data.set('documentId', 'aktaKelahiran');
  data.set('status', status);
  return data;
}

describe('saveDocumentReviewAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue(true);
    mocks.getDocumentRow.mockResolvedValue({ dokumen_akta_kelahiran: 'registrations/test/aktaKelahiran.pdf' });
    mocks.upsert.mockResolvedValue({ error: null });
  });

  it('rejects requests without an admin session', async () => {
    mocks.session.mockResolvedValue(false);
    await expect(saveDocumentReviewAction(form('verified'))).rejects.toThrow('Sesi admin tidak valid.');
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it('allows per-document follow-up without a document-specific note', async () => {
    await saveDocumentReviewAction(form('follow_up'));
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({ status: 'follow_up' }), { onConflict: 'pendaftar_id,dokumen_id' });
  });

  it('saves review metadata and refreshes only that participant detail', async () => {
    await saveDocumentReviewAction(form('follow_up'));
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({
      pendaftar_id: participantId,
      dokumen_id: 'aktaKelahiran',
      status: 'follow_up',

      diperiksa_oleh: 'Admin',
    }), { onConflict: 'pendaftar_id,dokumen_id' });
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/admin/pendaftar/${participantId}`);
  });
});
