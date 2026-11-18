export type ClassUsage = { label: string; kuota: number; terpakai: number };
export type LabelCount = { label: string; count: number };
/**
 * One upcoming OKB date with how many Pendaftar are scheduled, per Gelombang OKB and per Ruang OKB.
 * rooms is null when the database does not report Ruang OKB yet; Pendaftar without a room are total minus the rooms.
 */
export type OkbScheduleDay = { date: string; total: number; waves: LabelCount[]; rooms: LabelCount[] | null };

export type AdminDashboardSummary = {
  /** Tanggal hari ini di Asia/Jakarta (YYYY-MM-DD), dipakai menandai OKB hari ini. */
  today: string;
  /** Semua Pendaftar yang datanya sudah masuk, apa pun kelengkapan Berkasnya (termasuk Menunggu Unggahan). */
  totalRegistrations: number;
  /** Jumlah per tugas admin; masing-masing membuka Data Pendaftar dengan filter yang sesuai. */
  /** unannounced: Diterima/Ditolak yang belum diumumkan kepada orang tua. */
  tasks: { uploading: number; awaiting: number; verified: number; absent: number; decision: number; unannounced: number };
  /** Perlu Perhatian counts; Dibatalkan and Ditolak are never included. */
  attention: { any: number; nisn: number };
  capacity: ClassUsage[];
  /** Siswa Baru yang memakai kursi Kuota per jenis kelamin; unknown: jenis kelamin kosong pada data lama. */
  seatsByGender: { male: number; female: number; unknown: number };
  /** Pindahan yang masih berproses atau Diterima; tidak memakai Kuota. */
  transfers: number;
  results: { accepted: number; rejected: number; withdrawn: number };
  /** Siswa Baru Diterima per Kelas Penempatan (Pilihan Kelas bila belum ditetapkan). */
  acceptedByClass: LabelCount[];
  schedule: OkbScheduleDay[];
};
