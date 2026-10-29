/** Data Pendaftar yang dibutuhkan Cek Hasil OKB; sengaja tanpa alamat, NIK, maupun data orang tua. */
export type ApplicantResultRecord = {
  nomorPendaftaran: string;
  namaLengkap: string | null;
  /** Hanya untuk Surat Penerimaan; tidak pernah ditampilkan di halaman. */
  tempatLahir: string | null;
  tanggalLahir: string | null;
  status: string;
  jadwalTanggal: string | null;
  jadwalGelombang: unknown;
  /** Waktu Pengumuman Hasil OKB; kosong selama keputusan belum boleh dilihat orang tua. */
  diumumkanPada: string | null;
  kelasPenempatan: string | null;
  jenisPendaftaran: string | null;
  kelasTujuan: string | null;
  nomorVa: string | null;
};

/** Tahap yang ditampilkan kepada orang tua sebelum Pengumuman Hasil OKB. */
export type ResultCheckStage = 'Menunggu Verifikasi' | 'Terverifikasi' | 'Terjadwal OKB' | 'Menunggu Pengumuman';

export type ResultCheckApplicant = { namaLengkap: string; nomorPendaftaran: string };

export type ResultView =
  | { kind: 'invalid'; message: string }
  /** Nomor tidak dikenal, tanggal lahir tidak cocok, atau belum mendaftar: sengaja tidak dibedakan. */
  | { kind: 'not-found' }
  | { kind: 'locked' }
  | { kind: 'stage'; applicant: ResultCheckApplicant; stage: ResultCheckStage; jadwal: { tanggal: string; gelombang: string } | null }
  | { kind: 'cancelled'; applicant: ResultCheckApplicant }
  /** Kelas Tujuan hanya untuk Pindahan; Nomor VA bisa kosong bila keputusan dikoreksi setelah diumumkan. */
  | { kind: 'accepted'; applicant: ResultCheckApplicant; kelasPenempatan: string | null; kelasTujuan: string | null; nomorVa: string | null }
  | { kind: 'rejected'; applicant: ResultCheckApplicant };

export type ResultCheckState = { view: ResultView | null; nomorPendaftaran: string; tanggalLahir: string };
