import { describe, expect, it } from 'vitest';
import { registrationInfo } from '@/features/home/data';

const rupiahToNumber = (value: string) =>
  Number(value.replace(/[^0-9]/g, ''));

const expectedFees = [
  { label: 'Infak rutin bulanan', takhossus: 'Rp620.000', regular: 'Rp620.000' },
  { label: 'Kelas Takhossus bulanan', takhossus: 'Rp100.000', regular: '—' },
  { label: 'Sarana dan prasarana', takhossus: 'Rp2.500.000', regular: 'Rp2.500.000' },
  { label: 'Kegiatan kesiswaan', takhossus: 'Rp2.050.000', regular: 'Rp2.050.000' },
  {
    label: 'Buku Lail, Kalender, dan Terbitan Muhajirin',
    takhossus: 'Rp250.000',
    regular: 'Rp250.000',
  },
  {
    label: 'Seragam sekolah dan atribut',
    takhossus: 'Rp1.550.000',
    regular: 'Rp1.550.000',
    detail:
      'Pramuka, merah putih, kotak-kotak, batik biru, pangsi/celana sarung (putra), kebaya (putri), olahraga, topi dua buah, dasi, tiga pasang kaos kaki, kerudung/peci dan sarung, kacu, ring, serta badge.',
  },
  { label: 'Uang bangunan', takhossus: 'Rp3.500.000', regular: 'Rp3.500.000' },
  { label: 'Infak masjid', takhossus: 'Rp100.000', regular: 'Rp100.000' },
] as const;

const expectedInstallments = [
  {
    stage: 'I',
    timing: '1 minggu setelah dinyatakan lulus',
    percentage: '30%',
    takhossus: 'Rp3.201.000',
    regular: 'Rp3.171.000',
  },
  {
    stage: 'II',
    timing: '1 bulan setelah pembayaran pertama',
    percentage: '40%',
    takhossus: 'Rp4.268.000',
    regular: 'Rp4.228.000',
  },
  {
    stage: 'III',
    timing: 'Pembayaran sebelum masuk',
    percentage: '30%',
    takhossus: 'Rp3.201.000',
    regular: 'Rp3.171.000',
  },
] as const;

const expectedDiscounts = [
  {
    percentage: '10%',
    criteria: [
      'Prestasi tingkat kabupaten',
      'Adik/kakak satu jenjang Yayasan Al-Muhajirin',
      'Pelunasan sesuai bulan Tes OKB',
    ],
  },
  {
    percentage: '30%',
    criteria: ['Alumni Al-Muhajirin', 'Prestasi tingkat provinsi'],
  },
  {
    percentage: '50%',
    criteria: ['Prestasi tingkat nasional'],
  },
] as const;

describe('registrationInfo', () => {
  it('contains the approved wave, OKB, and account data', () => {
    expect(registrationInfo.academicYear).toBe('2027/2028');
    expect(registrationInfo.wave.period).toBe('1 September–10 Oktober 2026');
    expect(registrationInfo.wave.testDate).toBe('20 Oktober 2026');
    expect(registrationInfo.okb.fee).toBe('Rp370.000');
    expect(registrationInfo.okb.bank).toBe('Bank Muamalat');
    expect(registrationInfo.okb.accountNumber).toBe('1060017434');
  });

  it('keeps installment totals equal to each class total', () => {
    const takhossus = registrationInfo.installments.reduce(
      (sum, item) => sum + rupiahToNumber(item.takhossus),
      0,
    );
    const regular = registrationInfo.installments.reduce(
      (sum, item) => sum + rupiahToNumber(item.regular),
      0,
    );

    expect(takhossus).toBe(rupiahToNumber(registrationInfo.totals.takhossus));
    expect(regular).toBe(rupiahToNumber(registrationInfo.totals.regular));
  });

  it.each(expectedFees.map((fee, index) => ({ fee, index })))(
    'keeps fee row $fee.label exact',
    ({ fee, index }) => {
      expect(registrationInfo.fees[index]).toEqual(fee);
    },
  );

  it('contains exactly the approved fee rows and totals', () => {
    expect(registrationInfo.fees).toHaveLength(expectedFees.length);
    expect(registrationInfo.totals).toEqual({
      takhossus: 'Rp10.670.000',
      regular: 'Rp10.570.000',
    });
  });

  it.each(expectedInstallments.map((installment, index) => ({ installment, index })))(
    'keeps installment stage $installment.stage exact',
    ({ installment, index }) => {
      expect(registrationInfo.installments[index]).toEqual(installment);
    },
  );

  it('contains exactly the approved installments', () => {
    expect(registrationInfo.installments).toHaveLength(expectedInstallments.length);
  });

  it.each(expectedDiscounts.map((discount, index) => ({ discount, index })))(
    'keeps discount tier $discount.percentage and every criterion exact',
    ({ discount, index }) => {
      expect(registrationInfo.discounts[index]).toEqual(discount);
    },
  );

  it('contains exactly the approved discounts', () => {
    expect(registrationInfo.discounts).toHaveLength(expectedDiscounts.length);
  });

  it('contains both exact class descriptions', () => {
    expect(registrationInfo.classPrograms).toEqual({
      takhossus: 'Program bilingual dan tahfidz',
      regular: 'Program pembelajaran reguler',
    });
  });

  it('contains every exact requirement and the registration note', () => {
    expect(registrationInfo.requirements).toEqual([
      'Fotokopi akta lahir',
      'Fotokopi kartu keluarga',
      'Nomor NISN',
      'Pas foto ukuran 3×4',
    ]);
    expect(registrationInfo.registrationNote).toBe(
      'Biaya rincian registrasi belum termasuk buku paket.',
    );
  });
});
