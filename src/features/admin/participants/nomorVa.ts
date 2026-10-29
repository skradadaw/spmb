/** Nomor VA dari bank selalu 16 digit angka (lihat Nomor VA di CONTEXT.md). */
export const NOMOR_VA_LENGTH = 16;

/** Spasi dan tanda hubung dari daftar bank dibuang, sehingga nomor yang ditempel langsung dapat dipakai. */
export function normalizeNomorVa(value: string) {
  return value.replace(/[\s-]/g, '');
}

export function isValidNomorVa(value: string) {
  return new RegExp(`^\\d{${NOMOR_VA_LENGTH}}$`).test(value);
}
