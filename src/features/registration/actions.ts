import { supabase } from '@/lib/supabase';
import { FormData } from './schema';

export async function submitRegistrationAction(data: FormData) {
  try {
    const { error } = await supabase.from('pendaftar').insert([
      {
        // Data Murid
        jenis_pendaftaran: data.jenisPendaftaran,
        pilihan_kelas: data.pilihanKelas,
        nama_lengkap: data.namaLengkap,
        jenis_kelamin: data.jenisKelamin,
        tempat_lahir: data.tempatLahir,
        tanggal_lahir: data.tanggalLahir,
        nik: data.nik,
        nisn: data.nisn || null,
        bekerja_di_direktorat2: data.bekerjaDiDirektorat2 || null,
        profesi_di_direktorat2: data.profesiDiDirektorat2 || null,
        asal_sekolah: data.asalSekolah,
        prestasi_anak: data.prestasiAnak || null,
        tingkat_prestasi: data.tingkatPrestasi || null,
        jarak_ke_sekolah: data.jarakKeSekolah || null,
        alamat_rumah: `${data.alamatJalan}, RT ${data.rt}/RW ${data.rw}, Kel. ${data.kelurahan}, Kec. ${data.kecamatan}, Kota/Kab. ${data.kota}, Prov. ${data.provinsi}`,

        // Data Ayah
        nama_ayah: data.namaAyah,
        nik_ayah: data.nikAyah || null,
        pendidikan_ayah: data.pendidikanAyah || null,
        pekerjaan_ayah: data.pekerjaanAyah,
        penghasilan_ayah: data.penghasilanAyah || null,
        telepon_ayah: data.teleponAyah,
        alamat_ayah: data.alamatAyah || null,

        // Data Ibu
        nama_ibu: data.namaIbu,
        nik_ibu: data.nikIbu || null,
        pendidikan_ibu: data.pendidikanIbu || null,
        pekerjaan_ibu: data.pekerjaanIbu,
        penghasilan_ibu: data.penghasilanIbu || null,
        telepon_ibu: data.teleponIbu,
        alamat_ibu: data.alamatIbu || null,
      }
    ]);

    if (error) {
      console.error('Error submitting:', error);
      let userFriendlyMessage = 'Terjadi kesalahan saat menyimpan data pendaftaran.';
      if (error.code === '23505') {
        userFriendlyMessage = 'Data dengan NIK ini sudah pernah terdaftar di sistem. Mohon gunakan NIK yang belum terdaftar.';
      } else if (error.message) {
        userFriendlyMessage = `Gagal menyimpan: ${error.message}`;
      }
      return { success: false, error: userFriendlyMessage };
    }
    
    return { success: true };
  } catch (err: any) {
    console.error('Unexpected error in submitRegistrationAction:', err);
    return { success: false, error: err?.message || 'Terjadi kesalahan server saat memproses data.' };
  }
}
