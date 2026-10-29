import { describe, expect, it, vi } from 'vitest';
import type { ApplicantResultRecord } from '../contracts';
import { authorizeAcceptanceLetter, checkResult, normalizeNomorPendaftaran, type ResultCheckRepository } from '../resultCheck';

const record: ApplicantResultRecord = {
  nomorPendaftaran: 'OB-2027-001',
  namaLengkap: 'SITI AMINAH',
  tempatLahir: null,
  tanggalLahir: '2020-03-12',
  status: 'Menunggu Verifikasi',
  jadwalTanggal: null,
  jadwalGelombang: null,
  diumumkanPada: null,
  kelasPenempatan: null,
  jenisPendaftaran: 'Siswa Baru',
  kelasTujuan: null,
  nomorVa: null,
};

/** Repository palsu: satu Pendaftar dan penghitung kegagalan di memori. */
function fakeRepository(stored: ApplicantResultRecord | null = record, limit = 3) {
  const failures = new Map<string, number>();
  const repository: ResultCheckRepository = {
    findByNomorPendaftaran: vi.fn(async (nomor: string) => (stored && stored.nomorPendaftaran === nomor ? stored : null)),
    isLocked: vi.fn(async (key: string) => (failures.get(key) ?? 0) >= limit),
    recordFailure: vi.fn(async (key: string) => { failures.set(key, (failures.get(key) ?? 0) + 1); }),
  };
  return repository;
}

const input = { nomorPendaftaran: 'OB-2027-001', tanggalLahir: '2020-03-12' };
const applicant = { namaLengkap: 'SITI AMINAH', nomorPendaftaran: 'OB-2027-001' };

describe('Cek Hasil OKB', () => {
  it.each([
    ['Menunggu Verifikasi', 'Menunggu Verifikasi'],
    ['Terverifikasi', 'Terverifikasi'],
    ['Sudah OKB', 'Menunggu Pengumuman'],
    // Keputusan Penerimaan tetap tersembunyi sampai Pengumuman Hasil OKB.
    ['Diterima', 'Menunggu Pengumuman'],
    ['Ditolak', 'Menunggu Pengumuman'],
  ])('shows %s as the %s stage', async (status, stage) => {
    const view = await checkResult(input, 'client', fakeRepository({ ...record, status }));
    expect(view).toEqual({ kind: 'stage', applicant, stage, jadwal: null });
  });

  it('reveals Diterima with the Kelas Penempatan and Nomor VA only once announced', async () => {
    const accepted = { ...record, status: 'Diterima', kelasPenempatan: 'Bilingual', nomorVa: '7456012627300120' };
    expect((await checkResult(input, 'client', fakeRepository(accepted))).kind).toBe('stage');
    expect(await checkResult(input, 'client', fakeRepository({ ...accepted, diumumkanPada: '2027-02-09T01:00:00Z' }))).toEqual({
      kind: 'accepted', applicant, kelasPenempatan: 'Bilingual', kelasTujuan: null, nomorVa: '7456012627300120',
    });
  });

  it('adds the Kelas Tujuan for an accepted Pindahan', async () => {
    const view = await checkResult(input, 'client', fakeRepository({ ...record, status: 'Diterima', diumumkanPada: '2027-02-09T01:00:00Z', jenisPendaftaran: 'Pindahan', kelasTujuan: '3', kelasPenempatan: 'Reguler', nomorVa: '7456012627300120' }));
    expect(view).toMatchObject({ kind: 'accepted', kelasPenempatan: 'Reguler', kelasTujuan: '3' });
  });

  it('reveals Ditolak only once announced', async () => {
    expect((await checkResult(input, 'client', fakeRepository({ ...record, status: 'Ditolak' }))).kind).toBe('stage');
    expect(await checkResult(input, 'client', fakeRepository({ ...record, status: 'Ditolak', diumumkanPada: '2027-02-09T01:00:00Z' }))).toEqual({ kind: 'rejected', applicant });
  });

  it('shows a Pendaftar Dibatalkan after the announcement as cancelled, not as accepted', async () => {
    const view = await checkResult(input, 'client', fakeRepository({ ...record, status: 'Dibatalkan', diumumkanPada: '2027-02-09T01:00:00Z', nomorVa: '7456012627300120' }));
    expect(view).toEqual({ kind: 'cancelled', applicant });
  });

  it('allows the Surat Penerimaan only for an announced Diterima with a Nomor VA, rechecked every time', async () => {
    const announced = { ...record, status: 'Diterima', tempatLahir: 'PURWAKARTA', diumumkanPada: '2027-02-09T01:00:00Z', nomorVa: '7456012627300120' };
    expect(await authorizeAcceptanceLetter(input, 'client', fakeRepository(announced))).toEqual({
      allowed: true,
      nomorPendaftaran: 'OB-2027-001',
      letter: { namaLengkap: 'SITI AMINAH', nomorVa: '7456012627300120', tempatLahir: 'PURWAKARTA', tanggalLahir: '2020-03-12' },
    });
    for (const changed of [
      { ...announced, diumumkanPada: null },
      { ...announced, status: 'Ditolak' },
      { ...announced, status: 'Dibatalkan' },
      { ...announced, nomorVa: null },
    ]) {
      expect((await authorizeAcceptanceLetter(input, 'client', fakeRepository(changed))).allowed).toBe(false);
    }
  });

  it('counts a Surat Penerimaan request with the wrong birth date as a failed attempt', async () => {
    const repository = fakeRepository({ ...record, status: 'Diterima', diumumkanPada: '2027-02-09T01:00:00Z', nomorVa: '7456012627300120' });
    expect(await authorizeAcceptanceLetter({ ...input, tanggalLahir: '2020-03-13' }, 'client', repository)).toEqual({ allowed: false, view: { kind: 'not-found' } });
    expect(repository.recordFailure).toHaveBeenCalledWith('client');
  });

  it('shows the Jadwal OKB date and Gelombang name while scheduled', async () => {
    const view = await checkResult(input, 'client', fakeRepository({ ...record, status: 'Terjadwal OKB', jadwalTanggal: '2027-01-12', jadwalGelombang: 2 }));
    expect(view).toEqual({ kind: 'stage', applicant, stage: 'Terjadwal OKB', jadwal: { tanggal: '2027-01-12', gelombang: 'Gelombang 2' } });
  });

  it('tells the parents of a Pendaftar Dibatalkan to contact the school', async () => {
    expect(await checkResult(input, 'client', fakeRepository({ ...record, status: 'Dibatalkan' }))).toEqual({ kind: 'cancelled', applicant });
  });

  it('gives the same answer for an unknown number, a wrong birth date, and a registration still uploading', async () => {
    const answers = await Promise.all([
      checkResult({ ...input, nomorPendaftaran: 'OB-2027-999' }, 'client', fakeRepository()),
      checkResult({ ...input, tanggalLahir: '2020-03-13' }, 'client', fakeRepository()),
      checkResult(input, 'client', fakeRepository({ ...record, status: 'Menunggu Unggahan' })),
    ]);
    expect(answers).toEqual([{ kind: 'not-found' }, { kind: 'not-found' }, { kind: 'not-found' }]);
  });

  it('recognises the Nomor Pendaftaran in lower case and with stray spaces', async () => {
    expect(normalizeNomorPendaftaran(' ob - 2027 - 001 ')).toBe('OB-2027-001');
    const view = await checkResult({ nomorPendaftaran: ' ob-2027-001 ', tanggalLahir: ' 2020-03-12 ' }, 'client', fakeRepository());
    expect(view.kind).toBe('stage');
  });

  it('asks for both fields without counting it as a failed attempt', async () => {
    const repository = fakeRepository();
    for (const attempt of [{ ...input, nomorPendaftaran: '  ' }, { ...input, tanggalLahir: '' }, { ...input, tanggalLahir: '12-03-2020' }]) {
      expect(await checkResult(attempt, 'client', repository)).toEqual({ kind: 'invalid', message: 'Isi Nomor Pendaftaran dan tanggal lahir anak.' });
    }
    expect(repository.recordFailure).not.toHaveBeenCalled();
    expect(repository.findByNomorPendaftaran).not.toHaveBeenCalled();
  });

  it('locks a client out after repeated failures, even when the next attempt is correct', async () => {
    const repository = fakeRepository(record, 3);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(await checkResult({ ...input, tanggalLahir: '2019-01-01' }, 'client', repository)).toEqual({ kind: 'not-found' });
    }
    expect(await checkResult(input, 'client', repository)).toEqual({ kind: 'locked' });
    // Klien lain tidak ikut terkunci.
    expect((await checkResult(input, 'other-client', repository)).kind).toBe('stage');
  });

  it('does not count a successful check as a failure', async () => {
    const repository = fakeRepository();
    await checkResult(input, 'client', repository);
    expect(repository.recordFailure).not.toHaveBeenCalled();
  });

  it('returns only the name and Nomor Pendaftaran, never the birth date', async () => {
    const view = await checkResult(input, 'client', fakeRepository());
    expect(JSON.stringify(view)).not.toContain('2020-03-12');
  });
});
