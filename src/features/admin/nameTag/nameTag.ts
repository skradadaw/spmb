/** Aturan Name Tag tanpa akses database maupun canvas. */

import { formatProperName } from '@/lib/properName';
import type { NameTagSelection } from './nameTagGroups';

/** Agar nama ruangan muat di kartu dan nama file. */
export const RUANG_OKB_MAX_LENGTH = 30;

/** Hanya Pendaftar berstatus ini yang Ruang OKB-nya dapat diubah. */
export const RUANG_OKB_STATUSES = ['Terjadwal OKB', 'Sudah OKB'] as const;

export function allowsRuangOkb(status: string) {
  return (RUANG_OKB_STATUSES as readonly string[]).includes(status);
}

/** Spasi di tepi dibuang dan spasi berurutan dijadikan satu; hasil kosong berarti mengosongkan Ruang OKB. */
export function normalizeRuangOkb(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function isValidRuangOkb(value: string) {
  return value.length <= RUANG_OKB_MAX_LENGTH;
}

/** Formatter nama menulis partikel kecil (`al-Fatih`); di kartu kata berhubung selalu berawal huruf kapital. */
function formatNameTagName(value: string) {
  return formatProperName(value)
    .split(' ')
    .map(word => (word.includes('-') ? word.charAt(0).toLocaleUpperCase('id-ID') + word.slice(1) : word))
    .join(' ');
}

/** Inisial yang sudah diketik, seperti `A.` atau `A.R.`. */
const TYPED_INITIALS = /^(?:[\p{L}\p{N}]\.)+$/u;

function initialOf(word: string) {
  const letter = word.match(/[\p{L}\p{N}]/u)?.[0];
  return letter ? `${letter.toLocaleUpperCase('id-ID')}.` : word;
}

/** Inisial yang berurutan ditulis tanpa spasi. */
function joinNameParts(parts: { text: string; initial: boolean }[]) {
  return parts.reduce((name, part, index) => {
    if (index === 0) return part.text;
    return name + (part.initial && parts[index - 1].initial ? '' : ' ') + part.text;
  }, '');
}

/**
 * Nama satu baris untuk kartu: kata disingkat dari akhir dan berhenti begitu muat.
 * `measure` memberi lebar teks dalam satuan yang sama dengan `maxWidth`.
 */
export function abbreviateName(fullName: string, maxWidth: number, measure: (text: string) => number) {
  const tidied = formatNameTagName(fullName);
  if (measure(tidied) <= maxWidth) return tidied;

  const parts = tidied.split(' ').map(text => ({ text, initial: TYPED_INITIALS.test(text) }));
  let name = joinNameParts(parts);
  for (let index = parts.length - 1; index >= 0 && measure(name) > maxWidth; index--) {
    const { text, initial } = parts[index];
    if (initial || text === 'bin' || text === 'binti') continue;
    parts[index] = { text: initialOf(text), initial: true };
    name = joinNameParts(parts);
  }
  return name;
}

export type NameTagPrintState = 'ready' | 'needs-ruang' | 'unavailable';

/** Cetak satuan: hanya Terjadwal OKB dan Sudah OKB, dan kartu tidak dibuat tanpa ruangan. */
export function nameTagPrintState(status: string, ruangOkb: string | null): NameTagPrintState {
  if (!allowsRuangOkb(status)) return 'unavailable';
  return normalizeRuangOkb(ruangOkb ?? '') ? 'ready' : 'needs-ruang';
}

function safeFileNamePart(value: string) {
  return value.replace(/[\\/:*?"<>|\p{Cc}]/gu, ' ');
}

/** `<Ruang OKB> - <nama lengkap>.png`, memakai nama yang tidak disingkat. */
export function nameTagFileName(ruangOkb: string, fullName: string) {
  const ruang = normalizeRuangOkb(safeFileNamePart(ruangOkb));
  const name = formatNameTagName(safeFileNamePart(fullName)).slice(0, 80).trim();
  return `${[ruang, name].filter(Boolean).join(' - ') || 'Name Tag'}.png`;
}

/** Huruf besar-kecil tidak membedakan: Windows akan menimpa file yang hanya berbeda di situ. */
function uniqueFileName(fileName: string, used: Set<string>) {
  let candidate = fileName;
  for (let copy = 2; used.has(candidate.toLowerCase()); copy++) {
    candidate = fileName.replace(/\.png$/, ` (${copy}).png`);
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

/**
 * Cetak sekaligus: Pendaftar tanpa Ruang OKB tidak ikut dan hanya dihitung.
 * Akhiran nama kembar mengikuti urutan `members`, jadi stabil selama urutannya sama.
 */
export function planNameTagZip(members: { namaLengkap: string; ruangOkb: string | null }[]) {
  const used = new Set<string>();
  const cards: { namaLengkap: string; ruangOkb: string; fileName: string }[] = [];
  for (const { namaLengkap, ruangOkb: rawRuang } of members) {
    const ruangOkb = normalizeRuangOkb(rawRuang ?? '');
    if (ruangOkb) cards.push({ namaLengkap, ruangOkb, fileName: uniqueFileName(nameTagFileName(ruangOkb, namaLengkap), used) });
  }
  return { cards, withoutRuangCount: members.length - cards.length };
}

export function nameTagZipFileName({ tanggal, gelombang }: NameTagSelection) {
  return `Name Tag ${tanggal} Gelombang ${gelombang}.zip`;
}
