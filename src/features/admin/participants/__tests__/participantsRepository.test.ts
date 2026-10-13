import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { createParticipantsRepository } from '../server/participantsRepository';
import { PARTICIPANT_DETAIL_COLUMNS, PARTICIPANT_LIST_COLUMNS } from '../contracts';
import { parseParticipantListQuery } from '../query';

function fixture() {
  const q = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), ilike: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), range: vi.fn().mockResolvedValue({ data: [], count: 0, error: null }), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) };
  return { q, repo: createParticipantsRepository({ from: vi.fn(() => q) } as unknown as SupabaseClient) };
}
describe('participants repository', () => {
  it('exports complete student fields using active filters and excludes document storage paths', async () => {
    const { q, repo } = fixture();
    q.range.mockResolvedValueOnce({ data: [{ id: 'a', created_at: '2026-10-11T00:00:00Z', nama_lengkap: 'Ani', nama_ayah: 'Budi', alamat_rumah: 'Jalan Melati', catatan_admin: 'Catatan', dokumen_pas_foto: 'secret/path' }], error: null });
    const result = await repo.exportDetails(parseParticipantListQuery(new URLSearchParams('q=Ani&kelas=Reguler')));
    expect(q.select).toHaveBeenCalledWith(expect.stringContaining('nama_ayah'));
    expect(q.select).toHaveBeenCalledWith(expect.not.stringContaining('dokumen_pas_foto'));
    expect(q.ilike).toHaveBeenCalledWith('nama_lengkap', '%Ani%');
    expect(q.eq).toHaveBeenCalledWith('pilihan_kelas', 'Reguler');
    expect(result[0]).toMatchObject({ fields: { namaLengkap: 'Ani', fatherNama: 'Budi' }, adminNote: 'Catatan' });
  });

  it('escapes literal wildcards, filters, paginates and orders with minimal columns', async () => {
    const { q, repo } = fixture();
    q.range.mockResolvedValueOnce({ data: [], count: 41, error: null }).mockResolvedValueOnce({ data: [{ id: 'a', nama_lengkap: null, asal_sekolah: 'TK Melati' }], count: 41, error: null });
    const result = await repo.list(parseParticipantListQuery(new URLSearchParams('q=100%25_&kelas=Reguler&jenis=Pindahan&status=Menunggu+Unggahan&page=99')));
    expect(q.ilike).toHaveBeenCalledWith('nama_lengkap', '%100\\%\\_%');
    expect(q.eq).toHaveBeenCalledWith('pilihan_kelas', 'Reguler');
    expect(q.eq).toHaveBeenCalledWith('jenis_pendaftaran', 'Pindahan');
    expect(q.eq).toHaveBeenCalledWith('status', 'Menunggu Unggahan');
    expect(q.select).toHaveBeenCalledWith(PARTICIPANT_LIST_COLUMNS, { count: 'exact' });
    expect(q.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(q.order).toHaveBeenCalledWith('id', { ascending: false });
    expect(q.range).toHaveBeenLastCalledWith(40, 59);
    expect(result).toMatchObject({ page: 3, pageSize: 20, total: 41, totalPages: 3 });
    expect(result.items[0].namaLengkap).toBe('Nama belum diisi');
    expect(result.items[0].asalSekolah).toBe('TK Melati');
    expect(PARTICIPANT_LIST_COLUMNS).toContain('asal_sekolah');
    expect(PARTICIPANT_LIST_COLUMNS).not.toContain('nik');
  });
  it('loads a normal page with its count in a single round trip', async () => {
    const { q, repo } = fixture();
    q.range.mockResolvedValueOnce({ data: [{ id: 'a', nama_lengkap: 'Ani' }], count: 25, error: null });
    const result = await repo.list(parseParticipantListQuery(new URLSearchParams('page=2')));
    expect(q.range).toHaveBeenCalledTimes(1);
    expect(q.range).toHaveBeenCalledWith(20, 39);
    expect(result).toMatchObject({ page: 2, total: 25, totalPages: 2 });
  });
  it('recovers when PostgREST rejects an offset past the end', async () => {
    const { q, repo } = fixture();
    q.range
      .mockResolvedValueOnce({ data: null, count: null, error: { code: 'PGRST103' } })
      .mockResolvedValueOnce({ data: [], count: 41, error: null })
      .mockResolvedValueOnce({ data: [{ id: 'z' }], count: 41, error: null });
    const result = await repo.list(parseParticipantListQuery(new URLSearchParams('page=99')));
    expect(q.range).toHaveBeenLastCalledWith(40, 59);
    expect(result).toMatchObject({ page: 3, total: 41, totalPages: 3 });
    expect(result.items).toHaveLength(1);
  });
  it('does not disguise count or data failures as an empty list', async () => {
    const { q, repo } = fixture();
    q.range.mockResolvedValueOnce({ data: null, count: null, error: new Error('secret') });
    await expect(repo.list(parseParticipantListQuery(new URLSearchParams()))).rejects.toThrow('Data peserta tidak dapat dimuat.');
    q.range.mockResolvedValueOnce({ data: null, count: 1, error: null });
    await expect(repo.list(parseParticipantListQuery(new URLSearchParams()))).rejects.toThrow('Data peserta tidak dapat dimuat.');
  });
  it('returns safe mapped detail and never selects submission secrets', async () => {
    const { q, repo } = fixture();
    q.maybeSingle.mockResolvedValue({ data: { id: 'a', nama_lengkap: 'Ani', nama_ayah: 'Budi', submission_secret_hash: 'secret', dokumen_akta_kelahiran: 'registrations/a/aktaKelahiran.pdf', dokumen_kartu_keluarga: 'registrations/a/kartuKeluarga.jpg', dokumen_pas_foto: 'registrations/a/pasFoto.png', dokumen_bukti_pembayaran: 'registrations/a/buktiPembayaran.webp' }, error: null });
    const result = await repo.getById('a');
    expect(q.select).toHaveBeenCalledWith(PARTICIPANT_DETAIL_COLUMNS);
    expect(PARTICIPANT_DETAIL_COLUMNS).not.toContain('submission');
    expect(result?.identity.namaLengkap).toBe('Ani');
    expect(result?.father.nama).toBe('Budi');
    expect(result?.documents).toEqual([
      { id: 'aktaKelahiran', title: 'Akta Kelahiran', path: 'registrations/a/aktaKelahiran.pdf' },
      { id: 'kartuKeluarga', title: 'Kartu Keluarga', path: 'registrations/a/kartuKeluarga.jpg' },
      { id: 'pasFoto', title: 'Pas Foto Anak', path: 'registrations/a/pasFoto.png' },
      { id: 'buktiPembayaran', title: 'Bukti Pembayaran OKB', path: 'registrations/a/buktiPembayaran.webp' },
    ]);
    expect(JSON.stringify(result)).not.toContain('secret');
    expect(result?.identity.nik).toBeNull();
  });
  it('loads submission_id with document paths to validate storage ownership', async () => {
    const { q, repo } = fixture();
    q.maybeSingle.mockResolvedValue({ data: { id: 'participant-id', submission_id: 'submission-id' }, error: null });
    await repo.getDocumentRow('participant-id');
    expect(q.select).toHaveBeenCalledWith('id,submission_id,dokumen_akta_kelahiran,dokumen_kartu_keluarga,dokumen_pas_foto,dokumen_bukti_pembayaran');
  });
  it('distinguishes missing details from database failure', async () => {
    const { q, repo } = fixture();
    expect(await repo.getById('missing')).toBeNull();
    q.maybeSingle.mockResolvedValue({ data: null, error: 'secret' });
    await expect(repo.getById('missing')).rejects.toThrow('Data peserta tidak dapat dimuat.');
  });
  it('maps internal document review metadata without mixing it into participant status', async () => {
    const { q, repo } = fixture();
    q.maybeSingle.mockResolvedValue({ data: { id: 'a', status: 'Menunggu Verifikasi', catatan_admin: 'Hubungi orang tua' }, error: null });
    q.range.mockResolvedValue({ data: [{ dokumen_id: 'aktaKelahiran', status: 'follow_up', diperiksa_pada: '2026-10-11T00:00:00Z', diperiksa_oleh: 'Admin' }], error: null });
    const result = await repo.getById('a');
    expect(result?.status).toBe('Menunggu Verifikasi');
    expect(result?.adminNote).toBe('Hubungi orang tua');
    expect(result?.documentReviews.aktaKelahiran).toEqual({ status: 'follow_up', reviewedAt: '2026-10-11T00:00:00Z', reviewedBy: 'Admin' });
  });
  it('reads the applicant and their document reviews in parallel', async () => {
    let resolveRow: (value: unknown) => void = () => {};
    const { q, repo } = fixture();
    q.maybeSingle.mockReturnValue(new Promise((resolve) => { resolveRow = resolve; }));
    q.range.mockResolvedValue({ data: [], error: null });
    const pending = repo.getById('a');
    await Promise.resolve();
    expect(q.range).toHaveBeenCalledWith(0, 99);
    resolveRow({ data: { id: 'a' }, error: null });
    await expect(pending).resolves.toMatchObject({ id: 'a' });
  });
});
