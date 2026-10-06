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
