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

function form(reguler: string, bilingual: string, tahfizh: string) {
  const data = new FormData();
  data.set('Reguler', reguler);
  data.set('Bilingual', bilingual);
  data.set('Tahfizh', tahfizh);
  return data;
}

describe('saveClassCapacitiesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue(true);
    mocks.rpc.mockResolvedValue({ data: 'ok', error: null });
  });

  it('moves unused Tahfizh seats to Reguler while keeping the 112 total', async () => {
    await expect(saveClassCapacitiesAction(idle, form('41', '56', '15'))).resolves.toEqual({
      status: 'success',
      message: 'Kuota kelas berhasil disimpan.',
    });
    expect(mocks.rpc).toHaveBeenCalledWith('update_class_capacities', {
      p_reguler: 41,
      p_bilingual: 56,
      p_tahfizh: 15,
      p_total: 112,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/pendaftaran');
  });

  it('rejects a split that does not add up to 112 before touching the database', async () => {
    await expect(saveClassCapacitiesAction(idle, form('30', '56', '28'))).resolves.toEqual({
      status: 'error',
      message: 'Jumlah kuota harus tepat 112 kursi (saat ini 114).',
    });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('rejects negative or non-integer values', async () => {
    const result = await saveClassCapacitiesAction(idle, form('28.5', '56', '27.5'));
    expect(result).toEqual({ status: 'error', message: 'Kuota Reguler harus berupa bilangan bulat 0 atau lebih.' });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('explains when a class would drop below its used seats', async () => {
    mocks.rpc.mockResolvedValue({ data: 'below_used:Bilingual', error: null });

    await expect(saveClassCapacitiesAction(idle, form('48', '36', '28'))).resolves.toEqual({
      status: 'error',
      message: 'Kuota Bilingual tidak boleh lebih kecil dari kursi yang sudah terpakai.',
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('requires a valid admin session', async () => {
    mocks.session.mockResolvedValue(false);

    await expect(saveClassCapacitiesAction(idle, form('28', '56', '28'))).resolves.toEqual({
      status: 'error',
      message: 'Sesi admin tidak valid. Silakan masuk kembali.',
    });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
