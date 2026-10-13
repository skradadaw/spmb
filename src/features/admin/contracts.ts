export type ClassUsage = { label: string; kuota: number; terpakai: number };
export type LabelCount = { label: string; count: number };
export type OkbScheduleDay = { date: string; total: number; sessions: LabelCount[] };

export type AdminDashboardSummary = {
  /** Tanggal hari ini di Asia/Jakarta (YYYY-MM-DD), dipakai menandai OKB hari ini. */
  today: string;
  /** Semua Pendaftar kecuali Menunggu Unggahan, yang belum dianggap mendaftar. */
  totalRegistrations: number;
  /** Jumlah per tugas admin; masing-masing membuka Data Pendaftar dengan filter yang sesuai. */
  tasks: { uploading: number; awaiting: number; verified: number; absent: number; decision: number };
  /** Perlu Perhatian counts; Dibatalkan and Ditolak are never included. */
  attention: { any: number; nisn: number };
  capacity: ClassUsage[];
  /** Pindahan yang masih berproses atau Diterima; tidak memakai Kuota. */
  transfers: number;
  results: { accepted: number; rejected: number; withdrawn: number };
  /** Siswa Baru Diterima per Kelas Penempatan (Pilihan Kelas bila belum ditetapkan). */
  acceptedByClass: LabelCount[];
  schedule: OkbScheduleDay[];
};
