import { DOCUMENT_DEFINITIONS, type RegistrationDocumentId } from '@/features/registration/contracts';
import type { OkbWave } from '@/features/admin/okbWave';

/** Shorter Berkas names for the admin screens; parents keep the full name from the registration form. */
const ADMIN_DOCUMENT_TITLES: Partial<Record<RegistrationDocumentId, string>> = { buktiPembayaran: 'Bukti Pembayaran' };
export const adminDocumentTitle = (document: { id: RegistrationDocumentId; title: string }) => ADMIN_DOCUMENT_TITLES[document.id] ?? document.title;

export const PAYMENT_METHODS = [{ value: 'cash', label: 'Cash' }, { value: 'transfer', label: 'Transfer' }] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['value'];
export const isPaymentMethod = (value: unknown): value is PaymentMethod => PAYMENT_METHODS.some(method => method.value === value);

export const PARTICIPANT_PAGE_SIZE = 20;
export const PARTICIPANT_PAGE_SIZES = [20, 50, 100] as const;
export const PARTICIPANT_CLASSES = ['Reguler', 'Bilingual', 'Tahfizh'] as const;
/** Filter Kelas: tiga program kelas untuk Siswa Baru (Kelas Penempatan bila sudah ditetapkan, selain itu Pilihan Kelas), plus semua Pindahan. */
export const PARTICIPANT_CLASS_FILTERS = [...PARTICIPANT_CLASSES, 'Pindahan'] as const;
export const PARTICIPANT_DEFAULT_STATUSES = ['Menunggu Unggahan', 'Menunggu Verifikasi', 'Terverifikasi', 'Terjadwal OKB', 'Sudah OKB', 'Diterima', 'Ditolak', 'Dibatalkan'] as const;
/** Status offered in the Status filter. Menunggu Unggahan is left out (not yet a registration) but still reachable from the Ringkasan card. */
export const PARTICIPANT_FILTER_STATUSES = PARTICIPANT_DEFAULT_STATUSES.filter(status => status !== 'Menunggu Unggahan');
/** Status yang masih boleh dibatalkan admin; Ditolak sudah final dan Menunggu Unggahan belum dianggap mendaftar. */
export const CANCELLABLE_STATUSES = ['Menunggu Verifikasi', 'Terverifikasi', 'Terjadwal OKB', 'Sudah OKB', 'Diterima'] as const;

/** Pendaftar yang sudah gugur tidak pernah Perlu Perhatian. */
export const ATTENTION_EXCLUDED_STATUSES = ['Dibatalkan', 'Ditolak'] as const;
export const ATTENTION_FILTERS = { semua: 'Ada yang perlu perhatian', nisn: 'NISN tidak sesuai' } as const;
export type AttentionFilter = keyof typeof ATTENTION_FILTERS;
/** Pengumuman Hasil OKB: belum = Diterima/Ditolak yang belum dibuka untuk orang tua. */
export const ANNOUNCEMENT_FILTERS = { sudah: 'Sudah diumumkan', belum: 'Belum diumumkan' } as const;
export type AnnouncementFilter = keyof typeof ANNOUNCEMENT_FILTERS;
/** Perlu Perhatian (lihat CONTEXT.md): berkas yang sekadar belum diperiksa tidak dihitung. */
export type ParticipantAttention = { nisnMismatch: boolean; missingDocuments: number };

export type ParticipantListQuery = { search: string; /** Metode Pembayaran OKB yang sudah dicatat admin. */ paymentFilter: PaymentMethod | null; classFilter: string | null; statusFilter: string | null; attentionFilter: AttentionFilter | null; /** Tidak Hadir OKB; hanya lewat tautan dari Ringkasan. */ okbMissed: boolean; /** Gelombang OKB, hanya Pendaftar Terjadwal OKB. */ waveFilter: OkbWave | null; announcementFilter: AnnouncementFilter | null; page: number; pageSize: number };
export type ParticipantListItem = { id: string; nomorPendaftaran: string | null; namaLengkap: string; asalSekolah: string | null; pilihanKelas: string; kelasPenempatan: string | null; kelasTujuan: string | null; jenisPendaftaran: string; status: string; /** Gelombang OKB name, only while Terjadwal OKB. */ jadwalGelombang: string | null; createdAt: string | null; attention: ParticipantAttention; /** Diterima tetapi Nomor VA belum diisi. */ vaMissing: boolean };
export type ParticipantListResult = { items: ParticipantListItem[]; page: number; pageSize: number; total: number; totalPages: number };
export type ParticipantExportRecord = { id: string; createdAt: string | null; updatedAt: string | null; status: string; adminNote: string | null; nisnMismatch: boolean; fields: Record<string, string | null> };
export type ParticipantDocument = { id: RegistrationDocumentId; title: string; path: string | null };
export type DocumentReviewStatus = 'verified';
export type ParticipantDocumentReview = { status: DocumentReviewStatus; reviewedAt: string; reviewedBy: string };
export type ParticipantDocumentReviews = Partial<Record<RegistrationDocumentId, ParticipantDocumentReview>>;
export type ParticipantDetail = {
  id: string; createdAt: string | null; updatedAt: string | null; status: string;
  identity: Record<string, string | null>; registration: Record<string, string | null>;
  school: Record<string, string | null>; affiliation: Record<string, string | null>;
  referral: Record<string, string | null>;
  okb: Record<string, string | null>;
  decision: Record<string, string | null>;
  previousStatus: string | null;
  /** Current values keyed like the registration form, used to prefill the admin edit forms. */
  formValues: Record<string, string>;
  address: Record<string, string | null>; father: Record<string, string | null>; mother: Record<string, string | null>;
  documents: ParticipantDocument[];
  documentReviews: ParticipantDocumentReviews;
  adminNote: string | null;
  nisnMismatch: boolean;
  /** Nomor VA dari bank, hanya untuk Pendaftar Diterima. */
  nomorVa: string | null;
  paymentMethod: PaymentMethod | null;
  /** Waktu Pengumuman Hasil OKB; kosong bila belum diumumkan. */
  diumumkanPada: string | null;
};

export const PARTICIPANT_LIST_COLUMNS = 'id,nomor_pendaftaran,nama_lengkap,asal_sekolah,pilihan_kelas,kelas_penempatan,kelas_tujuan,jenis_pendaftaran,status,created_at,nisn_tidak_sesuai,berkas_belum_tersedia,jadwal_okb_gelombang,nomor_va';
export const PARTICIPANT_EXPORT_COLUMNS = 'id,created_at,updated_at,status,catatan_admin,nisn_tidak_sesuai,nama_lengkap,jenis_kelamin,tempat_lahir,tanggal_lahir,nik,nisn,nomor_pendaftaran,jenis_pendaftaran,pilihan_kelas,kelas_tujuan,asal_sekolah,prestasi_anak,tingkat_prestasi,jarak_ke_sekolah,bekerja_di_direktorat2,profesi_di_direktorAT2,nama_orangtua_direktorat2,unit_orangtua_direktorat2,saudara_di_direktorat2,nama_saudara_direktorat2,unit_saudara_direktorat2,ada_pengusul,tipe_pengusul,nama_tk_pengusul,nama_pengusul,nomor_wa_pengusul,jadwal_okb_tanggal,jadwal_okb_gelombang,kelas_penempatan,alamat_jalan,rt,rw,kelurahan,kecamatan,kota,provinsi,alamat_rumah,nama_ayah,nik_ayah,pendidikan_ayah,pekerjaan_ayah,penghasilan_ayah,telepon_ayah,alamat_ayah,nama_ibu,nik_ibu,pendidikan_ibu,pekerjaan_ibu,penghasilan_ibu,telepon_ibu,alamat_ibu'.replace('profesi_di_direktorAT2', 'profesi_di_direktorat2');
const PARTICIPANT_DETAIL_BASE_COLUMNS = 'id,created_at,updated_at,status,status_sebelum_dibatalkan,catatan_admin,nisn_tidak_sesuai,nomor_pendaftaran,nomor_va,metode_pembayaran_okb,diumumkan_pada,jenis_pendaftaran,pilihan_kelas,kelas_tujuan,nama_lengkap,jenis_kelamin,tempat_lahir,tanggal_lahir,nik,nisn,asal_sekolah,prestasi_anak,tingkat_prestasi,jarak_ke_sekolah,bekerja_di_direktorat2,profesi_di_direktorat2,nama_orangtua_direktorat2,unit_orangtua_direktorat2,saudara_di_direktorat2,nama_saudara_direktorat2,unit_saudara_direktorat2,ada_pengusul,tipe_pengusul,nama_tk_pengusul,nama_pengusul,nomor_wa_pengusul,jadwal_okb_tanggal,jadwal_okb_gelombang,kelas_penempatan,alamat_jalan,rt,rw,kelurahan,kecamatan,kota,provinsi,alamat_rumah,nama_ayah,nik_ayah,pendidikan_ayah,pekerjaan_ayah,penghasilan_ayah,telepon_ayah,alamat_ayah,nama_ibu,nik_ibu,pendidikan_ibu,pekerjaan_ibu,penghasilan_ibu,telepon_ibu,alamat_ibu';
export const PARTICIPANT_DETAIL_COLUMNS = `${PARTICIPANT_DETAIL_BASE_COLUMNS},${DOCUMENT_DEFINITIONS.map(({ dbColumn }) => dbColumn).join(',')}`;
