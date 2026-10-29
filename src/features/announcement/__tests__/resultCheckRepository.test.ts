import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { createResultCheckRepository, RESULT_CHECK_COLUMNS } from '../server/resultCheckRepository';
import { RESULT_CHECK_LIMIT, RESULT_CHECK_WINDOW_SECONDS } from '../resultCheck';

function fixture() {
  const q = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) };
  const rpc = vi.fn().mockResolvedValue({ data: false, error: null });
  return { q, rpc, repository: createResultCheckRepository({ from: vi.fn(() => q), rpc } as unknown as SupabaseClient) };
}

describe('result check repository', () => {
  it('reads only the columns shown to parents, by Nomor Pendaftaran', async () => {
    const { q, repository } = fixture();
    q.maybeSingle.mockResolvedValue({ data: { nomor_pendaftaran: 'OB-2027-001', nama_lengkap: 'SITI', tanggal_lahir: '2020-03-12', status: 'Terjadwal OKB', jadwal_okb_tanggal: '2027-01-12', jadwal_okb_gelombang: 2, diumumkan_pada: '2027-02-09T01:00:00Z', kelas_penempatan: 'Reguler', jenis_pendaftaran: 'Pindahan', kelas_tujuan: '3', nomor_va: '7456012627300120' }, error: null });
    expect(await repository.findByNomorPendaftaran('OB-2027-001')).toEqual({
      nomorPendaftaran: 'OB-2027-001', namaLengkap: 'SITI', tempatLahir: null, tanggalLahir: '2020-03-12', status: 'Terjadwal OKB', jadwalTanggal: '2027-01-12', jadwalGelombang: 2,
      diumumkanPada: '2027-02-09T01:00:00Z', kelasPenempatan: 'Reguler', jenisPendaftaran: 'Pindahan', kelasTujuan: '3', nomorVa: '7456012627300120',
    });
    expect(q.select).toHaveBeenCalledWith(RESULT_CHECK_COLUMNS);
    expect(q.eq).toHaveBeenCalledWith('nomor_pendaftaran', 'OB-2027-001');
    for (const secret of ['nik', 'alamat', 'ayah', 'ibu', 'telepon', 'dokumen', 'catatan']) expect(RESULT_CHECK_COLUMNS).not.toContain(secret);
  });

  it('counts failures and checks the lock in the database with the configured limits', async () => {
    const { rpc, repository } = fixture();
    rpc.mockResolvedValueOnce({ data: true, error: null });
    expect(await repository.isLocked('hash')).toBe(true);
    expect(rpc).toHaveBeenCalledWith('is_result_check_locked', { p_identifier_hash: 'hash', p_limit: RESULT_CHECK_LIMIT, p_window_seconds: RESULT_CHECK_WINDOW_SECONDS });
    await repository.recordFailure('hash');
    expect(rpc).toHaveBeenCalledWith('record_result_check_failure', { p_identifier_hash: 'hash', p_window_seconds: RESULT_CHECK_WINDOW_SECONDS });
  });

  it('does not hide database failures', async () => {
    const { q, rpc, repository } = fixture();
    q.maybeSingle.mockResolvedValue({ data: null, error: { message: 'x' } });
    await expect(repository.findByNomorPendaftaran('OB-2027-001')).rejects.toThrow();
    rpc.mockResolvedValue({ data: null, error: { message: 'x' } });
    await expect(repository.isLocked('hash')).rejects.toThrow();
    await expect(repository.recordFailure('hash')).rejects.toThrow();
  });
});
