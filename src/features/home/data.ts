import { REGISTRATION_CAPACITY } from '@/lib/registrationConfig';

export const registrationInfo = {
  academicYear: '2027/2028',
  wave: {
    name: 'Gelombang 1',
  },
  okb: {
    fee: 'Rp375.000',
    bank: 'Bank Muamalat',
    accountNumber: '1060017434',
  },
  capacity: REGISTRATION_CAPACITY,
  feeDocument: '/rincian-biaya-2027-2028.pdf',
  requirements: [
    'Fotokopi akta lahir',
    'Fotokopi kartu keluarga',
    'Nomor NISN',
    'Pas foto ukuran 3×4',
  ],
} as const;

export const registrationFlow = [
  {
    title: 'Bayar biaya OKB',
    description: `Transfer ${registrationInfo.okb.fee} ke rekening resmi sekolah, lalu simpan bukti pembayarannya.`,
  },
  {
    title: 'Isi formulir & unggah Berkas',
    description:
      'Lengkapi data anak dan orang tua, lalu unggah keempat Berkas. Bukti Pendaftaran langsung bisa diunduh.',
  },
  {
    title: 'Verifikasi Berkas',
    description:
      'Panitia memeriksa setiap Berkas dan menghubungi Ayah/Bunda bila ada yang perlu diganti.',
  },
  {
    title: 'Ikuti OKB',
    description:
      'Datang sesuai Jadwal OKB dari panitia dengan membawa Bukti Pendaftaran.',
  },
  {
    title: 'Keputusan Penerimaan',
    description: 'Hasil diumumkan di website dan diinformasikan panitia melalui WhatsApp.',
  },
] as const;

export const schoolProfile = {
  accreditation: 'A',
} as const;

export const classPrograms = [
  {
    pilihanKelas: 'Reguler',
    description:
      'Kurikulum nasional dipadukan dengan pendidikan Islam: pembiasaan ibadah, akhlak, dan pengenalan kitab.',
  },
  {
    pilihanKelas: 'Bilingual',
    description:
      'Penguatan bahasa Inggris dalam pembelajaran untuk membekali anak berwawasan global.',
  },
  {
    pilihanKelas: 'Tahfizh',
    description:
      'Menghafal Al-Qur’an sejak dini dengan bimbingan guru, termasuk kegiatan Tahfizh Camp.',
  },
] as const;
