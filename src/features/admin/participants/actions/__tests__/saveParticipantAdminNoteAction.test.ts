import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  maybeSingle: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({
  getSupabaseAdmin: () => ({ from: () => ({ update: mocks.update, eq: mocks.eq, select: mocks.select, maybeSingle: mocks.maybeSingle }) }),
}));

import { saveParticipantAdminNoteAction } from '../saveParticipantAdminNoteAction';

const participantId = '123e4567-e89b-12d3-a456-426614174000';
function form(note: string) {
  const data = new FormData();
  data.set('participantId', participantId);
  data.set('adminNote', note);
  return data;
}

describe('saveParticipantAdminNoteAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue(true);
    mocks.update.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ maybeSingle: mocks.maybeSingle });
    mocks.maybeSingle.mockResolvedValue({ data: { id: participantId }, error: null });
  });

  it('saves one internal participant note and revalidates the detail page', async () => {
    await saveParticipantAdminNoteAction(form('Hubungi orang tua untuk meminta ulang KK.'));
    expect(mocks.update).toHaveBeenCalledWith({ catatan_admin: 'Hubungi orang tua untuk meminta ulang KK.' });
    expect(mocks.eq).toHaveBeenCalledWith('id', participantId);
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/admin/pendaftar/${participantId}`);
  });

  it('allows clearing the shared note', async () => {
    await saveParticipantAdminNoteAction(form('  '));
    expect(mocks.update).toHaveBeenCalledWith({ catatan_admin: null });
  });

  it('requires a valid admin session', async () => {
    mocks.session.mockResolvedValue(false);
    await expect(saveParticipantAdminNoteAction(form('Catatan'))).rejects.toThrow('Sesi admin tidak valid.');
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
