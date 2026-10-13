import {
  ACHIEVEMENT_LEVEL_OPTIONS,
  CLASS_CHOICE_OPTIONS,
  DIRECTORATE_2_UNITS,
  EDUCATION_OPTIONS,
  FATHER_INCOME_OPTIONS,
  GENDER_OPTIONS,
  KELAS_TUJUAN_OPTIONS,
  MOTHER_INCOME_OPTIONS,
  REFERRAL_TYPES,
  REGISTRATION_TYPE_OPTIONS,
  YES_NO_OPTIONS,
  type FormData as RegistrationData,
} from '@/features/registration/schema';

export type EditGroup = 'identity' | 'registration' | 'school' | 'address' | 'father' | 'mother' | 'affiliation' | 'referral';
export type FormKey = keyof RegistrationData;
export type EditValues = Partial<Record<FormKey, string>>;

type Option = { value: string; label: string };
export type EditField = {
  key: FormKey;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'digits' | 'select';
  options?: readonly Option[];
  maxLength?: number;
  /** Shown only when this returns true for the current form values. */
  showIf?: (values: EditValues) => boolean;
};

const options = (values: readonly string[], format: (value: string) => string = (value) => value): Option[] =>
  values.map((value) => ({ value, label: format(value) }));

const isPindahan = (values: EditValues) => values.jenisPendaftaran === 'Pindahan';
const parentWorks = (values: EditValues) => values.bekerjaDiDirektorat2 === 'Ya';
const siblingStudies = (values: EditValues) => values.saudaraDiDirektorat2 === 'Ya';
const hasReferrer = (values: EditValues) => values.adaPengusul === 'Ya';

/** Fields per detail group, mirroring the registration form so the same schema validates both. */
export const EDIT_FIELDS: Record<EditGroup, EditField[]> = {
  identity: [
    { key: 'namaLengkap', label: 'Nama lengkap', type: 'text', maxLength: 255 },
    { key: 'jenisKelamin', label: 'Jenis kelamin', type: 'select', options: options(GENDER_OPTIONS) },
    { key: 'tempatLahir', label: 'Tempat lahir', type: 'text', maxLength: 100 },
    { key: 'tanggalLahir', label: 'Tanggal lahir', type: 'date' },
    { key: 'nik', label: 'NIK', type: 'digits', maxLength: 16 },
    { key: 'nisn', label: 'NISN', type: 'digits', maxLength: 10 },
  ],
  registration: [
    { key: 'jenisPendaftaran', label: 'Jenis pendaftaran', type: 'select', options: options(REGISTRATION_TYPE_OPTIONS) },
    { key: 'pilihanKelas', label: 'Pilihan kelas', type: 'select', options: options(CLASS_CHOICE_OPTIONS) },
    { key: 'kelasTujuan', label: 'Kelas tujuan', type: 'select', options: options(KELAS_TUJUAN_OPTIONS, (value) => `Kelas ${value}`), showIf: isPindahan },
  ],
  school: [
    { key: 'asalSekolah', label: 'Asal sekolah', type: 'text', maxLength: 255 },
    { key: 'prestasiAnak', label: 'Prestasi anak', type: 'textarea', maxLength: 1000 },
    { key: 'tingkatPrestasi', label: 'Tingkat prestasi', type: 'select', options: [{ value: '', label: 'Tidak ada' }, ...options(ACHIEVEMENT_LEVEL_OPTIONS)] },
    { key: 'jarakKeSekolah', label: 'Jarak ke sekolah', type: 'text', maxLength: 20 },
  ],
  address: [
    { key: 'alamatJalan', label: 'Alamat jalan', type: 'textarea', maxLength: 1000 },
    { key: 'rt', label: 'RT', type: 'digits', maxLength: 3 },
    { key: 'rw', label: 'RW', type: 'digits', maxLength: 3 },
    // provinsi/kota/kecamatan/kelurahan are edited with the cascading region selects.
  ],
  father: [
    { key: 'namaAyah', label: 'Nama ayah', type: 'text', maxLength: 255 },
    { key: 'nikAyah', label: 'NIK ayah', type: 'digits', maxLength: 16 },
    { key: 'pendidikanAyah', label: 'Pendidikan', type: 'select', options: options(EDUCATION_OPTIONS) },
    { key: 'pekerjaanAyah', label: 'Pekerjaan', type: 'text', maxLength: 100 },
    { key: 'penghasilanAyah', label: 'Penghasilan', type: 'select', options: options(FATHER_INCOME_OPTIONS) },
    { key: 'teleponAyah', label: 'Nomor WhatsApp', type: 'digits', maxLength: 15 },
    { key: 'alamatAyah', label: 'Alamat', type: 'textarea', maxLength: 1000 },
  ],
  mother: [
    { key: 'namaIbu', label: 'Nama ibu', type: 'text', maxLength: 255 },
    { key: 'nikIbu', label: 'NIK ibu', type: 'digits', maxLength: 16 },
    { key: 'pendidikanIbu', label: 'Pendidikan', type: 'select', options: options(EDUCATION_OPTIONS) },
    { key: 'pekerjaanIbu', label: 'Pekerjaan', type: 'text', maxLength: 100 },
    { key: 'penghasilanIbu', label: 'Penghasilan', type: 'select', options: options(MOTHER_INCOME_OPTIONS) },
    { key: 'teleponIbu', label: 'Nomor WhatsApp', type: 'digits', maxLength: 15 },
    { key: 'alamatIbu', label: 'Alamat', type: 'textarea', maxLength: 1000 },
  ],
  affiliation: [
    { key: 'bekerjaDiDirektorat2', label: 'Orang tua bekerja di Direktorat 2', type: 'select', options: options(YES_NO_OPTIONS) },
    { key: 'namaOrangtuaDirektorat2', label: 'Nama orang tua', type: 'text', maxLength: 255, showIf: parentWorks },
    { key: 'unitOrangtuaDirektorat2', label: 'Unit orang tua', type: 'select', options: options(DIRECTORATE_2_UNITS), showIf: parentWorks },
    { key: 'saudaraDiDirektorat2', label: 'Memiliki saudara di Direktorat 2', type: 'select', options: options(YES_NO_OPTIONS) },
    { key: 'namaSaudaraDirektorat2', label: 'Nama saudara', type: 'text', maxLength: 255, showIf: siblingStudies },
    { key: 'unitSaudaraDirektorat2', label: 'Unit saudara', type: 'select', options: options(DIRECTORATE_2_UNITS), showIf: siblingStudies },
  ],
  referral: [
    { key: 'adaPengusul', label: 'Rujukan dari seseorang', type: 'select', options: options(YES_NO_OPTIONS) },
    { key: 'tipePengusul', label: 'Kategori pengusul', type: 'select', options: options(REFERRAL_TYPES), showIf: hasReferrer },
    { key: 'namaTkPengusul', label: 'Nama TK pengusul', type: 'text', maxLength: 255, showIf: (values) => hasReferrer(values) && values.tipePengusul === 'Kepala TK' },
    { key: 'namaPengusul', label: 'Nama lengkap pengusul', type: 'text', maxLength: 255, showIf: hasReferrer },
    { key: 'nomorWaPengusul', label: 'Nomor WhatsApp pengusul', type: 'digits', maxLength: 15, showIf: hasReferrer },
  ],
};

export const REGION_KEYS = ['provinsi', 'kota', 'kecamatan', 'kelurahan'] as const satisfies readonly FormKey[];

/** Every form key an edit of this group may change. */
export function groupKeys(group: EditGroup): FormKey[] {
  const keys = EDIT_FIELDS[group].map(({ key }) => key);
  return group === 'address' ? [...keys, ...REGION_KEYS] : keys;
}

export function isEditGroup(value: string): value is EditGroup {
  return Object.prototype.hasOwnProperty.call(EDIT_FIELDS, value);
}

/** Database columns written by each group, as produced by `toPendaftarRow`. */
export const GROUP_COLUMNS: Record<EditGroup, string[]> = {
  identity: ['nama_lengkap', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'nik', 'nisn'],
  registration: ['jenis_pendaftaran', 'pilihan_kelas', 'kelas_tujuan'],
  school: ['asal_sekolah', 'prestasi_anak', 'tingkat_prestasi', 'jarak_ke_sekolah'],
  address: ['alamat_jalan', 'rt', 'rw', 'kelurahan', 'kecamatan', 'kota', 'provinsi', 'alamat_rumah'],
  father: ['nama_ayah', 'nik_ayah', 'pendidikan_ayah', 'pekerjaan_ayah', 'penghasilan_ayah', 'telepon_ayah', 'no_telp', 'alamat_ayah'],
  mother: ['nama_ibu', 'nik_ibu', 'pendidikan_ibu', 'pekerjaan_ibu', 'penghasilan_ibu', 'telepon_ibu', 'alamat_ibu'],
  affiliation: ['bekerja_di_direktorat2', 'nama_orangtua_direktorat2', 'unit_orangtua_direktorat2', 'saudara_di_direktorat2', 'nama_saudara_direktorat2', 'unit_saudara_direktorat2'],
  referral: ['ada_pengusul', 'tipe_pengusul', 'nama_tk_pengusul', 'nama_pengusul', 'nomor_wa_pengusul'],
};

const COLUMN_BY_KEY: Record<FormKey, string> = {
  jenisPendaftaran: 'jenis_pendaftaran', pilihanKelas: 'pilihan_kelas', kelasTujuan: 'kelas_tujuan',
  namaLengkap: 'nama_lengkap', jenisKelamin: 'jenis_kelamin', tempatLahir: 'tempat_lahir', tanggalLahir: 'tanggal_lahir', nik: 'nik', nisn: 'nisn',
  bekerjaDiDirektorat2: 'bekerja_di_direktorat2', namaOrangtuaDirektorat2: 'nama_orangtua_direktorat2', unitOrangtuaDirektorat2: 'unit_orangtua_direktorat2',
  saudaraDiDirektorat2: 'saudara_di_direktorat2', namaSaudaraDirektorat2: 'nama_saudara_direktorat2', unitSaudaraDirektorat2: 'unit_saudara_direktorat2',
  asalSekolah: 'asal_sekolah', prestasiAnak: 'prestasi_anak', tingkatPrestasi: 'tingkat_prestasi', jarakKeSekolah: 'jarak_ke_sekolah',
  alamatJalan: 'alamat_jalan', rt: 'rt', rw: 'rw', kelurahan: 'kelurahan', kecamatan: 'kecamatan', kota: 'kota', provinsi: 'provinsi',
  adaPengusul: 'ada_pengusul', tipePengusul: 'tipe_pengusul', namaTkPengusul: 'nama_tk_pengusul', namaPengusul: 'nama_pengusul', nomorWaPengusul: 'nomor_wa_pengusul',
  namaAyah: 'nama_ayah', nikAyah: 'nik_ayah', pendidikanAyah: 'pendidikan_ayah', pekerjaanAyah: 'pekerjaan_ayah', penghasilanAyah: 'penghasilan_ayah', teleponAyah: 'telepon_ayah', alamatAyah: 'alamat_ayah',
  namaIbu: 'nama_ibu', nikIbu: 'nik_ibu', pendidikanIbu: 'pendidikan_ibu', pekerjaanIbu: 'pekerjaan_ibu', penghasilanIbu: 'penghasilan_ibu', teleponIbu: 'telepon_ibu', alamatIbu: 'alamat_ibu',
};

export const EDIT_SOURCE_COLUMNS = [...new Set(Object.values(COLUMN_BY_KEY))].join(',');

/** Rebuilds registration-form values from a stored row (the inverse of `toPendaftarRow`). */
export function fromPendaftarRow(row: Record<string, unknown>): Record<FormKey, string> {
  return Object.fromEntries(
    (Object.entries(COLUMN_BY_KEY) as Array<[FormKey, string]>).map(([key, column]) => {
      const value = row[column];
      if (value == null) return [key, key === 'bekerjaDiDirektorat2' || key === 'saudaraDiDirektorat2' || key === 'adaPengusul' ? 'Tidak' : ''];
      return [key, String(value)];
    }),
  ) as Record<FormKey, string>;
}
