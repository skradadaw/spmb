import * as z from 'zod';

export const formSchema = z.object({
  // Data Murid
  jenisPendaftaran: z.string().min(1, 'Jenis pendaftaran wajib diisi'),
  pilihanKelas: z.string().min(1, 'Pilihan kelas wajib diisi'),
  namaLengkap: z.string().min(3, 'Nama lengkap wajib diisi'),
  jenisKelamin: z.string().min(1, 'Jenis kelamin wajib diisi'),
  tempatLahir: z.string().min(3, 'Tempat lahir wajib diisi'),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  nisn: z.string().optional(),
  anakKe: z.string().optional(),
  saudaraDiMuhajirin: z.string().optional(),
  asalSekolah: z.string().min(2, 'Asal sekolah wajib diisi'),
  prestasiAnak: z.string().optional(),
  tingkatPrestasi: z.string().optional(),
  jarakKeSekolah: z.string().optional(),
  alamatRumah: z.string().min(5, 'Alamat rumah wajib diisi'),

  // Data Ayah
  namaAyah: z.string().min(3, 'Nama Ayah wajib diisi'),
  nikAyah: z.string().optional(),
  tahunLahirAyah: z.string().optional(),
  pendidikanAyah: z.string().optional(),
  pekerjaanAyah: z.string().min(2, 'Pekerjaan Ayah wajib diisi'),
  penghasilanAyah: z.string().optional(),
  teleponAyah: z.string().regex(/^(^\+62|62|^08)\d{8,12}$/, 'Nomor telepon tidak valid'),
  alamatAyah: z.string().optional(),

  // Data Ibu
  namaIbu: z.string().min(3, 'Nama Ibu wajib diisi'),
  nikIbu: z.string().optional(),
  tahunLahirIbu: z.string().optional(),
  pendidikanIbu: z.string().optional(),
  pekerjaanIbu: z.string().min(2, 'Pekerjaan Ibu wajib diisi'),
  penghasilanIbu: z.string().optional(),
  teleponIbu: z.string().regex(/^(^\+62|62|^08)\d{8,12}$/, 'Nomor telepon tidak valid'),
  alamatIbu: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;
