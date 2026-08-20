import * as z from 'zod';

const reqStr = (msg: string, minLen = 1, maxLen = 255) =>
  z.string({ message: msg }).trim().min(minLen, msg).max(maxLen, 'Isian terlalu panjang');

const optionalStr = (maxLen = 255) =>
  z.string().trim().max(maxLen, 'Isian terlalu panjang').optional();

const oneOf = (msg: string, values: readonly string[]) =>
  reqStr(msg).refine((value) => values.includes(value), msg);

export const step1BaseSchema = z.object({
  // Data Murid
  jenisPendaftaran: oneOf('Jenis pendaftaran wajib dipilih', ['Siswa Baru', 'Pindahan']),
  pilihanKelas: oneOf('Pilihan kelas wajib dipilih', ['Reguler', 'Bilingual', 'Tahfizh']),
  namaLengkap: reqStr('Nama lengkap wajib diisi', 3),
  jenisKelamin: oneOf('Jenis kelamin wajib dipilih', ['Laki-laki', 'Perempuan']),
  tempatLahir: reqStr('Tempat lahir wajib diisi', 3, 100),
  tanggalLahir: z.iso.date({ message: 'Tanggal lahir tidak valid' }).refine(
    (value) => new Date(`${value}T00:00:00Z`) <= new Date(),
    'Tanggal lahir tidak boleh di masa depan',
  ),
  nik: z.string({ message: 'NIK wajib diisi' })
    .regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  nisn: z.string({ message: 'NISN wajib diisi' }).regex(/^\d{10}$/, 'NISN harus 10 digit angka'),
  bekerjaDiDirektorat2: oneOf('Wajib dipilih', ['Ya', 'Tidak']),
  profesiDiDirektorat2: optionalStr(100),
  asalSekolah: reqStr('Asal sekolah wajib diisi', 2),
  prestasiAnak: optionalStr(1000),
  tingkatPrestasi: z.string().trim().refine(
    (value) => ['', 'Sekolah', 'Kecamatan', 'Kabupaten/Kota', 'Provinsi', 'Nasional'].includes(value),
    'Tingkat prestasi tidak valid',
  ).optional(),
  jarakKeSekolah: reqStr('Jarak ke sekolah wajib diisi', 1, 20),
  alamatJalan: reqStr('Nama jalan wajib diisi', 3, 1000),
  rt: z.string({ message: 'RT wajib diisi' })
    .regex(/^\d{1,3}$/, 'RT harus 1-3 digit angka'),
  rw: z.string({ message: 'RW wajib diisi' })
    .regex(/^\d{1,3}$/, 'RW harus 1-3 digit angka'),
  kelurahan: reqStr('Kelurahan wajib dipilih', 1, 100),
  kecamatan: reqStr('Kecamatan wajib dipilih', 1, 100),
  kota: reqStr('Kota/Kabupaten wajib dipilih', 1, 100),
  provinsi: reqStr('Provinsi wajib dipilih', 1, 100),
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
  pendidikanAyah: oneOf('Pendidikan Ayah wajib dipilih', ['SD', 'SMP', 'SMA', 'D1-D3', 'S1', 'S2', 'S3']),
  pekerjaanAyah: reqStr('Pekerjaan Ayah wajib diisi', 2, 100),
  penghasilanAyah: oneOf('Penghasilan Ayah wajib dipilih', ['< 2 Juta', '2-5 Juta', '5-10 Juta', '> 10 Juta']),
  teleponAyah: z.string({ message: 'Nomor WhatsApp Ayah wajib diisi' })
    .regex(/^(^\+62|62|^08)\d{8,12}$/, 'Nomor telepon tidak valid'),
  alamatAyah: reqStr('Alamat Ayah wajib diisi', 5, 1000),

  // Data Ibu
  namaIbu: reqStr('Nama Ibu wajib diisi', 3),
  nikIbu: z.string({ message: 'NIK Ibu wajib diisi' })
    .regex(/^\d{16}$/, 'NIK Ibu harus 16 digit angka'),
  pendidikanIbu: oneOf('Pendidikan Ibu wajib dipilih', ['SD', 'SMP', 'SMA', 'D1-D3', 'S1', 'S2', 'S3']),
  pekerjaanIbu: reqStr('Pekerjaan Ibu wajib diisi', 2, 100),
  penghasilanIbu: oneOf('Penghasilan Ibu wajib dipilih', ['Tidak Berpenghasilan', '< 2 Juta', '2-5 Juta', '5-10 Juta', '> 10 Juta']),
  teleponIbu: z.string({ message: 'Nomor WhatsApp Ibu wajib diisi' })
    .regex(/^(^\+62|62|^08)\d{8,12}$/, 'Nomor telepon tidak valid'),
  alamatIbu: reqStr('Alamat Ibu wajib diisi', 5, 1000),
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
