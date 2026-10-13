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
  getSupabaseAdmin: () => ({ from: () => ({ update: mocks.update }) }),
}));

import { setNisnFlagAction } from '../setNisnFlagAction';

const participantId = '123e4567-e89b-12d3-a456-426614174000';
function form(flagged: string, id = participantId) {
  const data = new FormData();
  data.set('participantId', id);
  data.set('flagged', flagged);
  return data;
}

describe('setNisnFlagAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue(true);
    mocks.update.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ maybeSingle: mocks.maybeSingle });
    mocks.maybeSingle.mockResolvedValue({ data: { id: participantId }, error: null });
  });

  it('marks the NISN and refreshes the detail, list and dashboard', async () => {
    await setNisnFlagAction(form('true'));
    expect(mocks.update).toHaveBeenCalledWith({ nisn_tidak_sesuai: true });
    expect(mocks.eq).toHaveBeenCalledWith('id', participantId);
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/admin/pendaftar/${participantId}`);
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pendaftar');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin');
  });

  it('clears the mark manually', async () => {
    await setNisnFlagAction(form('false'));
    expect(mocks.update).toHaveBeenCalledWith({ nisn_tidak_sesuai: false });
  });

  it('rejects invalid input and missing sessions', async () => {
    await expect(setNisnFlagAction(form('maybe'))).rejects.toThrow('Penanda NISN tidak valid.');
    await expect(setNisnFlagAction(form('true', 'bukan-uuid'))).rejects.toThrow('Data peserta tidak valid.');
    mocks.session.mockResolvedValue(false);
    await expect(setNisnFlagAction(form('true'))).rejects.toThrow('Sesi admin tidak valid.');
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('reports a failed update', async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: { message: 'x' } });
    await expect(setNisnFlagAction(form('true'))).rejects.toThrow('Penanda NISN tidak dapat disimpan.');
  });
});
