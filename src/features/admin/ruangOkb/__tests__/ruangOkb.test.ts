import { describe, expect, it } from 'vitest';
import { ruangOkbKey, sortRuangOkb } from '../ruangOkb';

describe('Ruang OKB', () => {
  it('treats names differing only in letter case or spacing as the same room', () => {
    expect(ruangOkbKey('  kelas  1a ')).toBe(ruangOkbKey('Kelas 1A'));
    expect(ruangOkbKey('Kelas 1B')).not.toBe(ruangOkbKey('Kelas 1A'));
  });

  it('sorts rooms by name with numbers in numeric order, ignoring letter case', () => {
    const rooms = [{ id: '3', nama: 'Kelas 10' }, { id: '1', nama: 'lab Komputer' }, { id: '2', nama: 'Kelas 2' }, { id: '4', nama: 'Aula' }];

    expect(sortRuangOkb(rooms).map(room => room.nama)).toEqual(['Aula', 'Kelas 2', 'Kelas 10', 'lab Komputer']);
  });
});
