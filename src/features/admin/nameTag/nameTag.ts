/** Aturan Name Tag tanpa akses database maupun canvas. */

/** Agar nama ruangan muat di kartu dan nama file. */
export const RUANG_OKB_MAX_LENGTH = 30;

/** Hanya Pendaftar berstatus ini yang Ruang OKB-nya dapat diubah. */
export const RUANG_OKB_STATUSES = ['Terjadwal OKB', 'Sudah OKB'] as const;

/** Spasi di tepi dibuang dan spasi berurutan dijadikan satu; hasil kosong berarti mengosongkan Ruang OKB. */
export function normalizeRuangOkb(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function isValidRuangOkb(value: string) {
  return value.length <= RUANG_OKB_MAX_LENGTH;
}
