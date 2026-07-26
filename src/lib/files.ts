export const JENIS_DOKUMEN = ["kartu_keluarga", "akta_kelahiran", "pas_foto"] as const;
export type JenisDokumen = (typeof JENIS_DOKUMEN)[number];

export const LABEL_DOKUMEN: Record<JenisDokumen, string> = {
  kartu_keluarga: "Kartu Keluarga",
  akta_kelahiran: "Akta Kelahiran",
  pas_foto: "Pas Foto",
};

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

// Object.create(null): tanpa Object.prototype, jadi ALLOWED_TYPES["constructor"]
// (atau "toString"/"valueOf"/dst) tidak lagi merambat ke nilai warisan.
export const ALLOWED_TYPES: Record<string, string> = Object.assign(Object.create(null), {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
});

export function validasiDokumen(file: { type: string; size: number }): string | null {
  if (!ALLOWED_TYPES[file.type]) return "Tipe file harus JPG, PNG, atau PDF";
  if (file.size === 0) return "File kosong atau gagal terbaca";
  if (file.size > MAX_FILE_SIZE) return "Ukuran file maksimal 2 MB";
  return null;
}
