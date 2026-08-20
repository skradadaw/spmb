export type FeeItem = {
  label: string;
  takhossus: string;
  regular: string;
  detail?: string;
};

export type Installment = {
  stage: string;
  timing: string;
  percentage: string;
  takhossus: string;
  regular: string;
};

export type DiscountGroup = {
  percentage: string;
  criteria: readonly string[];
};

export const registrationInfo = {
  academicYear: '2027/2028',
  wave: {
    name: 'Gelombang 1',
    period: '1 September–10 Oktober 2026',
    testDate: '20 Oktober 2026',
  },
  okb: {
    fee: 'Rp370.000',
    bank: 'Bank Muamalat',
    accountNumber: '1060017434',
  },
  classPrograms: {
    takhossus: 'Program bilingual dan tahfidz',
    regular: 'Program pembelajaran reguler',
  },
  fees: [
    { label: 'Infak rutin bulanan', takhossus: 'Rp620.000', regular: 'Rp620.000' },
    { label: 'Kelas Takhossus bulanan', takhossus: 'Rp100.000', regular: '—' },
    { label: 'Sarana dan prasarana', takhossus: 'Rp2.500.000', regular: 'Rp2.500.000' },
    { label: 'Kegiatan kesiswaan', takhossus: 'Rp2.050.000', regular: 'Rp2.050.000' },
    { label: 'Buku Lail, Kalender, dan Terbitan Muhajirin', takhossus: 'Rp250.000', regular: 'Rp250.000' },
    {
      label: 'Seragam sekolah dan atribut',
      takhossus: 'Rp1.550.000',
      regular: 'Rp1.550.000',
      detail: 'Pramuka, merah putih, kotak-kotak, batik biru, pangsi/celana sarung (putra), kebaya (putri), olahraga, topi dua buah, dasi, tiga pasang kaos kaki, kerudung/peci dan sarung, kacu, ring, serta badge.',
    },
    { label: 'Uang bangunan', takhossus: 'Rp3.500.000', regular: 'Rp3.500.000' },
    { label: 'Infak masjid', takhossus: 'Rp100.000', regular: 'Rp100.000' },
  ] satisfies FeeItem[],
  totals: {
    takhossus: 'Rp10.670.000',
    regular: 'Rp10.570.000',
  },
  installments: [
    { stage: 'I', timing: '1 minggu setelah dinyatakan lulus', percentage: '30%', takhossus: 'Rp3.201.000', regular: 'Rp3.171.000' },
    { stage: 'II', timing: '1 bulan setelah pembayaran pertama', percentage: '40%', takhossus: 'Rp4.268.000', regular: 'Rp4.228.000' },
    { stage: 'III', timing: 'Pembayaran sebelum masuk', percentage: '30%', takhossus: 'Rp3.201.000', regular: 'Rp3.171.000' },
  ] satisfies Installment[],
  discounts: [
    { percentage: '10%', criteria: ['Prestasi tingkat kabupaten', 'Adik/kakak satu jenjang Yayasan Al-Muhajirin', 'Pelunasan sesuai bulan Tes OKB'] },
    { percentage: '30%', criteria: ['Alumni Al-Muhajirin', 'Prestasi tingkat provinsi'] },
    { percentage: '50%', criteria: ['Prestasi tingkat nasional'] },
  ] satisfies DiscountGroup[],
  requirements: [
    'Fotokopi akta lahir',
    'Fotokopi kartu keluarga',
    'Nomor NISN',
    'Pas foto ukuran 3×4',
  ],
  registrationNote: 'Biaya rincian registrasi belum termasuk buku paket.',
} as const;
