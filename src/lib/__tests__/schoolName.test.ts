import { describe, expect, it } from 'vitest';
import { formatSchoolName } from '../schoolName';

describe('formatSchoolName', () => {
  it.each([
    ['tK mELATI', 'TK Melati'],
    ['TK PLUS ROUDHOH PURWAKARTA', 'TK Plus Roudhoh Purwakarta'],
    ['tk islam terpadu al - muhajirin.', 'TK Islam Terpadu Al-Muhajirin'],
    ['tkit an-nur', 'TKIT An-Nur'],
    ['Tk.Pertiwi  ', 'TK Pertiwi'],
    ['paud melati dan mawar', 'PAUD Melati dan Mawar'],
    ['ra al-ikhlas', 'RA Al-Ikhlas'],
    ['tk aba 3 purwakarta', 'TK ABA 3 Purwakarta'],
    ['sdn 2 cibatu', 'SDN 2 Cibatu'],
    ['TK Negeri Pembina ii', 'TK Negeri Pembina II'],
    ['kb pkk anggrek', 'KB PKK Anggrek'],
  ])('%s -> %s', (input, expected) => {
    expect(formatSchoolName(input)).toBe(expected);
  });
});
