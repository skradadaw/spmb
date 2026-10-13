import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  revalidatePath: vi.fn(),
  lookup: vi.fn(),
  update: vi.fn(),
  updateResult: vi.fn(),
  updateFilters: [] as Array<[string, unknown]>,
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({
  getSupabaseAdmin: () => ({
    from: () => {
      const updateChain = {
        eq: (column: string, value: unknown) => { mocks.updateFilters.push([column, value]); return updateChain; },
        select: () => ({ maybeSingle: mocks.updateResult }),
      };
      return {
        select: () => ({ eq: (_column: string, value: unknown) => ({ maybeSingle: () => mocks.lookup(value) }) }),
        update: (values: unknown) => { mocks.update(values); return updateChain; },
      };
    },
  }),
}));

import { scanAttendanceAction } from '../scanAttendanceAction';

const row = (overrides: Record<string, unknown> = {}) => ({
  id: 'p-1',
  nomor_pendaftaran: 'OB-2027-001',
  nama_lengkap: 'Siti Aminah',
  status: 'Terjadwal OKB',
  jadwal_okb_tanggal: '2026-11-07',
  jadwal_okb_sesi: 'Sesi 1',
  ...overrides,
});

describe('scanAttendanceAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateFilters.length = 0;
    mocks.session.mockResolvedValue(true);
    mocks.updateResult.mockResolvedValue({ data: { id: 'p-1' }, error: null });
    // 7 Nov 2026 08.00 WIB = 01.00 UTC
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-07T01:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('marks a scheduled applicant present when scanned on their OKB date', async () => {
    mocks.lookup.mockResolvedValue({ data: row(), error: null });

    const result = await scanAttendanceAction(' ob-2027-001 ');
    expect(mocks.lookup).toHaveBeenCalledWith('OB-2027-001');
    expect(result).toMatchObject({ outcome: 'present', message: 'Hadir tercatat.', applicant: { namaLengkap: 'Siti Aminah', status: 'Sudah OKB' } });
    expect(mocks.update).toHaveBeenCalledWith({ status: 'Sudah OKB' });
    expect(mocks.updateFilters).toContainEqual(['status', 'Terjadwal OKB']);
    expect(mocks.updateFilters).toContainEqual(['jadwal_okb_tanggal', '2026-11-07']);
  });

  it('uses the Jakarta date, not the UTC date, near midnight', async () => {
    vi.setSystemTime(new Date('2026-11-06T18:30:00Z')); // 7 Nov 01.30 WIB
    mocks.lookup.mockResolvedValue({ data: row(), error: null });

    await expect(scanAttendanceAction('OB-2027-001')).resolves.toMatchObject({ outcome: 'present' });
  });

  it('records nothing when scanned outside the scheduled date', async () => {
    mocks.lookup.mockResolvedValue({ data: row({ jadwal_okb_tanggal: '2026-11-08' }), error: null });

    const result = await scanAttendanceAction('OB-2027-001');
    expect(result.outcome).toBe('rejected');
    expect(result.message).toContain('Bukan jadwal OKB hari ini');
    expect(result.message).toContain('8 November 2026, Sesi 1');
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it.each([
    ['Sudah OKB', 'Sudah tercatat hadir OKB.'],
    ['Terverifikasi', 'Belum dijadwalkan OKB. Jadwalkan terlebih dahulu di detail pendaftar.'],
    ['Dibatalkan', 'Status pendaftar: Dibatalkan. Tidak dapat dicatat hadir.'],
  ])('records nothing for an applicant whose status is %s', async (status, message) => {
    mocks.lookup.mockResolvedValue({ data: row({ status }), error: null });

    await expect(scanAttendanceAction('OB-2027-001')).resolves.toMatchObject({ outcome: 'rejected', message });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rejects QR content that is not a registration number without querying', async () => {
    await expect(scanAttendanceAction('https://example.com')).resolves.toMatchObject({ outcome: 'rejected', applicant: null });
    expect(mocks.lookup).not.toHaveBeenCalled();
  });

  it('reports an unknown registration number', async () => {
    mocks.lookup.mockResolvedValue({ data: null, error: null });

    await expect(scanAttendanceAction('OB-2027-999')).resolves.toMatchObject({ outcome: 'rejected', message: 'Nomor OB-2027-999 tidak ditemukan.' });
  });

  it('requires a valid admin session', async () => {
    mocks.session.mockResolvedValue(false);

    await expect(scanAttendanceAction('OB-2027-001')).resolves.toMatchObject({ outcome: 'rejected', message: 'Sesi admin tidak valid. Silakan masuk kembali.' });
    expect(mocks.lookup).not.toHaveBeenCalled();
  });
});
