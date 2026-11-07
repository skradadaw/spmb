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
  suggestions: string[];
};

const compareText = (left: string, right: string) => left.localeCompare(right, 'id-ID', { numeric: true, sensitivity: 'base' });

export const nameTagGroupKey = ({ tanggal, gelombang }: NameTagSelection) => `${tanggal}/${gelombang}`;

/** Saran nama ruangan, dari ruangan milik semua Pendaftar pada `rows`. */
export function ruangOkbSuggestions(rows: NameTagRow[]) {
  return [...new Set(rows.flatMap(row => row.ruangOkb ?? []))].sort(compareText);
}

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
  return { groups, selected, members, suggestions: ruangOkbSuggestions(rows) };
}

export function nameTagHref(tanggal: string, gelombang?: OkbWave) {
  const params = new URLSearchParams({ tanggal });
  if (gelombang) params.set('gelombang', String(gelombang));
  return `/admin/name-tag?${params}`;
}
