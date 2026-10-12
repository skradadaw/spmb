import { DOCUMENT_DEFINITIONS, type RegistrationDocumentId } from '@/features/registration/contracts';

export const PARTICIPANT_PAGE_SIZE = 20;
export const PARTICIPANT_CLASSES = ['Reguler', 'Bilingual', 'Tahfizh'] as const;
export const PARTICIPANT_TYPES = ['Siswa Baru', 'Pindahan'] as const;
export const PARTICIPANT_DEFAULT_STATUSES = ['Menunggu Unggahan', 'Menunggu Verifikasi', 'Terverifikasi', 'Diterima', 'Ditolak'] as const;

export type ParticipantListQuery = { search: string; classFilter: string | null; typeFilter: string | null; statusFilter: string | null; page: number };
export type ParticipantListItem = { id: string; namaLengkap: string; asalSekolah: string | null; pilihanKelas: string; jenisPendaftaran: string; status: string; createdAt: string | null };
export type ParticipantListResult = { items: ParticipantListItem[]; page: number; pageSize: number; total: number; totalPages: number };
export type ParticipantExportRecord = { id: string; createdAt: string | null; updatedAt: string | null; status: string; adminNote: string | null; fields: Record<string, string | null> };
export type ParticipantDocument = { id: RegistrationDocumentId; title: string; path: string | null };
export type DocumentReviewStatus = 'verified' | 'follow_up';
export type ParticipantDocumentReview = { status: DocumentReviewStatus; reviewedAt: string; reviewedBy: string };
export type ParticipantDocumentReviews = Partial<Record<RegistrationDocumentId, ParticipantDocumentReview>>;
export type ParticipantDetail = {
  id: string; createdAt: string | null; updatedAt: string | null; status: string;
  identity: Record<string, string | null>; registration: Record<string, string | null>;
  school: Record<string, string | null>; affiliation: Record<string, string | null>;
  referral: Record<string, string | null>;
  address: Record<string, string | null>; father: Record<string, string | null>; mother: Record<string, string | null>;
  documents: ParticipantDocument[];
  documentReviews: ParticipantDocumentReviews;
  adminNote: string | null;
};

export const PARTICIPANT_LIST_COLUMNS = 'id,nama_lengkap,asal_sekolah,pilihan_kelas,jenis_pendaftaran,status,created_at';
export const PARTICIPANT_EXPORT_COLUMNS = 'id,created_at,updated_at,status,catatan_admin,nama_lengkap,jenis_kelamin,tempat_lahir,tanggal_lahir,nik,nisn,jenis_pendaftaran,pilihan_kelas,asal_sekolah,prestasi_anak,tingkat_prestasi,jarak_ke_sekolah,bekerja_di_direktorat2,profesi_di_direktorAT2,nama_orangtua_direktorat2,unit_orangtua_direktorat2,saudara_di_direktorat2,nama_saudara_direktorat2,unit_saudara_direktorat2,ada_pengusul,tipe_pengusul,nama_tk_pengusul,nama_pengusul,nomor_wa_pengusul,alamat_jalan,rt,rw,kelurahan,kecamatan,kota,provinsi,alamat_rumah,nama_ayah,nik_ayah,pendidikan_ayah,pekerjaan_ayah,penghasilan_ayah,telepon_ayah,alamat_ayah,nama_ibu,nik_ibu,pendidikan_ibu,pekerjaan_ibu,penghasilan_ibu,telepon_ibu,alamat_ibu'.replace('profesi_di_direktorAT2', 'profesi_di_direktorat2');
const PARTICIPANT_DETAIL_BASE_COLUMNS = 'id,created_at,updated_at,status,catatan_admin,jenis_pendaftaran,pilihan_kelas,nama_lengkap,jenis_kelamin,tempat_lahir,tanggal_lahir,nik,nisn,asal_sekolah,prestasi_anak,tingkat_prestasi,jarak_ke_sekolah,bekerja_di_direktorat2,profesi_di_direktorat2,nama_orangtua_direktorat2,unit_orangtua_direktorat2,saudara_di_direktorat2,nama_saudara_direktorat2,unit_saudara_direktorat2,ada_pengusul,tipe_pengusul,nama_tk_pengusul,nama_pengusul,nomor_wa_pengusul,alamat_jalan,rt,rw,kelurahan,kecamatan,kota,provinsi,alamat_rumah,nama_ayah,nik_ayah,pendidikan_ayah,pekerjaan_ayah,penghasilan_ayah,telepon_ayah,alamat_ayah,nama_ibu,nik_ibu,pendidikan_ibu,pekerjaan_ibu,penghasilan_ibu,telepon_ibu,alamat_ibu';
export const PARTICIPANT_DETAIL_COLUMNS = `${PARTICIPANT_DETAIL_BASE_COLUMNS},${DOCUMENT_DEFINITIONS.map(({ dbColumn }) => dbColumn).join(',')}`;
