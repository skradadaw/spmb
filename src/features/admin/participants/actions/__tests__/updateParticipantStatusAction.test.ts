import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  revalidatePath: vi.fn(),
  rpc: vi.fn(),
  update: vi.fn(),
  readMaybeSingle: vi.fn(),
  writeMaybeSingle: vi.fn(),
  filters: [] as Array<[string, unknown]>,
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({
  getSupabaseAdmin: () => ({
    rpc: mocks.rpc,
    from: () => {
      const writeChain = {
        eq: (column: string, value: unknown) => { mocks.filters.push([`eq:${column}`, value]); return writeChain; },
        in: (column: string, value: unknown) => { mocks.filters.push([`in:${column}`, value]); return writeChain; },
        is: (column: string, value: unknown) => { mocks.filters.push([`is:${column}`, value]); return writeChain; },
        select: () => ({ maybeSingle: mocks.writeMaybeSingle }),
      };
      return {
        update: (values: unknown) => { mocks.update(values); return writeChain; },
        select: () => ({ eq: () => ({ maybeSingle: mocks.readMaybeSingle }) }),
      };
    },
  }),
}));

import { updateParticipantStatusAction } from '../updateParticipantStatusAction';

const participantId = '123e4567-e89b-12d3-a456-426614174000';
const idle = { status: 'idle', message: '' } as const;

function form(intent: string, extra: Record<string, string> = {}) {
  const data = new FormData();
  data.set('participantId', participantId);
  data.set('intent', intent);
  for (const [key, value] of Object.entries(extra)) data.set(key, value);
  return data;
}

describe('updateParticipantStatusAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.filters.length = 0;
    mocks.session.mockResolvedValue(true);
    mocks.writeMaybeSingle.mockResolvedValue({ data: { id: participantId }, error: null });
    mocks.readMaybeSingle.mockResolvedValue({ data: { status: 'Terverifikasi', jadwal_okb_tanggal: null, jadwal_okb_gelombang: null, ruang_okb: null }, error: null });
    // 1 Nov 2026 di Jakarta: tanggal jadwal di tes ini tidak di masa lalu.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-01T03:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('schedules OKB for a verified or already scheduled applicant', async () => {
    const result = await updateParticipantStatusAction(idle, form('schedule', { jadwalTanggal: '2026-11-07', jadwalGelombang: '2' }));

    expect(result).toEqual({ status: 'success', message: 'Jadwal OKB berhasil disimpan.' });
    expect(mocks.update).toHaveBeenCalledWith({ status: 'Terjadwal OKB', jadwal_okb_tanggal: '2026-11-07', jadwal_okb_gelombang: 2, ruang_okb_id: null });
    expect(mocks.filters).toContainEqual(['eq:status', 'Terverifikasi']);
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/admin/pendaftar/${participantId}`);
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/okb');
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/okb/name-tag');
  });

  it('clears the Ruang OKB when a rescheduled date or Gelombang differs', async () => {
    mocks.readMaybeSingle.mockResolvedValue({ data: { status: 'Terjadwal OKB', jadwal_okb_tanggal: '2026-11-07', jadwal_okb_gelombang: 1, ruang_okb: 'Ruang A' }, error: null });

    const result = await updateParticipantStatusAction(idle, form('schedule', { jadwalTanggal: '2026-11-07', jadwalGelombang: '2' }));

    expect(result).toEqual({ status: 'success', message: 'Jadwal OKB berhasil disimpan. Ruang OKB dikosongkan, pilih ruangan lagi.' });
    expect(mocks.update).toHaveBeenCalledWith({ status: 'Terjadwal OKB', jadwal_okb_tanggal: '2026-11-07', jadwal_okb_gelombang: 2, ruang_okb_id: null });
    expect(mocks.filters).toContainEqual(['eq:status', 'Terjadwal OKB']);
  });

  it('keeps the Ruang OKB when the schedule is saved unchanged', async () => {
    mocks.readMaybeSingle.mockResolvedValue({ data: { status: 'Terjadwal OKB', jadwal_okb_tanggal: '2026-11-07', jadwal_okb_gelombang: 2, ruang_okb: 'Ruang A' }, error: null });

    const result = await updateParticipantStatusAction(idle, form('schedule', { jadwalTanggal: '2026-11-07', jadwalGelombang: '2' }));

    expect(result).toEqual({ status: 'success', message: 'Jadwal OKB berhasil disimpan.' });
    expect(mocks.update).toHaveBeenCalledWith({ status: 'Terjadwal OKB', jadwal_okb_tanggal: '2026-11-07', jadwal_okb_gelombang: 2 });
  });

  it('rejects an OKB date before today in Jakarta', async () => {
    const result = await updateParticipantStatusAction(idle, form('schedule', { jadwalTanggal: '2026-10-31', jadwalGelombang: '2' }));

    expect(result).toEqual({ status: 'error', message: 'Tanggal OKB tidak boleh sebelum hari ini.' });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('does not schedule an applicant outside Terverifikasi or Terjadwal OKB', async () => {
    mocks.readMaybeSingle.mockResolvedValue({ data: { status: 'Sudah OKB', jadwal_okb_tanggal: '2026-11-07', jadwal_okb_gelombang: 2, ruang_okb: 'Ruang A' }, error: null });

    const result = await updateParticipantStatusAction(idle, form('schedule', { jadwalTanggal: '2026-11-08', jadwalGelombang: '2' }));

    expect(result.status).toBe('error');
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rejects an impossible OKB date', async () => {
    const result = await updateParticipantStatusAction(idle, form('schedule', { jadwalTanggal: '2026-02-30', jadwalGelombang: '2' }));

    expect(result).toEqual({ status: 'error', message: 'Tanggal OKB tidak valid.' });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('requires one of the three Gelombang OKB', async () => {
    for (const jadwalGelombang of ['', '0', '4', 'Sesi 1']) {
      const result = await updateParticipantStatusAction(idle, form('schedule', { jadwalTanggal: '2026-11-07', jadwalGelombang }));
      expect(result).toEqual({ status: 'error', message: 'Pilih Gelombang OKB.' });
    }
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('reports a stale page when the applicant is no longer in a schedulable status', async () => {
    mocks.writeMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await updateParticipantStatusAction(idle, form('schedule', { jadwalTanggal: '2026-11-07', jadwalGelombang: '2' }));
    expect(result.status).toBe('error');
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('removes the Jadwal OKB of a scheduled applicant, returning them to Terverifikasi', async () => {
    const result = await updateParticipantStatusAction(idle, form('unschedule'));

    expect(result).toEqual({ status: 'success', message: 'Jadwal OKB dihapus. Pendaftar kembali Terverifikasi.' });
    expect(mocks.update).toHaveBeenCalledWith({ status: 'Terverifikasi', jadwal_okb_tanggal: null, jadwal_okb_gelombang: null, ruang_okb_id: null });
    expect(mocks.filters).toContainEqual(['eq:status', 'Terjadwal OKB']);
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pendaftar');
  });

  it('reports a stale page when removing the Jadwal OKB of an applicant no longer scheduled', async () => {
    mocks.writeMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await updateParticipantStatusAction(idle, form('unschedule'));
    expect(result).toEqual({ status: 'error', message: 'Status pendaftar sudah berubah. Muat ulang halaman lalu coba lagi.' });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('marks attendance only from Terjadwal OKB', async () => {
    await updateParticipantStatusAction(idle, form('attend'));

    expect(mocks.update).toHaveBeenCalledWith({ status: 'Sudah OKB' });
    expect(mocks.filters).toContainEqual(['eq:status', 'Terjadwal OKB']);
  });

  it('undoes attendance, returning an applicant to Terjadwal OKB with the same schedule', async () => {
    const result = await updateParticipantStatusAction(idle, form('unattend'));

    expect(result).toEqual({ status: 'success', message: 'Kehadiran dibatalkan. Pendaftar kembali Terjadwal OKB.' });
    expect(mocks.update).toHaveBeenCalledWith({ status: 'Terjadwal OKB' });
    expect(mocks.filters).toContainEqual(['eq:status', 'Sudah OKB']);
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/admin/pendaftar/${participantId}`);
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/okb');
  });

  it('does not undo attendance once the applicant is no longer Sudah OKB', async () => {
    mocks.writeMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await updateParticipantStatusAction(idle, form('unattend'));
    expect(result).toEqual({ status: 'error', message: 'Status pendaftar sudah berubah. Muat ulang halaman lalu coba lagi.' });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('returns an unannounced acceptance to Sudah OKB, clearing the placement and Nomor VA', async () => {
    const result = await updateParticipantStatusAction(idle, form('undecide'));

    expect(result).toEqual({ status: 'success', message: 'Keputusan dibatalkan. Pendaftar kembali Sudah OKB.' });
    expect(mocks.update).toHaveBeenCalledWith({ status: 'Sudah OKB', kelas_penempatan: null, nomor_va: null });
    expect(mocks.filters).toContainEqual(['eq:status', 'Diterima']);
    expect(mocks.filters).toContainEqual(['is:diumumkan_pada', null]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/pendaftaran');
  });

  it('asks to withdraw the announcement before returning an announced acceptance to Sudah OKB', async () => {
    mocks.writeMaybeSingle.mockResolvedValue({ data: null, error: null });
    mocks.readMaybeSingle.mockResolvedValue({ data: { status: 'Diterima', diumumkan_pada: '2027-02-09T01:00:00Z' }, error: null });

    const result = await updateParticipantStatusAction(idle, form('undecide'));
    expect(result).toEqual({ status: 'error', message: 'Hasil sudah diumumkan. Tarik pengumuman terlebih dahulu, lalu kembalikan ke Sudah OKB.' });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('does not return an applicant to Sudah OKB once no longer Diterima', async () => {
    mocks.writeMaybeSingle.mockResolvedValue({ data: null, error: null });
    mocks.readMaybeSingle.mockResolvedValue({ data: { status: 'Ditolak', diumumkan_pada: null }, error: null });

    const result = await updateParticipantStatusAction(idle, form('undecide'));
    expect(result).toEqual({ status: 'error', message: 'Status pendaftar sudah berubah. Muat ulang halaman lalu coba lagi.' });
  });

  it('cancels an accepted applicant and remembers the previous status', async () => {
    mocks.readMaybeSingle.mockResolvedValue({ data: { status: 'Diterima' }, error: null });

    const result = await updateParticipantStatusAction(idle, form('cancel'));
    expect(result.status).toBe('success');
    expect(mocks.update).toHaveBeenCalledWith({ status: 'Dibatalkan', status_sebelum_dibatalkan: 'Diterima' });
    expect(mocks.filters).toContainEqual(['eq:status', 'Diterima']);
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/pendaftaran');
  });

  it('does not cancel a rejected applicant', async () => {
    mocks.readMaybeSingle.mockResolvedValue({ data: { status: 'Ditolak' }, error: null });

    const result = await updateParticipantStatusAction(idle, form('cancel'));
    expect(result.status).toBe('error');
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('restores through the capacity-checked RPC', async () => {
    mocks.rpc.mockResolvedValue({ data: 'ok', error: null });

    await expect(updateParticipantStatusAction(idle, form('restore'))).resolves.toEqual({ status: 'success', message: 'Pendaftar berhasil dipulihkan.' });
    expect(mocks.rpc).toHaveBeenCalledWith('restore_cancelled_applicant', { p_pendaftar_id: participantId });
  });

  it('explains when restoring is blocked by a full class', async () => {
    mocks.rpc.mockResolvedValue({ data: 'full', error: null });

    await expect(updateParticipantStatusAction(idle, form('restore'))).resolves.toEqual({
      status: 'error',
      message: 'Kuota Pilihan Kelas pendaftar ini sudah penuh. Geser kuota di menu Pengaturan terlebih dahulu.',
    });
  });

  it('requires a valid admin session', async () => {
    mocks.session.mockResolvedValue(false);

    const result = await updateParticipantStatusAction(idle, form('attend'));
    expect(result).toEqual({ status: 'error', message: 'Sesi admin tidak valid. Silakan masuk kembali.' });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('records an acceptance with its class placement through the decision RPC', async () => {
    mocks.rpc.mockResolvedValue({ data: 'ok', error: null });

    const result = await updateParticipantStatusAction(idle, form('decide', { keputusan: 'Diterima', kelasPenempatan: 'Reguler' }));
    expect(result).toEqual({ status: 'success', message: 'Keputusan Penerimaan disimpan: Diterima.' });
    expect(mocks.rpc).toHaveBeenCalledWith('decide_admission', {
      p_pendaftar_id: participantId,
      p_keputusan: 'Diterima',
      p_kelas_penempatan: 'Reguler',
    });
  });

  it('records a rejection without a class placement', async () => {
    mocks.rpc.mockResolvedValue({ data: 'ok', error: null });

    await updateParticipantStatusAction(idle, form('decide', { keputusan: 'Ditolak', kelasPenempatan: 'Reguler' }));
    expect(mocks.rpc).toHaveBeenCalledWith('decide_admission', expect.objectContaining({ p_keputusan: 'Ditolak', p_kelas_penempatan: null }));
  });

  it('requires a class placement for an acceptance', async () => {
    const result = await updateParticipantStatusAction(idle, form('decide', { keputusan: 'Diterima', kelasPenempatan: '' }));
    expect(result).toEqual({ status: 'error', message: 'Kelas Penempatan wajib dipilih untuk pendaftar yang Diterima.' });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
