import 'server-only';

import type { RegistrationDocumentId } from '../contracts';
import type { FormData as RegistrationData } from '../schema';
import {
  DuplicateRegistrationError,
  type RegistrationPersistence,
} from './submissionService';

const DOCUMENT_BUCKET = 'dokumen_pendaftaran';
const PERSISTENCE_ERROR = 'Registration persistence operation failed';

type SupabaseOperationError = {
  code?: string;
  message?: string;
};

type SupabaseOperationResult<T> = PromiseLike<{
  data: T;
  error: SupabaseOperationError | null;
}>;

export interface SupabaseRegistrationClient {
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        file: File,
        options: { upsert: boolean; contentType: string; cacheControl: string },
      ): SupabaseOperationResult<unknown>;
      remove(paths: string[]): SupabaseOperationResult<unknown>;
    };
  };
  rpc(
    name: string,
    args: {
      p_identifier_hash: string;
      p_limit: number;
      p_window_seconds: number;
    },
  ): SupabaseOperationResult<boolean | null>;
  from(table: string): {
    insert(rows: Array<Record<string, unknown>>): SupabaseOperationResult<unknown>;
  };
}

export class RegistrationPersistenceError extends Error {
  constructor() {
    super(PERSISTENCE_ERROR);
    this.name = 'RegistrationPersistenceError';
  }
}

function toInternalPersistenceError(error: unknown) {
  return error instanceof RegistrationPersistenceError
    ? error
    : new RegistrationPersistenceError();
}

export function toPendaftarRow(
  data: RegistrationData,
  documentPaths: Record<RegistrationDocumentId, string>,
) {
  return {
    jenis_pendaftaran: data.jenisPendaftaran,
    pilihan_kelas: data.pilihanKelas,
    nama_lengkap: data.namaLengkap,
    jenis_kelamin: data.jenisKelamin,
    tempat_lahir: data.tempatLahir,
    tanggal_lahir: data.tanggalLahir,
    nik: data.nik,
    nisn: data.nisn || null,
    bekerja_di_direktorat2: data.bekerjaDiDirektorat2 || 'Tidak',
    nama_orangtua_direktorat2: data.bekerjaDiDirektorat2 === 'Ya'
      ? data.namaOrangtuaDirektorat2 || null
      : null,
    unit_orangtua_direktorat2: data.bekerjaDiDirektorat2 === 'Ya'
      ? data.unitOrangtuaDirektorat2 || null
      : null,
    saudara_di_direktorat2: data.saudaraDiDirektorat2 || 'Tidak',
    nama_saudara_direktorat2: data.saudaraDiDirektorat2 === 'Ya'
      ? data.namaSaudaraDirektorat2 || null
      : null,
    unit_saudara_direktorat2: data.saudaraDiDirektorat2 === 'Ya'
      ? data.unitSaudaraDirektorat2 || null
      : null,
    asal_sekolah: data.asalSekolah,
    prestasi_anak: data.prestasiAnak || null,
    tingkat_prestasi: data.tingkatPrestasi || null,
    jarak_ke_sekolah: data.jarakKeSekolah || null,
    alamat_jalan: data.alamatJalan,
    rt: data.rt,
    rw: data.rw,
    kelurahan: data.kelurahan,
    kecamatan: data.kecamatan,
    kota: data.kota,
    provinsi: data.provinsi,
    alamat_rumah: `${data.alamatJalan}, RT ${data.rt}/RW ${data.rw}, Kel. ${data.kelurahan}, Kec. ${data.kecamatan}, Kota/Kab. ${data.kota}, Prov. ${data.provinsi}`,
    nama_ayah: data.namaAyah,
    nik_ayah: data.nikAyah || null,
    pendidikan_ayah: data.pendidikanAyah || null,
    pekerjaan_ayah: data.pekerjaanAyah,
    penghasilan_ayah: data.penghasilanAyah || null,
    telepon_ayah: data.teleponAyah,
    no_telp: data.teleponAyah || data.teleponIbu,
    alamat_ayah: data.alamatAyah || null,
    nama_ibu: data.namaIbu,
    nik_ibu: data.nikIbu || null,
    pendidikan_ibu: data.pendidikanIbu || null,
    pekerjaan_ibu: data.pekerjaanIbu,
    penghasilan_ibu: data.penghasilanIbu || null,
    telepon_ibu: data.teleponIbu,
    alamat_ibu: data.alamatIbu || null,
    dokumen_akta_kelahiran: documentPaths.aktaKelahiran,
    dokumen_kartu_keluarga: documentPaths.kartuKeluarga,
    dokumen_pas_foto: documentPaths.pasFoto,
    dokumen_bukti_pembayaran: documentPaths.buktiPembayaran,
  };
}

export function createSupabaseRegistrationRepository(
  client: SupabaseRegistrationClient,
): RegistrationPersistence {
  return {
    async consumeRateLimit(key, limit, windowSeconds) {
      try {
        const { data, error } = await client.rpc('consume_registration_rate_limit', {
          p_identifier_hash: key,
          p_limit: limit,
          p_window_seconds: windowSeconds,
        });
        if (error) {
          throw new RegistrationPersistenceError();
        }

        return data === true;
      } catch (error) {
        throw toInternalPersistenceError(error);
      }
    },

    async uploadDocument(path, document) {
      try {
        const { error } = await client.storage.from(DOCUMENT_BUCKET).upload(path, document.file, {
          upsert: false,
          contentType: document.mimeType,
          cacheControl: '3600',
        });
        if (error) {
          throw new RegistrationPersistenceError();
        }
      } catch (error) {
        throw toInternalPersistenceError(error);
      }
    },

    async removeDocuments(paths) {
      try {
        const { error } = await client.storage.from(DOCUMENT_BUCKET).remove(paths);
        if (error) {
          throw new RegistrationPersistenceError();
        }
      } catch (error) {
        throw toInternalPersistenceError(error);
      }
    },

    async insertRegistration(data, documentPaths) {
      try {
        const { error } = await client.from('pendaftar').insert([
          toPendaftarRow(data, documentPaths),
        ]);
        if (error?.code === '23505' && error.message?.includes('uq_pendaftar_nik')) {
          throw new DuplicateRegistrationError();
        }
        if (error) {
          throw new RegistrationPersistenceError();
        }
      } catch (error) {
        if (error instanceof DuplicateRegistrationError) {
          throw error;
        }
        throw toInternalPersistenceError(error);
      }
    },
  };
}
