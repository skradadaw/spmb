import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ session: vi.fn(), revalidatePath: vi.fn(), save: vi.fn() }));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: () => ({}) }));
vi.mock('@/features/announcement/server/letterNumberRepository', () => ({ createLetterNumberRepository: () => ({ save: mocks.save }) }));

import { saveLetterNumberAction } from '../letterNumberActions';

const idle = { status: 'idle' as const, message: '' };

function form(format: string, nomorAwal: string) {
  const data = new FormData();
  data.set('format', format);
  data.set('nomorAwal', nomorAwal);
  return data;
}

describe('saveLetterNumberAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue(true);
    mocks.save.mockResolvedValue(undefined);
  });

  it('saves the format and starting number and refreshes the Pengumuman page', async () => {
    expect(await saveLetterNumberAction(idle, form('400.3.10.1/{urut}-SDS3AM/OKB/2026', '350'))).toEqual({ status: 'success', message: 'Nomor surat tersimpan.' });
    expect(mocks.save).toHaveBeenCalledWith({ format: '400.3.10.1/{urut}-SDS3AM/OKB/2026', nomorAwal: 350 });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/okb/pengumuman');
  });

  it('saves nothing when the format or starting number is invalid', async () => {
    expect((await saveLetterNumberAction(idle, form('400.3.10.1/350', '350'))).status).toBe('error');
    expect((await saveLetterNumberAction(idle, form('400/{urut}', '0'))).status).toBe('error');
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it('reports a failed save and rejects a missing admin session', async () => {
    mocks.save.mockRejectedValue(new Error('db'));
    expect(await saveLetterNumberAction(idle, form('400/{urut}', '350'))).toEqual({ status: 'error', message: 'Nomor surat tidak dapat disimpan. Silakan coba lagi.' });
    mocks.session.mockResolvedValue(false);
    mocks.save.mockClear();
    expect(await saveLetterNumberAction(idle, form('400/{urut}', '350'))).toEqual({ status: 'error', message: 'Sesi admin tidak valid. Silakan masuk kembali.' });
    expect(mocks.save).not.toHaveBeenCalled();
  });
});
