import { describe, expect, it } from 'vitest';
import { formatAddress, formatHomeAddress, formatRegionName } from '../address';

describe('formatAddress', () => {
  it.each([
    ['JL. MERDEKA NO.12 RT 003/RW 005', 'Jl. Merdeka No. 12 RT 003/RW 005'],
    ['jl.melati gg.mawar no 5', 'Jl. Melati Gg. Mawar No. 5'],
    ['jln raya sadang no 12a rt 1 rw 2', 'Jl. Raya Sadang No. 12A RT 1/RW 2'],
    ['kp. cibodas rt.02 rw.03', 'Kp. Cibodas RT 02/RW 03'],
    ['Perum griya asri blok c2 no.10', 'Perum Griya Asri Blok C2 No. 10'],
    ['Gg. mawar ii , dekat masjid.', 'Gg. Mawar II, Dekat Masjid'],
  ])('tidies %s', (input, expected) => expect(formatAddress(input)).toBe(expected));

  it('does not split words that merely end in an abbreviation', () => {
    expect(formatAddress('kampung bano.5')).toBe('Kampung Bano.5');
  });
});

describe('formatRegionName', () => {
  it.each([
    ['DKI JAKARTA', 'DKI Jakarta'],
    ['DI YOGYAKARTA', 'DI Yogyakarta'],
    ['KABUPATEN PURWAKARTA', 'Kabupaten Purwakarta'],
    ['KOTA ADM. JAKARTA PUSAT', 'Kota Adm. Jakarta Pusat'],
  ])('writes %s as %s', (input, expected) => expect(formatRegionName(input)).toBe(expected));
});

describe('formatHomeAddress', () => {
  it('builds one line without repeating the region kind', () => {
    expect(formatHomeAddress({ alamatJalan: 'jl melati no.5', rt: '2', rw: '003', kelurahan: 'CIBODAS', kecamatan: 'MANIIS', kota: 'KABUPATEN PURWAKARTA', provinsi: 'JAWA BARAT' }))
      .toBe('Jl. Melati No. 5, RT 02/RW 03, Kel. Cibodas, Kec. Maniis, Kabupaten Purwakarta, Jawa Barat');
  });
  it('skips missing parts', () => {
    expect(formatHomeAddress({ alamatJalan: 'Jl. Melati', kota: 'KOTA BANDUNG' })).toBe('Jl. Melati, Kota Bandung');
    expect(formatHomeAddress({})).toBe('');
  });
});
