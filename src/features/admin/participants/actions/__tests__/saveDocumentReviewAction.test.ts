import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  getDocumentRow: vi.fn(),
  upsert: vi.fn(),
  reviewRows: vi.fn(),
  updateStatus: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: () => ({ from: (table: string) => table === 'verifikasi_dokumen' ? { upsert: mocks.upsert, select: () => ({ eq: mocks.reviewRows }) } : { update: () => ({ eq: () => ({ eq: mocks.updateStatus }) }) } }) }));
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
    mocks.getDocumentRow.mockResolvedValue({ dokumen_akta_kelahiran: 'registrations/test/aktaKelahiran.pdf', dokumen_kartu_keluarga: 'registrations/test/kk.pdf', dokumen_pas_foto: 'registrations/test/foto.png', dokumen_bukti_pembayaran: 'registrations/test/bukti.pdf' });
    mocks.upsert.mockResolvedValue({ error: null });
    mocks.reviewRows.mockResolvedValue({ data: [{ dokumen_id: 'aktaKelahiran', status: 'verified' }, { dokumen_id: 'kartuKeluarga', status: 'verified' }, { dokumen_id: 'pasFoto', status: 'verified' }, { dokumen_id: 'buktiPembayaran', status: 'verified' }], error: null });
    mocks.updateStatus.mockResolvedValue({ error: null });
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

  it('marks participant verified when every required document is uploaded and reviewed', async () => {
    await saveDocumentReviewAction(form('verified'));
    expect(mocks.updateStatus).toHaveBeenCalledWith('status', 'Menunggu Verifikasi');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pendaftar');
  });

  it('does not mark participant verified when any required document is missing', async () => {
    mocks.getDocumentRow.mockResolvedValue({ dokumen_akta_kelahiran: 'akta.pdf', dokumen_kartu_keluarga: 'kk.pdf', dokumen_pas_foto: 'foto.png', dokumen_bukti_pembayaran: null });
    await saveDocumentReviewAction(form('verified'));
    expect(mocks.updateStatus).not.toHaveBeenCalled();
  });

  it('does not mark participant verified when any review needs follow-up', async () => {
    mocks.reviewRows.mockResolvedValue({ data: [{ dokumen_id: 'aktaKelahiran', status: 'verified' }, { dokumen_id: 'kartuKeluarga', status: 'verified' }, { dokumen_id: 'pasFoto', status: 'follow_up' }, { dokumen_id: 'buktiPembayaran', status: 'verified' }], error: null });
    await saveDocumentReviewAction(form('verified'));
    expect(mocks.updateStatus).not.toHaveBeenCalled();
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
