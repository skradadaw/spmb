import * as z from 'zod';

// Schema Validasi dengan Zod
export const formSchema = z.object({
  // Step 1: Data Murid
  namaLengkap: z.string().min(3, 'Nama lengkap wajib diisi'),
  nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  tempatLahir: z.string().min(3, 'Tempat lahir wajib diisi'),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  asalSekolah: z.string().optional(),
  
  // Step 2: Data Orang Tua
  namaAyah: z.string().min(3, 'Nama Ayah wajib diisi'),
  pekerjaanAyah: z.string().min(2, 'Pekerjaan Ayah wajib diisi'),
  namaIbu: z.string().min(3, 'Nama Ibu wajib diisi'),
  pekerjaanIbu: z.string().min(2, 'Pekerjaan Ibu wajib diisi'),
  noTelp: z.string().regex(/^(^\+62|62|^08)\d{8,12}$/, 'Nomor telepon tidak valid'),
});

export type FormData = z.infer<typeof formSchema>;
