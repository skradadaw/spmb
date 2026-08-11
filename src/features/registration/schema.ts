import * as z from 'zod';

const reqStr = (msg: string, minLen = 1) =>
  z.string({ message: msg }).min(minLen, msg);

export const step1BaseSchema = z.object({
  // Data Murid
  jenisPendaftaran: reqStr('Jenis pendaftaran wajib dipilih'),
  pilihanKelas: reqStr('Pilihan kelas wajib dipilih'),
  namaLengkap: reqStr('Nama lengkap wajib diisi', 3),
  jenisKelamin: reqStr('Jenis kelamin wajib dipilih'),
  tempatLahir: reqStr('Tempat lahir wajib diisi', 3),
  tanggalLahir: reqStr('Tanggal lahir wajib dipilih'),
  nik: z.string({ message: 'NIK wajib diisi' })
    .regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  nisn: reqStr('NISN wajib diisi', 5),
  bekerjaDiDirektorat2: reqStr('Wajib dipilih'),
  profesiDiDirektorat2: z.string().optional(),
  asalSekolah: reqStr('Asal sekolah wajib diisi', 2),
  prestasiAnak: z.string().optional(),
  tingkatPrestasi: z.string().optional(),
  jarakKeSekolah: reqStr('Jarak ke sekolah wajib diisi'),
  alamatJalan: reqStr('Nama jalan wajib diisi', 3),
  rt: z.string({ message: 'RT wajib diisi' })
    .regex(/^\d+$/, 'RT hanya angka').min(1, 'RT wajib diisi'),
  rw: z.string({ message: 'RW wajib diisi' })
    .regex(/^\d+$/, 'RW hanya angka').min(1, 'RW wajib diisi'),
  kelurahan: reqStr('Kelurahan wajib dipilih'),
  kecamatan: reqStr('Kecamatan wajib dipilih'),
  kota: reqStr('Kota/Kabupaten wajib dipilih'),
  provinsi: reqStr('Provinsi wajib dipilih'),
});

export const step1Schema = step1BaseSchema.superRefine((data, ctx) => {
  if (data.bekerjaDiDirektorat2 === 'Ya' && (!data.profesiDiDirektorat2 || data.profesiDiDirektorat2.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Profesi wajib diisi jika bekerja di direktorat 2',
      path: ['profesiDiDirektorat2']
    });
  }
});

export const step2Schema = z.object({
  // Data Ayah
  namaAyah: reqStr('Nama Ayah wajib diisi', 3),
  nikAyah: z.string({ message: 'NIK Ayah wajib diisi' })
    .regex(/^\d{16}$/, 'NIK Ayah harus 16 digit angka'),
  pendidikanAyah: reqStr('Pendidikan Ayah wajib dipilih'),
  pekerjaanAyah: reqStr('Pekerjaan Ayah wajib diisi', 2),
  penghasilanAyah: reqStr('Penghasilan Ayah wajib dipilih'),
  teleponAyah: z.string({ message: 'Nomor WhatsApp Ayah wajib diisi' })
    .regex(/^(^\+62|62|^08)\d{8,12}$/, 'Nomor telepon tidak valid'),
  alamatAyah: reqStr('Alamat Ayah wajib diisi', 5),

  // Data Ibu
  namaIbu: reqStr('Nama Ibu wajib diisi', 3),
  nikIbu: z.string({ message: 'NIK Ibu wajib diisi' })
    .regex(/^\d{16}$/, 'NIK Ibu harus 16 digit angka'),
  pendidikanIbu: reqStr('Pendidikan Ibu wajib dipilih'),
  pekerjaanIbu: reqStr('Pekerjaan Ibu wajib diisi', 2),
  penghasilanIbu: reqStr('Penghasilan Ibu wajib dipilih'),
  teleponIbu: z.string({ message: 'Nomor WhatsApp Ibu wajib diisi' })
    .regex(/^(^\+62|62|^08)\d{8,12}$/, 'Nomor telepon tidak valid'),
  alamatIbu: reqStr('Alamat Ibu wajib diisi', 5),
});

export const formSchema = z.object({
  ...step1BaseSchema.shape,
  ...step2Schema.shape,
}).superRefine((data, ctx) => {
  if (data.bekerjaDiDirektorat2 === 'Ya' && (!data.profesiDiDirektorat2 || data.profesiDiDirektorat2.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Profesi wajib diisi jika bekerja di direktorat 2',
      path: ['profesiDiDirektorat2']
    });
  }
});

export type FormData = z.infer<typeof formSchema>;
