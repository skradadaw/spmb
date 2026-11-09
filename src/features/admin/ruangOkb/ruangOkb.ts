/** Aturan daftar Ruang OKB (lihat CONTEXT.md) tanpa akses database. */

import { normalizeRuangOkb } from '@/features/admin/nameTag/nameTag';

export type RuangOkb = { id: string; nama: string };
/** dipakai: jumlah Pendaftar yang merujuk ruangan ini, apa pun statusnya. */
export type RuangOkbUsage = RuangOkb & { dipakai: number };

/** Dua nama dengan kunci yang sama dianggap ruangan yang sama: huruf besar-kecil dan spasi tidak membedakan. */
export function ruangOkbKey(nama: string) {
  return normalizeRuangOkb(nama).toLocaleLowerCase('id-ID');
}

const collator = new Intl.Collator('id-ID', { numeric: true, sensitivity: 'base' });

/** Urutan alami: "Kelas 2" sebelum "Kelas 10". */
export function compareRuangOkbName(left: string, right: string) {
  return collator.compare(left, right);
}

export function sortRuangOkb<T extends { nama: string }>(rooms: readonly T[]) {
  return [...rooms].sort((left, right) => compareRuangOkbName(left.nama, right.nama));
}
