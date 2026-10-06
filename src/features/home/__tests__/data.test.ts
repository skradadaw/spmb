import { describe, expect, it } from 'vitest';
import { registrationInfo } from '@/features/home/data';

describe('Open Booking landing data', () => {
  it('contains the approved wave, OKB, capacity, and PDF data', () => {
    expect(registrationInfo).toMatchObject({
      academicYear: '2027/2028',
      wave: {
        name: 'Gelombang 1',
      },
      okb: {
        fee: 'Rp375.000',
        bank: 'Bank Muamalat',
        accountNumber: '1060017434',
      },
      capacity: 112,
      feeDocument: '/rincian-biaya-2027-2028.pdf',
    });
  });

  it('contains every preparation requirement', () => {
    expect(registrationInfo.requirements).toEqual([
      'Fotokopi akta lahir',
      'Fotokopi kartu keluarga',
      'Nomor NISN',
      'Pas foto ukuran 3×4',
    ]);
  });
});
