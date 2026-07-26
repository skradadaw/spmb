export const STATUS_VERIFIKASI = ["menunggu", "terverifikasi", "perlu_perbaikan"] as const;
export const STATUS_PENERIMAAN = ["menunggu", "diterima", "tidak_diterima"] as const;

export type StatusVerifikasi = (typeof STATUS_VERIFIKASI)[number];
export type StatusPenerimaan = (typeof STATUS_PENERIMAAN)[number];

export const LABEL_VERIFIKASI: Record<StatusVerifikasi, string> = {
  menunggu: "Menunggu Verifikasi",
  terverifikasi: "Terverifikasi",
  perlu_perbaikan: "Perlu Perbaikan",
};

export const LABEL_PENERIMAAN: Record<StatusPenerimaan, string> = {
  menunggu: "Menunggu Pengumuman",
  diterima: "Diterima",
  tidak_diterima: "Tidak Diterima",
};
