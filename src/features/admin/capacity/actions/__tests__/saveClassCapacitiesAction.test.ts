import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  rpc: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({
  getSupabaseAdmin: () => ({ rpc: mocks.rpc }),
}));

import { saveClassCapacitiesAction } from '../saveClassCapacitiesAction';

const idle = { status: 'idle', message: '' } as const;

function form(total: string) {
  const data = new FormData();
  data.set('kapasitasTotal', total);
  return data;
}

describe('saveClassCapacitiesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue(true);
    mocks.rpc.mockResolvedValue({ data: 'ok', error: null });
  });

  it('saves the total capacity through the update_total_capacity RPC', async () => {
    await expect(saveClassCapacitiesAction(idle, form('112'))).resolves.toEqual({
      status: 'success',
      message: 'Kapasitas berhasil disimpan.',
    });
    expect(mocks.rpc).toHaveBeenCalledWith('update_total_capacity', {
      p_total: 112,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pengaturan/kuota');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/pendaftaran');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/');
  });

  it('rejects zero or negative values', async () => {
    const resultZero = await saveClassCapacitiesAction(idle, form('0'));
    expect(resultZero).toEqual({
      status: 'error',
      message: 'Kapasitas total harus berupa bilangan bulat lebih dari 0.',
    });

    const resultNeg = await saveClassCapacitiesAction(idle, form('-5'));
    expect(resultNeg).toEqual({
      status: 'error',
      message: 'Kapasitas total harus berupa bilangan bulat lebih dari 0.',
    });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('rejects non-integer values', async () => {
    const result = await saveClassCapacitiesAction(idle, form('112.5'));
    expect(result).toEqual({
      status: 'error',
      message: 'Kapasitas total harus berupa bilangan bulat lebih dari 0.',
    });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('explains when the new capacity would drop below the currently used seats', async () => {
    mocks.rpc.mockResolvedValue({ data: 'below_used', error: null });

    await expect(saveClassCapacitiesAction(idle, form('50'))).resolves.toEqual({
      status: 'error',
      message: 'Kapasitas total tidak boleh lebih kecil dari kursi yang sudah terpakai.',
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('requires a valid admin session', async () => {
    mocks.session.mockResolvedValue(false);

    await expect(saveClassCapacitiesAction(idle, form('112'))).resolves.toEqual({
      status: 'error',
      message: 'Sesi admin tidak valid. Silakan masuk kembali.',
    });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
