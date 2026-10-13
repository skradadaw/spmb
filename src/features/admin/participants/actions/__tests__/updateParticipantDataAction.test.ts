import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  revalidatePath: vi.fn(),
  rpc: vi.fn(),
  readRow: vi.fn(),
  nikOwner: vi.fn(),
  update: vi.fn(),
  updateResult: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/features/auth/session', () => ({ getAdminSession: mocks.session }));
vi.mock('@/features/registration/server/supabaseAdmin', () => ({
  getSupabaseAdmin: () => ({
    rpc: mocks.rpc,
    from: () => ({
      select: (columns: string) => {
        if (columns === 'nomor_pendaftaran') {
          const chain = { eq: () => chain, neq: () => chain, limit: () => chain, maybeSingle: mocks.nikOwner };
          return chain;
        }
        return { eq: () => ({ maybeSingle: mocks.readRow }) };
      },
      update: (values: unknown) => { mocks.update(values); return { eq: mocks.updateResult }; },
    }),
  }),
}));

import { updateParticipantDataAction } from '../updateParticipantDataAction';

const participantId = '123e4567-e89b-12d3-a456-426614174000';
const idle = { status: 'idle', message: '' } as const;

const storedRow = {
  id: participantId,
  jenis_pendaftaran: 'Siswa Baru', pilihan_kelas: 'Reguler', kelas_tujuan: null,
  nama_lengkap: 'Siti Aminah', jenis_kelamin: 'Perempuan', tempat_lahir: 'Purwakarta', tanggal_lahir: '2018-01-01', nik: '1234567890123456', nisn: '1234567890',
  bekerja_di_direktorat2: 'Tidak', saudara_di_direktorat2: 'Tidak',
  asal_sekolah: 'TK Melati', jarak_ke_sekolah: '2 km',
  alamat_jalan: 'Jalan Melati', rt: '01', rw: '02', kelurahan: 'Ciseureuh', kecamatan: 'Purwakarta', kota: 'Purwakarta', provinsi: 'Jawa Barat',
  ada_pengusul: 'Tidak',
  nama_ayah: 'Budi Santoso', nik_ayah: '2345678901234567', pendidikan_ayah: 'SMA', pekerjaan_ayah: 'Wiraswasta', penghasilan_ayah: '5-10 Juta', telepon_ayah: '081234567890', alamat_ayah: 'Jalan Melati 1',
  nama_ibu: 'Ani Santoso', nik_ibu: '3456789012345678', pendidikan_ibu: 'SMA', pekerjaan_ibu: 'Guru', penghasilan_ibu: '2-5 Juta', telepon_ibu: '081234567891', alamat_ibu: 'Jalan Melati 1',
};

function form(group: string, values: Record<string, string>) {
  const data = new FormData();
  data.set('participantId', participantId);
  data.set('group', group);
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

const fatherValues = {
  namaAyah: ' Budi Hartono ', nikAyah: '2345678901234567', pendidikanAyah: 'S1', pekerjaanAyah: 'Guru',
  penghasilanAyah: '2-5 Juta', teleponAyah: '081299990000', alamatAyah: 'Jalan Mawar 2',
};

describe('updateParticipantDataAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue(true);
    mocks.readRow.mockResolvedValue({ data: storedRow, error: null });
    mocks.nikOwner.mockResolvedValue({ data: null, error: null });
    mocks.updateResult.mockResolvedValue({ error: null });
  });

  it('saves one group and writes only that group\'s columns', async () => {
    const result = await updateParticipantDataAction(idle, form('father', fatherValues));

    expect(result).toEqual({ status: 'success', message: 'Perubahan tersimpan.' });
    expect(mocks.update).toHaveBeenCalledWith({
      nama_ayah: 'Budi Hartono', nik_ayah: '2345678901234567', pendidikan_ayah: 'S1', pekerjaan_ayah: 'Guru',
      penghasilan_ayah: '2-5 Juta', telepon_ayah: '081299990000', no_telp: '081299990000', alamat_ayah: 'Jalan Mawar 2',
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/admin/pendaftar/${participantId}`);
  });

  it('applies the registration form rules and reports errors per field', async () => {
    const result = await updateParticipantDataAction(idle, form('father', { ...fatherValues, nikAyah: '123', teleponAyah: '12' }));

    expect(result.status).toBe('error');
    expect(result.fieldErrors).toEqual({ nikAyah: 'NIK Ayah harus 16 digit angka', teleponAyah: 'Nomor telepon tidak valid' });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('enforces conditional rules such as the affiliation name', async () => {
    const result = await updateParticipantDataAction(idle, form('affiliation', {
      bekerjaDiDirektorat2: 'Ya', namaOrangtuaDirektorat2: '', unitOrangtuaDirektorat2: '', saudaraDiDirektorat2: 'Tidak',
    }));

    expect(result.fieldErrors).toMatchObject({ namaOrangtuaDirektorat2: 'Nama orang tua yang bekerja wajib diisi' });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('does not let invalid older data in another group block the edit', async () => {
    mocks.readRow.mockResolvedValue({ data: { ...storedRow, asal_sekolah: null, nisn: null }, error: null });

    await expect(updateParticipantDataAction(idle, form('father', fatherValues))).resolves.toMatchObject({ status: 'success' });
  });

  it('rejects a NIK that belongs to another applicant and names them', async () => {
    mocks.nikOwner.mockResolvedValue({ data: { nomor_pendaftaran: 'OB-2027-014' }, error: null });

    const result = await updateParticipantDataAction(idle, form('identity', {
      namaLengkap: 'Siti Aminah', jenisKelamin: 'Perempuan', tempatLahir: 'Purwakarta', tanggalLahir: '2018-01-01', nik: '9999999999999999', nisn: '1234567890',
    }));
    expect(result.fieldErrors).toEqual({ nik: 'NIK ini sudah dipakai oleh OB-2027-014.' });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('changes class choice through the capacity-checked RPC', async () => {
    mocks.rpc.mockResolvedValue({ data: 'ok', error: null });

    await expect(updateParticipantDataAction(idle, form('registration', { jenisPendaftaran: 'Siswa Baru', pilihanKelas: 'Bilingual' })))
      .resolves.toMatchObject({ status: 'success' });
    expect(mocks.rpc).toHaveBeenCalledWith('update_applicant_registration', {
      p_pendaftar_id: participantId, p_jenis: 'Siswa Baru', p_kelas: 'Bilingual', p_kelas_tujuan: null,
    });
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/pendaftaran');
  });

  it('refuses a move into a full class', async () => {
    mocks.rpc.mockResolvedValue({ data: 'full', error: null });

    const result = await updateParticipantDataAction(idle, form('registration', { jenisPendaftaran: 'Siswa Baru', pilihanKelas: 'Bilingual' }));
    expect(result.message).toBe('Kuota Bilingual sudah penuh. Geser kuota di menu Kuota Kelas terlebih dahulu.');
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('requires a target grade when switching to Pindahan', async () => {
    const result = await updateParticipantDataAction(idle, form('registration', { jenisPendaftaran: 'Pindahan', pilihanKelas: 'Reguler', kelasTujuan: '' }));
    expect(result.fieldErrors).toEqual({ kelasTujuan: 'Kelas tujuan wajib dipilih' });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('rebuilds the combined home address when the address changes', async () => {
    await updateParticipantDataAction(idle, form('address', {
      alamatJalan: 'Jalan Kenanga', rt: '03', rw: '04', provinsi: 'Jawa Barat', kota: 'Bandung', kecamatan: 'Coblong', kelurahan: 'Dago',
    }));
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
      alamat_jalan: 'Jalan Kenanga',
      alamat_rumah: 'Jalan Kenanga, RT 03/RW 04, Kel. Dago, Kec. Coblong, Kota/Kab. Bandung, Prov. Jawa Barat',
    }));
  });

  it('rejects unknown groups and missing sessions', async () => {
    await expect(updateParticipantDataAction(idle, form('documents', {}))).resolves.toMatchObject({ status: 'error', message: 'Data pendaftar tidak valid.' });
    mocks.session.mockResolvedValue(false);
    await expect(updateParticipantDataAction(idle, form('father', fatherValues))).resolves.toMatchObject({ message: 'Sesi admin tidak valid. Silakan masuk kembali.' });
    expect(mocks.readRow).not.toHaveBeenCalled();
  });
});
