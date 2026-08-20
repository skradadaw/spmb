import { supabase } from '@/lib/supabase';
import { FormData, formSchema } from './schema';

export interface DocumentUrls {
  dokumen_akta_kelahiran?: string | null;
  dokumen_kartu_keluarga?: string | null;
  dokumen_pas_foto?: string | null;
  dokumen_bukti_pembayaran?: string | null;
}

export async function submitRegistrationAction(data: FormData, documentUrls?: DocumentUrls) {
  try {
    // 1. Server-side validation using Zod schema
    const validation = formSchema.safeParse(data);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      const errorMessage = firstIssue 
        ? `${firstIssue.path.join('.') ? firstIssue.path.join('.') + ': ' : ''}${firstIssue.message}`
        : 'Format data pendaftaran tidak valid.';
      console.warn('Server validation failed:', validation.error.format());
      return { success: false, error: `Validasi data gagal: ${errorMessage}` };
    }

    const validData = validation.data;

    // 2. Insert into Supabase Database
    const { error } = await supabase.from('pendaftar').insert([
      {
        // Data Murid
        jenis_pendaftaran: validData.jenisPendaftaran,
        pilihan_kelas: validData.pilihanKelas,
        nama_lengkap: validData.namaLengkap,
        jenis_kelamin: validData.jenisKelamin,
        tempat_lahir: validData.tempatLahir,
        tanggal_lahir: validData.tanggalLahir,
        nik: validData.nik,
        nisn: validData.nisn || null,
        bekerja_di_direktorat2: validData.bekerjaDiDirektorat2 || 'Tidak',
        profesi_di_direktorat2: validData.profesiDiDirektorat2 || null,
        asal_sekolah: validData.asalSekolah,
        prestasi_anak: validData.prestasiAnak || null,
        tingkat_prestasi: validData.tingkatPrestasi || null,
        jarak_ke_sekolah: validData.jarakKeSekolah || null,
        
        // Data Wilayah & Alamat
        alamat_jalan: validData.alamatJalan,
        rt: validData.rt,
        rw: validData.rw,
        kelurahan: validData.kelurahan,
        kecamatan: validData.kecamatan,
        kota: validData.kota,
        provinsi: validData.provinsi,
        alamat_rumah: `${validData.alamatJalan}, RT ${validData.rt}/RW ${validData.rw}, Kel. ${validData.kelurahan}, Kec. ${validData.kecamatan}, Kota/Kab. ${validData.kota}, Prov. ${validData.provinsi}`,

        // Data Ayah
        nama_ayah: validData.namaAyah,
        nik_ayah: validData.nikAyah || null,
        pendidikan_ayah: validData.pendidikanAyah || null,
        pekerjaan_ayah: validData.pekerjaanAyah,
        penghasilan_ayah: validData.penghasilanAyah || null,
        telepon_ayah: validData.teleponAyah,
        no_telp: validData.teleponAyah || validData.teleponIbu,
        alamat_ayah: validData.alamatAyah || null,

        // Data Ibu
        nama_ibu: validData.namaIbu,
        nik_ibu: validData.nikIbu || null,
        pendidikan_ibu: validData.pendidikanIbu || null,
        pekerjaan_ibu: validData.pekerjaanIbu,
        penghasilan_ibu: validData.penghasilanIbu || null,
        telepon_ibu: validData.teleponIbu,
        alamat_ibu: validData.alamatIbu || null,

        // Dokumen Terunggah
        dokumen_akta_kelahiran: documentUrls?.dokumen_akta_kelahiran || null,
        dokumen_kartu_keluarga: documentUrls?.dokumen_kartu_keluarga || null,
        dokumen_pas_foto: documentUrls?.dokumen_pas_foto || null,
        dokumen_bukti_pembayaran: documentUrls?.dokumen_bukti_pembayaran || null,
      }
    ]);

    if (error) {
      console.error('Error submitting to database:', error);
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
