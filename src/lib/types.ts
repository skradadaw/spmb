import type { StatusPenerimaan, StatusVerifikasi } from "@/lib/status";
import type { JenisDokumen } from "@/lib/files";

export type Pendaftar = {
  id: string;
  nomor_urut: number;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P";
  alamat: string;
  asal_tk: string | null;
  nama_ayah: string;
  pekerjaan_ayah: string;
  pendidikan_ayah: string;
  nama_ibu: string;
  pekerjaan_ibu: string;
  pendidikan_ibu: string;
  nama_wali: string | null;
  pekerjaan_wali: string | null;
  no_whatsapp: string;
  status_verifikasi: StatusVerifikasi;
  status_penerimaan: StatusPenerimaan;
  catatan_admin: string | null;
  created_at: string;
  updated_at: string;
};

export type Dokumen = {
  id: string;
  pendaftar_id: string;
  jenis: JenisDokumen;
  path_storage: string;
  created_at: string;
};

export type JadwalItem = { tahapan: string; tanggal: string };
export type SyaratItem = { teks: string };
export type BiayaItem = { item: string; jumlah: string };
export type FaqItem = { tanya: string; jawab: string };
export type Kontak = { whatsapp: string; telepon: string; alamat: string };

export type Konten = {
  jadwal: JadwalItem[];
  syarat: SyaratItem[];
  biaya: BiayaItem[];
  faq: FaqItem[];
  kontak: Kontak;
};

export type KontenKey = keyof Konten;
