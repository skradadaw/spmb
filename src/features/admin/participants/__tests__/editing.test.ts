import { describe, expect, it } from 'vitest';
import { toPendaftarRow } from '@/features/registration/server/supabaseRegistrationRepository';
import type { FormData as RegistrationData } from '@/features/registration/schema';
import { EDIT_FIELDS, EDIT_SOURCE_COLUMNS, GROUP_COLUMNS, fromPendaftarRow, groupKeys } from '../editing';

const documents = { aktaKelahiran: 'a', kartuKeluarga: 'b', pasFoto: 'c', buktiPembayaran: 'd' };

const data: RegistrationData = {
  jenisPendaftaran: 'Pindahan', pilihanKelas: 'Reguler', kelasTujuan: '3',
  namaLengkap: 'Siti Aminah', jenisKelamin: 'Perempuan', tempatLahir: 'Purwakarta', tanggalLahir: '2018-01-01', nik: '1234567890123456', nisn: '1234567890',
  bekerjaDiDirektorat2: 'Ya', namaOrangtuaDirektorat2: 'Budi', unitOrangtuaDirektorat2: 'SD Plus 3 Al-Muhajirin',
  saudaraDiDirektorat2: 'Tidak', namaSaudaraDirektorat2: '', unitSaudaraDirektorat2: '',
  asalSekolah: 'SD Melati', prestasiAnak: 'Juara 1', tingkatPrestasi: 'Kecamatan', jarakKeSekolah: '2 km',
  alamatJalan: 'Jalan Melati', rt: '01', rw: '02', kelurahan: 'Ciseureuh', kecamatan: 'Purwakarta', kota: 'Purwakarta', provinsi: 'Jawa Barat',
  adaPengusul: 'Ya', tipePengusul: 'Kepala TK', namaTkPengusul: 'TK Melati', namaPengusul: 'Bu Ani', nomorWaPengusul: '081234567890',
  namaAyah: 'Budi Santoso', nikAyah: '2345678901234567', pendidikanAyah: 'SMA', pekerjaanAyah: 'Wiraswasta', penghasilanAyah: '5-10 Juta', teleponAyah: '081234567890', alamatAyah: 'Jalan Melati 1',
  namaIbu: 'Ani Santoso', nikIbu: '3456789012345678', pendidikanIbu: 'SMA', pekerjaanIbu: 'Guru', penghasilanIbu: '2-5 Juta', teleponIbu: '081234567891', alamatIbu: 'Jalan Melati 1',
};

describe('admin participant editing definitions', () => {
  it('rebuilds the exact registration values from a stored row', () => {
    expect(fromPendaftarRow(toPendaftarRow(data, documents))).toEqual(data);
  });

  it('defaults missing yes/no answers to Tidak like the registration form', () => {
    const values = fromPendaftarRow({});
    expect(values.bekerjaDiDirektorat2).toBe('Tidak');
    expect(values.adaPengusul).toBe('Tidak');
    expect(values.namaLengkap).toBe('');
  });

  it('writes only columns the registration row actually produces', () => {
    const row = toPendaftarRow(data, documents);
    for (const columns of Object.values(GROUP_COLUMNS)) {
      for (const column of columns) expect(row).toHaveProperty(column);
    }
    expect(Object.values(GROUP_COLUMNS).flat()).not.toContain('nomor_pendaftaran');
    expect(EDIT_SOURCE_COLUMNS).not.toContain('dokumen_');
  });

  it('edits address regions through the cascading selects', () => {
    expect(EDIT_FIELDS.address.map(({ key }) => key)).not.toContain('provinsi');
    expect(groupKeys('address')).toEqual(expect.arrayContaining(['alamatJalan', 'provinsi', 'kota', 'kecamatan', 'kelurahan']));
  });
});
