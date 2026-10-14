import type { ClassOption } from '@/features/registration/classCapacity';
import { REGISTRATION_CAPACITY } from '@/lib/registrationConfig';

export const registrationInfo = {
  academicYear: '2027/2028',
  wave: {
    name: 'Gelombang 1',
    period: '1 Oktober – 17 November 2026',
  },
  okb: {
    date: '21 November 2026',
    fee: 'Rp375.000',
    bank: 'Bank Muamalat',
    accountNumber: '1060017434',
    accountName: 'SD Plus 3 Al-Muhajirin',
  },
  capacity: REGISTRATION_CAPACITY,
  feeDocument: '/rincian-biaya-2027-2028.pdf',
  berkas: ['Akta Kelahiran', 'Kartu Keluarga', 'Pas Foto', 'Bukti Pembayaran OKB'],
} as const;

export const registrationFlow = [
  {
    title: 'Bayar biaya OKB',
    description: `Transfer ${registrationInfo.okb.fee} ke rekening resmi sekolah, lalu simpan bukti pembayarannya.`,
  },
  {
    title: 'Isi formulir dan unggah Berkas',
    description:
      'Lengkapi data anak dan orang tua, lalu unggah keempat Berkas. Bukti Pendaftaran langsung bisa diunduh.',
  },
  {
    title: 'Verifikasi Berkas',
    description:
      'Admin memeriksa setiap Berkas dan menghubungi Ayah dan Bunda bila ada yang perlu diganti.',
  },
  {
    title: 'Ikuti OKB',
    description:
      'Datang sesuai Jadwal OKB yang ditetapkan Admin dengan membawa Bukti Pendaftaran.',
  },
  {
    title: 'Keputusan Penerimaan',
    description: 'Hasil diumumkan di website dan diinformasikan panitia melalui WhatsApp.',
  },
] as const;

export const schoolProfile = {
  accreditation: 'A',
  summary:
    'Sekolah dasar Islam terakreditasi A yang memadukan kurikulum nasional dengan pembelajaran berbasis kepesantrenan. Lewat kelas Reguler, Bilingual, dan Tahfizh, Ananda tumbuh berakhlak mulia, dekat dengan Al-Qur’an, dan siap melangkah ke jenjang berikutnya.',
} as const;

export const classProgramDescriptions: Record<ClassOption, string> = {
  Reguler:
    'Kurikulum nasional dipadukan dengan pendidikan Islam, meliputi pembiasaan ibadah, akhlak, dan pengenalan kitab.',
  Bilingual:
    'Penguatan bahasa Inggris dalam pembelajaran untuk membekali anak berwawasan global.',
  Tahfizh:
    'Menghafal Al-Qur’an sejak dini dengan bimbingan guru, termasuk kegiatan Tahfizh Camp.',
};

export const classHighlights: Record<ClassOption, readonly string[]> = {
  Reguler: ['Target hafal Juz 30', 'Membaca Al-Qur’an dengan tartil', 'Dasar Bahasa Arab dan Inggris'],
  Bilingual: ['Belajar bersama native speaker', 'English Camp', 'Grand Outing Class'],
  Tahfizh: ['Target hafalan 4–5 Juz', 'Tahfizh Camp', 'Grand Outing Class'],
};

/** Programs every Pilihan Kelas shares. */
export const schoolHighlights = [
  'Hafal doa harian, surat pilihan, dan 20 hadits',
  'Pembelajaran berbasis kepesantrenan',
  'Pembiasaan shalat dan adab salam',
  'Dasar teknologi informasi',
  'Pengembangan bakat seni, olahraga, dan ekskul',
  'Lingkungan Islami, pendidik profesional',
] as const;

export const contactInfo = {
  whatsappLabel: '0819-9831-1470',
  whatsappUrl: 'https://wa.me/6281998311470',
  serviceDays: 'Senin–Sabtu',
  serviceHours: '07.00–17.00',
  address: 'Jl. Ipik Gandamanah No. 33, Ciseureuh, Purwakarta, Jawa Barat',
  mapsUrl:
    'https://www.google.com/maps/place/SD+Plus+3+Al-Muhajirin+Purwakarta/@-6.5214189,107.4600823,17z',
} as const;

/** Section links shared by the header, the mobile menu and the footer. */
export const navigationItems = [
  ['Jadwal', '#jadwal'],
  ['Alur', '#alur'],
  ['Kelas', '#kelas'],
  ['Biaya dan Berkas', '#persiapan'],
  ['FAQ', '#faq'],
] as const;

export const socialLinks = [
  { platform: 'Instagram', url: 'https://www.instagram.com/sdplus3almuhajirin' },
  { platform: 'Facebook', url: 'https://www.facebook.com/SDPlus3AlMuhajirin' },
  { platform: 'TikTok', url: 'https://www.tiktok.com/@sdplus3almuhajirin' },
] as const;

export const faqs = [
  {
    question: 'Berapa biaya OKB dan ke mana membayarnya?',
    answer: `Biaya OKB ${registrationInfo.okb.fee}, ditransfer ke rekening ${registrationInfo.okb.bank} ${registrationInfo.okb.accountNumber} atas nama ${registrationInfo.okb.accountName}. Simpan bukti pembayarannya untuk diunggah sebagai Berkas.`,
  },
  {
    question: 'Kelas apa saja yang bisa dipilih, dan bagaimana kalau kelasnya penuh?',
    answer:
      'Tersedia Pilihan Kelas Reguler, Bilingual, dan Tahfizh. Pilihan Kelas yang kuotanya penuh tidak dapat dipilih di formulir. Lihat statusnya di bagian Pilihan Kelas.',
  },
  {
    question: 'Apakah kelas yang ditempatkan pasti sama dengan pilihan?',
    answer:
      'Tidak selalu. Panitia menetapkan Kelas Penempatan setelah OKB, sehingga dapat berbeda dari Pilihan Kelas.',
  },
  {
    question: 'Bagaimana jika Berkas yang diunggah salah?',
    answer:
      'Hubungi panitia melalui WhatsApp. Admin akan mengunggah Berkas Pengganti yang benar.',
  },
  {
    question: 'Bukti Pendaftaran hilang, bagaimana?',
    answer:
      'Hubungi panitia dengan menyebutkan nama anak atau Nomor Pendaftaran. Admin akan mengunduhkan Bukti Pendaftaran kembali.',
  },
  {
    question: 'Berhalangan hadir OKB, bagaimana?',
    answer:
      'Segera kabari panitia melalui WhatsApp. OKB dapat dijadwalkan ulang ke tanggal lain.',
  },
] as const;
