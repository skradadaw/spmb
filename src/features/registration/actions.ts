import { supabase } from '@/lib/supabase';
import { FormData } from './schema';

export async function submitRegistrationAction(data: FormData) {
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
      anak_ke: data.anakKe || null,
      saudara_di_muhajirin: data.saudaraDiMuhajirin || null,
      asal_sekolah: data.asalSekolah,
      prestasi_anak: data.prestasiAnak || null,
      tingkat_prestasi: data.tingkatPrestasi || null,
      jarak_ke_sekolah: data.jarakKeSekolah || null,
      alamat_rumah: data.alamatRumah,

      // Data Ayah
      nama_ayah: data.namaAyah,
      nik_ayah: data.nikAyah || null,
      tahun_lahir_ayah: data.tahunLahirAyah || null,
      pendidikan_ayah: data.pendidikanAyah || null,
      pekerjaan_ayah: data.pekerjaanAyah,
      penghasilan_ayah: data.penghasilanAyah || null,
      telepon_ayah: data.teleponAyah,
      alamat_ayah: data.alamatAyah || null,

      // Data Ibu
      nama_ibu: data.namaIbu,
      nik_ibu: data.nikIbu || null,
      tahun_lahir_ibu: data.tahunLahirIbu || null,
      pendidikan_ibu: data.pendidikanIbu || null,
      pekerjaan_ibu: data.pekerjaanIbu,
      penghasilan_ibu: data.penghasilanIbu || null,
      telepon_ibu: data.teleponIbu,
      alamat_ibu: data.alamatIbu || null,
    }
  ]);

  if (error) {
    console.error('Error submitting:', error);
    return { success: false, error };
  }
  
  return { success: true };
}
