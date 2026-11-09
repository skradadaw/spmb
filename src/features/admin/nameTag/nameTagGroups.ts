import { parseOkbWave, type OkbWave } from '@/features/admin/okbWave';

export type NameTagPendaftar = { id: string; namaLengkap: string; ruangOkb: string | null };
/** Pendaftar Terjadwal OKB dengan tanggal hari ini atau setelahnya. */
export type NameTagRow = NameTagPendaftar & { tanggal: string; gelombang: OkbWave };
export type NameTagSelection = { tanggal: string; gelombang: OkbWave };
export type NameTagGroup = NameTagSelection & { count: number };
export type NameTagView = {
  groups: NameTagGroup[];
  selected: NameTagSelection | null;
  members: NameTagPendaftar[];
};

const compareText = (left: string, right: string) => left.localeCompare(right, 'id-ID', { numeric: true, sensitivity: 'base' });

export const nameTagGroupKey = ({ tanggal, gelombang }: NameTagSelection) => `${tanggal}/${gelombang}`;

function toGroups(rows: NameTagRow[]): NameTagGroup[] {
  const groups = new Map<string, NameTagGroup>();
  for (const { tanggal, gelombang } of rows) {
    const key = nameTagGroupKey({ tanggal, gelombang });
    const group = groups.get(key);
    if (group) group.count += 1;
    else groups.set(key, { tanggal, gelombang, count: 1 });
  }
  // Tanggal berformat YYYY-MM-DD, jadi urutan teksnya sama dengan urutan kalender.
  return [...groups.values()].sort((left, right) => left.tanggal.localeCompare(right.tanggal) || left.gelombang - right.gelombang);
}

/** Kelompok di URL dipakai bila ada; selain itu Gelombang pertama pada tanggalnya, lalu kelompok terdekat. */
function pickGroup(groups: NameTagGroup[], rawTanggal: unknown, rawGelombang: unknown): NameTagSelection | null {
  const gelombang = parseOkbWave(rawGelombang);
  const group = groups.find(item => item.tanggal === rawTanggal && item.gelombang === gelombang)
    ?? groups.find(item => item.tanggal === rawTanggal)
    ?? groups[0];
  return group ? { tanggal: group.tanggal, gelombang: group.gelombang } : null;
}

/** Semua yang ditampilkan halaman Name Tag, dari satu pembacaan Pendaftar dan pilihan di URL. */
export function buildNameTagView(rows: NameTagRow[], params: { tanggal?: unknown; gelombang?: unknown }): NameTagView {
  const groups = toGroups(rows);
  const selected = pickGroup(groups, params.tanggal, params.gelombang);
  const members = rows
    .filter(row => row.tanggal === selected?.tanggal && row.gelombang === selected.gelombang)
    .map(({ id, namaLengkap, ruangOkb }) => ({ id, namaLengkap, ruangOkb }))
    .sort((left, right) => compareText(left.namaLengkap, right.namaLengkap) || left.id.localeCompare(right.id));
  return { groups, selected, members };
}

export function nameTagHref(tanggal: string, gelombang?: OkbWave) {
  const params = new URLSearchParams({ tanggal });
  if (gelombang) params.set('gelombang', String(gelombang));
  return `/admin/okb/name-tag?${params}`;
}

export type RuangOkbSummary = { total: number; withRoom: number; withoutRoom: number; perRoom: { nama: string; count: number }[] };

/** Progres pembagian Ruang OKB satu kelompok: berapa yang sudah punya ruangan, dan isi tiap ruangan. */
export function summarizeRuangOkb(members: NameTagPendaftar[]): RuangOkbSummary {
  const perRoom = new Map<string, number>();
  for (const { ruangOkb } of members) {
    const nama = ruangOkb?.trim();
    if (nama) perRoom.set(nama, (perRoom.get(nama) ?? 0) + 1);
  }
  const withRoom = [...perRoom.values()].reduce((sum, count) => sum + count, 0);
  return {
    total: members.length,
    withRoom,
    withoutRoom: members.length - withRoom,
    perRoom: [...perRoom].map(([nama, count]) => ({ nama, count })).sort((left, right) => compareText(left.nama, right.nama)),
  };
}
