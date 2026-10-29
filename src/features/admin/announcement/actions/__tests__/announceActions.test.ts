import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ session: vi.fn(), rpc: vi.fn(), revalidatePath: vi.fn() }));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({ getSupabaseAdmin: () => ({ rpc: mocks.rpc }) }));

import { announceParticipantAction, announceWaveAction } from '../announceActions';

const participantId = '123e4567-e89b-12d3-a456-426614174000';
const idle = { status: 'idle' as const, message: '' };

function form(intent: string, id = participantId) {
  const data = new FormData();
  data.set('participantId', id);
  data.set('intent', intent);
  return data;
}

describe('announceParticipantAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue(true);
    mocks.rpc.mockResolvedValue({ data: { status: 'ok', diterima: 1, ditolak: 0, dilewati: 0 }, error: null });
  });

  it('announces one Pendaftar through the database and refreshes every view of it', async () => {
    const result = await announceParticipantAction(idle, form('announce'));
    expect(result).toEqual({ status: 'success', message: 'Hasil OKB diumumkan. Orang tua sudah dapat melihatnya di halaman Cek Hasil OKB.' });
    expect(mocks.rpc).toHaveBeenCalledWith('announce_results', { p_pendaftar_id: participantId, p_gelombang: null, p_umumkan: true });
    for (const path of [`/admin/pendaftar/${participantId}`, '/admin/pendaftar', '/admin/pengumuman', '/admin']) {
      expect(mocks.revalidatePath).toHaveBeenCalledWith(path);
    }
  });

  it('withdraws the announcement', async () => {
    mocks.rpc.mockResolvedValue({ data: { status: 'ok', ditarik: 1 }, error: null });
    const result = await announceParticipantAction(idle, form('withdraw'));
    expect(result.status).toBe('success');
    expect(result.message).toContain('Pengumuman ditarik');
    expect(mocks.rpc).toHaveBeenCalledWith('announce_results', { p_pendaftar_id: participantId, p_gelombang: null, p_umumkan: false });
  });

  it('refuses while no Surat Penerimaan template is active', async () => {
    mocks.rpc.mockResolvedValue({ data: { status: 'no-template' }, error: null });
    const result = await announceParticipantAction(idle, form('announce'));
    expect(result).toEqual({ status: 'error', message: 'Belum ada template Surat Penerimaan yang aktif. Unggah template di menu Pengumuman terlebih dahulu.' });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('refuses a Pendaftar Diterima without Nomor VA and names them', async () => {
    mocks.rpc.mockResolvedValue({ data: { status: 'missing-va', pendaftar: [{ nama: 'SITI AMINAH', nomor: 'OB-2027-001' }] }, error: null });
    const result = await announceParticipantAction(idle, form('announce'));
    expect(result).toEqual({ status: 'error', message: 'Isi Nomor VA Pendaftar Diterima berikut terlebih dahulu:', missingVa: ['Siti Aminah (OB-2027-001)'] });
  });

  it('reports a stale page when the Pendaftar is not Diterima/Ditolak or nothing changed', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: { status: 'invalid' }, error: null });
    expect((await announceParticipantAction(idle, form('announce'))).message).toContain('Muat ulang halaman');
    mocks.rpc.mockResolvedValueOnce({ data: { status: 'ok', ditarik: 0 }, error: null });
    expect((await announceParticipantAction(idle, form('withdraw'))).message).toContain('Muat ulang halaman');
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('rejects missing sessions, invalid participants and unknown intents', async () => {
    mocks.session.mockResolvedValueOnce(false);
    expect((await announceParticipantAction(idle, form('announce'))).message).toContain('Sesi admin tidak valid');
    expect((await announceParticipantAction(idle, form('announce', 'bukan-uuid'))).message).toBe('Data pendaftar tidak valid.');
    expect((await announceParticipantAction(idle, form('hapus'))).message).toBe('Aksi tidak dikenal.');
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('reports a database failure', async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: 'x' } });
    expect((await announceParticipantAction(idle, form('announce'))).message).toBe('Pengumuman tidak dapat diproses. Silakan coba lagi.');
  });
});

describe('announceWaveAction', () => {
  function waveForm(intent: string, gelombang = '2') {
    const data = new FormData();
    data.set('gelombang', gelombang);
    data.set('intent', intent);
    return data;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue(true);
  });

  it('announces a whole Gelombang and reports what was announced and skipped', async () => {
    mocks.rpc.mockResolvedValue({ data: { status: 'ok', diterima: 20, ditolak: 3, dilewati: 2 }, error: null });
    const result = await announceWaveAction(idle, waveForm('announce'));
    expect(mocks.rpc).toHaveBeenCalledWith('announce_results', { p_pendaftar_id: null, p_gelombang: 2, p_umumkan: true });
    expect(result).toEqual({ status: 'success', message: 'Gelombang 2 diumumkan: 20 Diterima dan 3 Ditolak. 2 pendaftar belum diputuskan dan dilewati.' });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/pengumuman');
  });

  it('refuses the whole Gelombang and lists every Pendaftar Diterima without Nomor VA', async () => {
    mocks.rpc.mockResolvedValue({ data: { status: 'missing-va', pendaftar: [{ nama: 'ANI PUTRI', nomor: 'OB-2027-002' }, { nama: 'BUDI', nomor: 'OB-2027-009' }] }, error: null });
    const result = await announceWaveAction(idle, waveForm('announce'));
    expect(result.status).toBe('error');
    expect(result.missingVa).toEqual(['Ani Putri (OB-2027-002)', 'Budi (OB-2027-009)']);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('refuses while no template is active', async () => {
    mocks.rpc.mockResolvedValue({ data: { status: 'no-template' }, error: null });
    expect((await announceWaveAction(idle, waveForm('announce'))).message).toContain('Belum ada template Surat Penerimaan');
  });

  it('withdraws a Gelombang', async () => {
    mocks.rpc.mockResolvedValue({ data: { status: 'ok', ditarik: 23 }, error: null });
    expect(await announceWaveAction(idle, waveForm('withdraw', '1'))).toEqual({ status: 'success', message: 'Pengumuman Gelombang 1 ditarik untuk 23 pendaftar.' });
    expect(mocks.rpc).toHaveBeenCalledWith('announce_results', { p_pendaftar_id: null, p_gelombang: 1, p_umumkan: false });
  });

  it('rejects missing sessions, unknown Gelombang and unknown intents', async () => {
    mocks.session.mockResolvedValueOnce(false);
    expect((await announceWaveAction(idle, waveForm('announce'))).message).toContain('Sesi admin tidak valid');
    expect((await announceWaveAction(idle, waveForm('announce', '4'))).message).toBe('Gelombang OKB tidak valid.');
    expect((await announceWaveAction(idle, waveForm('hapus'))).message).toBe('Aksi tidak dikenal.');
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
