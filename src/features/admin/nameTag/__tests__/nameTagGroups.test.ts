import { describe, expect, it } from 'vitest';
import { buildNameTagView, nameTagHref, summarizeRuangOkb, type NameTagRow } from '../nameTagGroups';

const row = (id: string, namaLengkap: string, tanggal: string, gelombang: 1 | 2 | 3, ruangOkb: string | null = null): NameTagRow => ({ id, namaLengkap, ruangOkb, tanggal, gelombang });

const rows = [
  row('a', 'Zahra', '2026-11-20', 2, 'Ruang B'),
  row('b', 'Aisyah', '2026-11-20', 1, 'Ruang 10'),
  row('c', 'bilal', '2026-11-20', 1),
  row('d', 'AHMAD', '2026-11-20', 1, 'Ruang 2'),
  row('e', 'Citra', '2026-11-10', 3, 'Ruang 2'),
];

describe('buildNameTagView', () => {
  it('lists each date and Gelombang that has Pendaftar, nearest first, with its count', () => {
    expect(buildNameTagView(rows, {}).groups).toEqual([
      { tanggal: '2026-11-10', gelombang: 3, count: 1 },
      { tanggal: '2026-11-20', gelombang: 1, count: 3 },
      { tanggal: '2026-11-20', gelombang: 2, count: 1 },
    ]);
  });

  it('shows only the Pendaftar of the chosen group, sorted by name whatever the case', () => {
    const view = buildNameTagView(rows, { tanggal: '2026-11-20', gelombang: '1' });

    expect(view.selected).toEqual({ tanggal: '2026-11-20', gelombang: 1 });
    expect(view.members).toEqual([
      { id: 'd', namaLengkap: 'AHMAD', ruangOkb: 'Ruang 2' },
      { id: 'b', namaLengkap: 'Aisyah', ruangOkb: 'Ruang 10' },
      { id: 'c', namaLengkap: 'bilal', ruangOkb: null },
    ]);
  });

  it('opens the nearest group when nothing is chosen', () => {
    const view = buildNameTagView(rows, {});

    expect(view.selected).toEqual({ tanggal: '2026-11-10', gelombang: 3 });
    expect(view.members.map(member => member.id)).toEqual(['e']);
  });

  it('opens the first Gelombang of a chosen date when that date has no such Gelombang', () => {
    expect(buildNameTagView(rows, { tanggal: '2026-11-20' }).selected).toEqual({ tanggal: '2026-11-20', gelombang: 1 });
    expect(buildNameTagView(rows, { tanggal: '2026-11-20', gelombang: '3' }).selected).toEqual({ tanggal: '2026-11-20', gelombang: 1 });
  });

  it('falls back to the nearest group for a date or Gelombang outside the options', () => {
    expect(buildNameTagView(rows, { tanggal: '2020-01-01', gelombang: '1' }).selected).toEqual({ tanggal: '2026-11-10', gelombang: 3 });
    expect(buildNameTagView(rows, { tanggal: ['2026-11-20'], gelombang: 'x' }).selected).toEqual({ tanggal: '2026-11-10', gelombang: 3 });
  });

  it('has nothing selected when no Pendaftar is scheduled', () => {
    expect(buildNameTagView([], { tanggal: '2026-11-20', gelombang: '1' })).toEqual({ groups: [], selected: null, members: [] });
  });
});


describe('nameTagHref', () => {
  it('links to a date, with or without a Gelombang', () => {
    expect(nameTagHref('2026-11-20')).toBe('/admin/okb/name-tag?tanggal=2026-11-20');
    expect(nameTagHref('2026-11-20', 2)).toBe('/admin/okb/name-tag?tanggal=2026-11-20&gelombang=2');
  });
});

describe('summarizeRuangOkb', () => {
  const member = (id: string, ruangOkb: string | null) => ({ id, namaLengkap: id, ruangOkb });

  it('counts who already has a room and how many are in each room, in natural order', () => {
    const summary = summarizeRuangOkb([member('a', 'Kelas 10'), member('b', null), member('c', 'Kelas 2'), member('d', 'Kelas 10'), member('e', '  ')]);

    expect(summary).toEqual({
      total: 5,
      withRoom: 3,
      withoutRoom: 2,
      perRoom: [{ nama: 'Kelas 2', count: 1 }, { nama: 'Kelas 10', count: 2 }],
    });
  });

  it('is empty for a group without Pendaftar', () => {
    expect(summarizeRuangOkb([])).toEqual({ total: 0, withRoom: 0, withoutRoom: 0, perRoom: [] });
  });
});
