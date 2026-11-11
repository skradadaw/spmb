/** Pengaturan nomor Surat Penerimaan yang diisi admin di halaman Pengumuman. */
export type LetterNumberSettings = {
  /** Nomor surat dengan {urut} di tempat nomor urut, misalnya 400.3.10.1/{urut}-SDS3AM/OKB/2026. */
  format: string;
  /** Nomor urut untuk Pendaftar Diterima pertama yang diumumkan. */
  nomorAwal: number;
};

export const LETTER_NUMBER_PLACEHOLDER = '{urut}';
export const LETTER_NUMBER_FORMAT_MAX_LENGTH = 60;
export const LETTER_NUMBER_MAX = 999_999;

/** Hanya huruf, angka, dan tanda baca nomor surat, supaya selalu bisa ditulis dengan huruf bawaan PDF. */
const FORMAT_TEXT_PATTERN = /^[A-Za-z0-9 ./\-]*$/;

/** "400.3.10.1/{urut}-SDS3AM/OKB/2026" + 351 menjadi "400.3.10.1/351-SDS3AM/OKB/2026". */
export function formatNomorSurat(format: string, nomorUrut: number) {
  return format.replace(LETTER_NUMBER_PLACEHOLDER, String(nomorUrut));
}

export type LetterNumberInput = { format: string; nomorAwal: string | number };

/** Memeriksa isian admin; mengembalikan pengaturan yang rapi atau pesan kesalahannya. */
export function parseLetterNumberSettings(input: LetterNumberInput): { ok: true; settings: LetterNumberSettings } | { ok: false; error: string } {
  const format = String(input.format ?? '').trim().replace(/\s+/g, ' ');
  const parts = format.split(LETTER_NUMBER_PLACEHOLDER);
  if (parts.length !== 2) return { ok: false, error: `Format nomor surat harus memuat ${LETTER_NUMBER_PLACEHOLDER} tepat satu kali.` };
  if (!parts.every(part => FORMAT_TEXT_PATTERN.test(part))) return { ok: false, error: 'Format nomor surat hanya boleh berisi huruf, angka, spasi, titik, garis miring, dan tanda hubung.' };
  if (format.length > LETTER_NUMBER_FORMAT_MAX_LENGTH) return { ok: false, error: `Format nomor surat maksimal ${LETTER_NUMBER_FORMAT_MAX_LENGTH} karakter.` };

  const rawStart = String(input.nomorAwal ?? '').trim();
  const nomorAwal = /^\d+$/.test(rawStart) ? Number(rawStart) : NaN;
  if (!Number.isInteger(nomorAwal) || nomorAwal < 1 || nomorAwal > LETTER_NUMBER_MAX) return { ok: false, error: 'Nomor urut awal harus berupa angka bulat mulai dari 1.' };

  return { ok: true, settings: { format, nomorAwal } };
}
