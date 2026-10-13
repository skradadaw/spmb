import * as z from 'zod';

const reqStr = (msg: string, minLen = 1, maxLen = 255) =>
  z.string({ message: msg }).trim().min(minLen, msg).max(maxLen, 'Isian terlalu panjang');

const optionalStr = (maxLen = 255) =>
  z.string().trim().max(maxLen, 'Isian terlalu panjang').optional();

const oneOf = (msg: string, values: readonly string[]) =>
  reqStr(msg).refine((value) => values.includes(value), msg);

export const DIRECTORATE_2_UNITS = [
  'RA Al-Muhajirin',
  'SD Plus 2 Al-Muhajirin',
  'SD Plus 3 Al-Muhajirin',
  'SMP Fullday Al-Muhajirin',
  'SMA Fullday Al-Muhajirin',
] as const;

// Pilihan isian dipakai bersama oleh form pendaftaran dan form edit admin.
export const REGISTRATION_TYPE_OPTIONS = ['Siswa Baru', 'Pindahan'] as const;
export const CLASS_CHOICE_OPTIONS = ['Reguler', 'Bilingual', 'Tahfizh'] as const;
export const GENDER_OPTIONS = ['Laki-laki', 'Perempuan'] as const;
export const YES_NO_OPTIONS = ['Ya', 'Tidak'] as const;
export const ACHIEVEMENT_LEVEL_OPTIONS = ['Sekolah', 'Kecamatan', 'Kabupaten/Kota', 'Provinsi', 'Nasional'] as const;
export const EDUCATION_OPTIONS = ['SD', 'SMP', 'SMA', 'D1-D3', 'S1', 'S2', 'S3'] as const;
export const FATHER_INCOME_OPTIONS = ['< 2 Juta', '2-5 Juta', '5-10 Juta', '> 10 Juta'] as const;
export const MOTHER_INCOME_OPTIONS = ['Tidak Berpenghasilan', ...FATHER_INCOME_OPTIONS] as const;

/** Tingkat kelas yang dapat dituju Pendaftar Pindahan. */
export const KELAS_TUJUAN_OPTIONS = ['2', '3', '4', '5', '6'] as const;

export const REFERRAL_TYPES = [
  'Guru/Karyawan SD Plus 3',
  'Kepala TK',
] as const;

export type ReferralType = (typeof REFERRAL_TYPES)[number];

const optionalUnit = z.string().trim().refine(
  (value) => value === '' || DIRECTORATE_2_UNITS.includes(value as (typeof DIRECTORATE_2_UNITS)[number]),
  'Unit Direktorat 2 tidak valid',
).optional();

export const step1BaseSchema = z.object({
  // Data Murid
  jenisPendaftaran: oneOf('Jenis pendaftaran wajib dipilih', REGISTRATION_TYPE_OPTIONS),
  pilihanKelas: oneOf('Pilihan kelas wajib dipilih', CLASS_CHOICE_OPTIONS),
  kelasTujuan: z.string().trim().optional(),
  namaLengkap: reqStr('Nama lengkap wajib diisi', 3),
  jenisKelamin: oneOf('Jenis kelamin wajib dipilih', GENDER_OPTIONS),
  tempatLahir: reqStr('Tempat lahir wajib diisi', 3, 100),
  tanggalLahir: z.iso.date({ message: 'Tanggal lahir tidak valid' }).refine(
    (value) => new Date(`${value}T00:00:00Z`) <= new Date(),
    'Tanggal lahir tidak boleh di masa depan',
  ),
  nik: z.string({ message: 'NIK wajib diisi' })
    .regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  nisn: z.string({ message: 'NISN wajib diisi' }).regex(/^\d{4,10}$/, 'NISN harus 4–10 digit angka'),
  bekerjaDiDirektorat2: oneOf('Wajib dipilih', YES_NO_OPTIONS),
  namaOrangtuaDirektorat2: optionalStr(255),
  unitOrangtuaDirektorat2: optionalUnit,
  saudaraDiDirektorat2: oneOf('Wajib dipilih', YES_NO_OPTIONS),
  namaSaudaraDirektorat2: optionalStr(255),
  unitSaudaraDirektorat2: optionalUnit,
  asalSekolah: reqStr('Asal sekolah wajib diisi', 2),
  prestasiAnak: optionalStr(1000),
  tingkatPrestasi: z.string().trim().refine(
    (value) => value === '' || (ACHIEVEMENT_LEVEL_OPTIONS as readonly string[]).includes(value),
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
  adaPengusul: oneOf('Wajib dipilih', YES_NO_OPTIONS),
  tipePengusul: z.string().trim().refine(
    (value) => value === '' || REFERRAL_TYPES.includes(value as ReferralType),
    'Kategori pengusul tidak valid',
  ).optional(),
  namaTkPengusul: optionalStr(255),
  namaPengusul: optionalStr(255),
  nomorWaPengusul: optionalStr(20),
});

function validateDirectorate2Details(
  data: z.infer<typeof step1BaseSchema>,
  ctx: z.RefinementCtx,
) {
  if (data.bekerjaDiDirektorat2 === 'Ya' && !data.namaOrangtuaDirektorat2?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Nama orang tua yang bekerja wajib diisi',
      path: ['namaOrangtuaDirektorat2'],
    });
  }
  if (data.bekerjaDiDirektorat2 === 'Ya' && !data.unitOrangtuaDirektorat2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Unit tempat bekerja wajib dipilih',
      path: ['unitOrangtuaDirektorat2'],
    });
  }
  if (data.saudaraDiDirektorat2 === 'Ya' && !data.namaSaudaraDirektorat2?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Nama saudara wajib diisi',
      path: ['namaSaudaraDirektorat2'],
    });
  }
  if (data.saudaraDiDirektorat2 === 'Ya' && !data.unitSaudaraDirektorat2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Unit sekolah saudara wajib dipilih',
      path: ['unitSaudaraDirektorat2'],
    });
  }
}

function validateTransferGrade(
  data: z.infer<typeof step1BaseSchema>,
  ctx: z.RefinementCtx,
) {
  if (data.jenisPendaftaran === 'Pindahan'
    && !KELAS_TUJUAN_OPTIONS.includes(data.kelasTujuan as (typeof KELAS_TUJUAN_OPTIONS)[number])) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Kelas tujuan wajib dipilih',
      path: ['kelasTujuan'],
    });
  }
}

function validateReferralDetails(
  data: z.infer<typeof step1BaseSchema>,
  ctx: z.RefinementCtx,
) {
  if (data.adaPengusul === 'Ya') {
    if (!data.tipePengusul || !REFERRAL_TYPES.includes(data.tipePengusul as ReferralType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Kategori pengusul wajib dipilih',
        path: ['tipePengusul'],
      });
    }
    if (data.tipePengusul === 'Kepala TK' && !data.namaTkPengusul?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nama TK pengusul wajib diisi',
        path: ['namaTkPengusul'],
      });
    }
    if (!data.namaPengusul?.trim() || data.namaPengusul.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nama lengkap pengusul wajib diisi',
        path: ['namaPengusul'],
      });
    }
    if (!data.nomorWaPengusul?.trim() || !/^(^\+62|62|^08)\d{8,12}$/.test(data.nomorWaPengusul.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nomor WhatsApp pengusul tidak valid',
        path: ['nomorWaPengusul'],
      });
    }
  }
}

export const step1Schema = step1BaseSchema
  .superRefine(validateDirectorate2Details)
  .superRefine(validateTransferGrade)
  .superRefine(validateReferralDetails);

export const step2Schema = z.object({
  // Data Ayah
  namaAyah: reqStr('Nama Ayah wajib diisi', 3),
  nikAyah: z.string({ message: 'NIK Ayah wajib diisi' })
    .regex(/^\d{16}$/, 'NIK Ayah harus 16 digit angka'),
  pendidikanAyah: oneOf('Pendidikan Ayah wajib dipilih', EDUCATION_OPTIONS),
  pekerjaanAyah: reqStr('Pekerjaan Ayah wajib diisi', 2, 100),
  penghasilanAyah: oneOf('Penghasilan Ayah wajib dipilih', FATHER_INCOME_OPTIONS),
  teleponAyah: z.string({ message: 'Nomor WhatsApp Ayah wajib diisi' })
    .regex(/^(^\+62|62|^08)\d{8,12}$/, 'Nomor telepon tidak valid'),
  alamatAyah: reqStr('Alamat Ayah wajib diisi', 5, 1000),

  // Data Ibu
  namaIbu: reqStr('Nama Ibu wajib diisi', 3),
  nikIbu: z.string({ message: 'NIK Ibu wajib diisi' })
    .regex(/^\d{16}$/, 'NIK Ibu harus 16 digit angka'),
  pendidikanIbu: oneOf('Pendidikan Ibu wajib dipilih', EDUCATION_OPTIONS),
  pekerjaanIbu: reqStr('Pekerjaan Ibu wajib diisi', 2, 100),
  penghasilanIbu: oneOf('Penghasilan Ibu wajib dipilih', MOTHER_INCOME_OPTIONS),
  teleponIbu: z.string({ message: 'Nomor WhatsApp Ibu wajib diisi' })
    .regex(/^(^\+62|62|^08)\d{8,12}$/, 'Nomor telepon tidak valid'),
  alamatIbu: reqStr('Alamat Ibu wajib diisi', 5, 1000),
});

export const formSchema = z.object({
  ...step1BaseSchema.shape,
  ...step2Schema.shape,
})
  .superRefine(validateDirectorate2Details)
  .superRefine(validateTransferGrade)
  .superRefine(validateReferralDetails);

export type FormData = z.infer<typeof formSchema>;
