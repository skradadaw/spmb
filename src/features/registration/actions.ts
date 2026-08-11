import { supabase } from '@/lib/supabase';
import { FormData } from './schema';

export async function submitRegistrationAction(data: FormData) {
  const { error } = await supabase.from('pendaftar').insert([
    {
      nama_lengkap: data.namaLengkap,
      nik: data.nik,
      tempat_lahir: data.tempatLahir,
      tanggal_lahir: data.tanggalLahir,
      asal_sekolah: data.asalSekolah,
      nama_ayah: data.namaAyah,
      pekerjaan_ayah: data.pekerjaanAyah,
      nama_ibu: data.namaIbu,
      pekerjaan_ibu: data.pekerjaanIbu,
      no_telp: data.noTelp,
    }
  ]);

  if (error) {
    console.error('Error submitting:', error);
    return { success: false, error };
  }
  
  return { success: true };
}
