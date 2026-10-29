import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { createParticipantsRepository } from '../server/participantsRepository';
import { PARTICIPANT_DETAIL_COLUMNS, PARTICIPANT_LIST_COLUMNS } from '../contracts';
import { parseParticipantListQuery } from '../query';

function fixture() {
  const q = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(), gt: vi.fn().mockReturnThis(), not: vi.fn().mockReturnThis(), lt: vi.fn().mockReturnThis(), is: vi.fn().mockReturnThis(), or: vi.fn().mockReturnThis(), ilike: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), range: vi.fn().mockResolvedValue({ data: [], count: 0, error: null }), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) };
  return { q, repo: createParticipantsRepository({ from: vi.fn(() => q) } as unknown as SupabaseClient) };
}
describe('participants repository', () => {
  it('exports complete student fields for the chosen statuses only and excludes document storage paths', async () => {
    const { q, repo } = fixture();
    q.range.mockResolvedValueOnce({ data: [{ id: 'a', created_at: '2026-10-11T00:00:00Z', nama_lengkap: 'Ani', nama_ayah: 'Budi', alamat_rumah: 'Jalan Melati', catatan_admin: 'Catatan', dokumen_pas_foto: 'secret/path' }], error: null });
    const result = await repo.exportDetails(['Diterima', 'Sudah OKB']);
    expect(q.select).toHaveBeenCalledWith(expect.stringContaining('nama_ayah'));
    expect(q.select).toHaveBeenCalledWith(expect.not.stringContaining('dokumen_pas_foto'));
    expect(q.in).toHaveBeenCalledWith('status', ['Diterima', 'Sudah OKB']);
    // Filter daftar tidak ikut ke ekspor.
    expect(q.ilike).not.toHaveBeenCalled();
    expect(q.eq).not.toHaveBeenCalled();
    expect(result[0]).toMatchObject({ fields: { namaLengkap: 'Ani', fatherNama: 'Budi' }, adminNote: 'Catatan' });
  });

  it('escapes literal wildcards, filters, paginates and orders with minimal columns', async () => {
    const { q, repo } = fixture();
    q.range.mockResolvedValueOnce({ data: [], count: 41, error: null }).mockResolvedValueOnce({ data: [{ id: 'a', nama_lengkap: null, asal_sekolah: 'TK Melati' }], count: 41, error: null });
    const result = await repo.list(parseParticipantListQuery(new URLSearchParams('q=100%25_&kelas=Reguler&status=Menunggu+Unggahan&page=99')));
    expect(q.ilike).toHaveBeenCalledWith('nama_lengkap', '%100\\%\\_%');
    expect(q.eq).toHaveBeenCalledWith('jenis_pendaftaran', 'Siswa Baru');
    expect(q.or).toHaveBeenCalledWith('kelas_penempatan.eq.Reguler,and(kelas_penempatan.is.null,pilihan_kelas.eq.Reguler)');
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
  it('filters Perlu Perhatian and never includes withdrawn or rejected applicants', async () => {
    for (const [value, check] of [
      ['nisn', (q: ReturnType<typeof fixture>['q']) => expect(q.eq).toHaveBeenCalledWith('nisn_tidak_sesuai', true)],
      ['semua', (q: ReturnType<typeof fixture>['q']) => expect(q.or).toHaveBeenCalledWith('nisn_tidak_sesuai.is.true,berkas_belum_tersedia.gt.0')],
    ] as const) {
      const { q, repo } = fixture();
      q.range.mockResolvedValueOnce({ data: [], count: 0, error: null });
      await repo.list(parseParticipantListQuery(new URLSearchParams(`perhatian=${value}`)));
      expect(q.not).toHaveBeenCalledWith('status', 'in', '("Dibatalkan","Ditolak")');
      check(q);
    }
    const { q, repo } = fixture();
    q.range.mockResolvedValueOnce({ data: [], count: 0, error: null });
    await repo.list(parseParticipantListQuery(new URLSearchParams('perhatian=tindak-lanjut')));
    expect(q.not).not.toHaveBeenCalled();
  });

  it('maps Perlu Perhatian per row and hides it for withdrawn or rejected applicants', async () => {
    const { q, repo } = fixture();
    const flagged = { nisn_tidak_sesuai: true, berkas_belum_tersedia: 2 };
    q.range.mockResolvedValueOnce({ data: [{ id: 'a', status: 'Terjadwal OKB', ...flagged }, { id: 'b', status: 'Dibatalkan', ...flagged }], count: 2, error: null });
    const result = await repo.list(parseParticipantListQuery(new URLSearchParams()));
    expect(result.items[0].attention).toEqual({ nisnMismatch: true, missingDocuments: 2 });
    expect(result.items[1].attention).toEqual({ nisnMismatch: false, missingDocuments: 0 });
    expect(PARTICIPANT_LIST_COLUMNS).toContain('nisn_tidak_sesuai');
    expect(PARTICIPANT_DETAIL_COLUMNS).toContain('nisn_tidak_sesuai');
  });

  it('filters Pindahan by registration type regardless of class', async () => {
    const { q, repo } = fixture();
    await repo.list(parseParticipantListQuery(new URLSearchParams('kelas=Pindahan')));
    expect(q.eq).toHaveBeenCalledWith('jenis_pendaftaran', 'Pindahan');
    expect(q.or).not.toHaveBeenCalled();
  });

  it('finds Tidak Hadir OKB: still scheduled with a date before today in Jakarta', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-10-17T18:30:00Z')); // already 18 Oct in Jakarta
      const { q, repo } = fixture();
      await repo.list(parseParticipantListQuery(new URLSearchParams('okb=terlewat')));
      expect(q.eq).toHaveBeenCalledWith('status', 'Terjadwal OKB');
      expect(q.lt).toHaveBeenCalledWith('jadwal_okb_tanggal', '2026-10-18');
    } finally {
      vi.useRealTimers();
    }
  });

  it('filters one Gelombang OKB among scheduled applicants and maps it per row', async () => {
    const { q, repo } = fixture();
    q.range.mockResolvedValueOnce({ data: [{ id: 'a', status: 'Terjadwal OKB', jadwal_okb_gelombang: 2 }, { id: 'b', status: 'Sudah OKB', jadwal_okb_gelombang: 1 }], count: 2, error: null });
    const result = await repo.list(parseParticipantListQuery(new URLSearchParams('gelombang=2')));
    expect(q.eq).toHaveBeenCalledWith('status', 'Terjadwal OKB');
    expect(q.eq).toHaveBeenCalledWith('jadwal_okb_gelombang', '2');
    expect(PARTICIPANT_LIST_COLUMNS).toContain('jadwal_okb_gelombang');
    // Only scheduled applicants show their Gelombang in the list.
    expect(result.items.map(item => item.jadwalGelombang)).toEqual(['Gelombang 2', null]);
  });

  it('uses the chosen page size for the range and page count', async () => {
    const { q, repo } = fixture();
    q.range.mockResolvedValueOnce({ data: [{ id: 'a' }], count: 120, error: null });
    const result = await repo.list(parseParticipantListQuery(new URLSearchParams('per=50&page=2')));
    expect(q.range).toHaveBeenCalledWith(50, 99);
    expect(result).toMatchObject({ page: 2, pageSize: 50, totalPages: 3 });
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
    await expect(repo.list(parseParticipantListQuery(new URLSearchParams()))).rejects.toThrow('Data pendaftar tidak dapat dimuat.');
    q.range.mockResolvedValueOnce({ data: null, count: 1, error: null });
    await expect(repo.list(parseParticipantListQuery(new URLSearchParams()))).rejects.toThrow('Data pendaftar tidak dapat dimuat.');
  });
  it('filters decided results by whether they are announced', async () => {
    const pending = fixture();
    pending.q.range.mockResolvedValueOnce({ data: [], count: 0, error: null });
    await pending.repo.list(parseParticipantListQuery(new URLSearchParams('pengumuman=belum')));
    expect(pending.q.in).toHaveBeenCalledWith('status', ['Diterima', 'Ditolak']);
    expect(pending.q.is).toHaveBeenCalledWith('diumumkan_pada', null);

    const announced = fixture();
    announced.q.range.mockResolvedValueOnce({ data: [], count: 0, error: null });
    await announced.repo.list(parseParticipantListQuery(new URLSearchParams('pengumuman=sudah')));
    expect(announced.q.not).toHaveBeenCalledWith('diumumkan_pada', 'is', 'null');
  });

  it('marks a Pendaftar Diterima without Nomor VA in the list and reads the Nomor VA on the detail', async () => {
    const { q, repo } = fixture();
    q.range.mockResolvedValueOnce({ data: [
      { id: 'a', status: 'Diterima', nomor_va: null },
      { id: 'b', status: 'Diterima', nomor_va: '7456012627300120' },
      { id: 'c', status: 'Ditolak', nomor_va: null },
    ], count: 3, error: null });
    const result = await repo.list(parseParticipantListQuery(new URLSearchParams()));
    expect(result.items.map(item => item.vaMissing)).toEqual([true, false, false]);
    expect(PARTICIPANT_LIST_COLUMNS).toContain('nomor_va');

    q.maybeSingle.mockResolvedValue({ data: { id: 'b', status: 'Diterima', nomor_va: '7456012627300120' }, error: null });
    expect((await repo.getById('b'))?.nomorVa).toBe('7456012627300120');
    expect(PARTICIPANT_DETAIL_COLUMNS).toContain('nomor_va');
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
  it('names the Gelombang OKB in the detail and the export', async () => {
    const { q, repo } = fixture();
    q.maybeSingle.mockResolvedValue({ data: { id: 'a', status: 'Terjadwal OKB', jadwal_okb_tanggal: '2026-11-07', jadwal_okb_gelombang: 2 }, error: null });
    q.range.mockResolvedValueOnce({ data: [], error: null });
    const detail = await repo.getById('a');
    expect(detail?.okb).toEqual({ jadwalTanggal: '2026-11-07', jadwalGelombang: 'Gelombang 2' });

    q.range.mockResolvedValueOnce({ data: [{ id: 'a', jadwal_okb_gelombang: 3 }], error: null });
    const [record] = await repo.exportDetails(['Terjadwal OKB']);
    expect(record.fields.jadwalGelombang).toBe('Gelombang 3');
  });
  it('counts applicants per status across batches, starting every status at zero', async () => {
    const { q, repo } = fixture();
    q.range.mockResolvedValueOnce({ data: Array.from({ length: 1000 }, () => ({ status: 'Diterima' })), error: null }).mockResolvedValueOnce({ data: [{ status: 'Ditolak' }], error: null });
    expect(await repo.countByStatus(['Diterima', 'Ditolak', 'Dibatalkan'])).toEqual({ Diterima: 1000, Ditolak: 1, Dibatalkan: 0 });
    expect(q.in).toHaveBeenCalledWith('status', ['Diterima', 'Ditolak', 'Dibatalkan']);
    expect(q.range).toHaveBeenNthCalledWith(2, 1000, 1999);
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
    await expect(repo.getById('missing')).rejects.toThrow('Data pendaftar tidak dapat dimuat.');
  });
  it('maps internal document review metadata without mixing it into participant status', async () => {
    const { q, repo } = fixture();
    q.maybeSingle.mockResolvedValue({ data: { id: 'a', status: 'Menunggu Verifikasi', catatan_admin: 'Hubungi orang tua' }, error: null });
    q.range.mockResolvedValue({ data: [{ dokumen_id: 'aktaKelahiran', status: 'verified', diperiksa_pada: '2026-10-11T00:00:00Z', diperiksa_oleh: 'Admin' }], error: null });
    const result = await repo.getById('a');
    expect(result?.status).toBe('Menunggu Verifikasi');
    expect(result?.adminNote).toBe('Hubungi orang tua');
    expect(result?.documentReviews.aktaKelahiran).toEqual({ status: 'verified', reviewedAt: '2026-10-11T00:00:00Z', reviewedBy: 'Admin' });
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
