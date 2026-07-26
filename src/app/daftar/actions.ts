"use server";

import { pendaftarSchema, petaError } from "@/lib/validation/pendaftar";
import {
  ALLOWED_TYPES,
  JENIS_DOKUMEN,
  LABEL_DOKUMEN,
  validasiDokumen,
  type JenisDokumen,
} from "@/lib/files";
import { createAdminClient } from "@/lib/supabase/admin";

export type SubmitResult =
  | { ok: true; nomor_pendaftaran: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const PESAN_NIK_GANDA =
  "NIK sudah terdaftar. Gunakan menu Cek Status untuk melihat status pendaftaran Anda.";
const PESAN_GAGAL = "Terjadi kesalahan saat menyimpan. Silakan coba lagi.";

export async function submitPendaftaran(formData: FormData): Promise<SubmitResult> {
  // 1. Validasi data teks
  const raw: Record<string, string> = {};
  for (const key of Object.keys(pendaftarSchema.shape)) {
    raw[key] = String(formData.get(key) ?? "");
  }
  const parsed = pendaftarSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Data belum lengkap atau tidak valid. Periksa kembali isian Anda.",
      fieldErrors: petaError(parsed.error),
    };
  }
  const d = parsed.data;

  // 2. Validasi kelengkapan & aturan file
  const files = {} as Record<JenisDokumen, File>;
  for (const jenis of JENIS_DOKUMEN) {
    const f = formData.get(`dokumen_${jenis}`);
    if (!(f instanceof File) || f.size === 0) {
      return { ok: false, error: `Dokumen ${LABEL_DOKUMEN[jenis]} belum diunggah.` };
    }
    const err = validasiDokumen(f);
    if (err) {
      return { ok: false, error: `${LABEL_DOKUMEN[jenis]}: ${err}` };
    }
    files[jenis] = f;
  }

  const supabase = createAdminClient();

  // 3. Cek NIK ganda (cek dini agar pesan ramah; constraint unik tetap jadi jaring pengaman)
  const { data: sudahAda } = await supabase
    .from("pendaftar")
    .select("id")
    .eq("nik", d.nik)
    .maybeSingle();
  if (sudahAda) return { ok: false, error: PESAN_NIK_GANDA };

  // 4. Simpan pendaftar (nomor pendaftaran dibuat otomatis oleh database)
  const { data: pendaftar, error: insertError } = await supabase
    .from("pendaftar")
    .insert({
      nama_lengkap: d.nama_lengkap,
      nik: d.nik,
      tempat_lahir: d.tempat_lahir,
      tanggal_lahir: d.tanggal_lahir,
      jenis_kelamin: d.jenis_kelamin,
      alamat: d.alamat,
      asal_tk: d.asal_tk || null,
      nama_ayah: d.nama_ayah,
      pekerjaan_ayah: d.pekerjaan_ayah,
      pendidikan_ayah: d.pendidikan_ayah,
      nama_ibu: d.nama_ibu,
      pekerjaan_ibu: d.pekerjaan_ibu,
      pendidikan_ibu: d.pendidikan_ibu,
      nama_wali: d.nama_wali || null,
      pekerjaan_wali: d.pekerjaan_wali || null,
      no_whatsapp: d.no_whatsapp,
    })
    .select("id, nomor_pendaftaran")
    .single();

  if (insertError || !pendaftar) {
    if (insertError?.code === "23505") return { ok: false, error: PESAN_NIK_GANDA };
    return { ok: false, error: PESAN_GAGAL };
  }

  // 5. Upload dokumen; jika gagal, bersihkan semuanya (tidak boleh ada data setengah jadi)
  const terupload: string[] = [];
  for (const jenis of JENIS_DOKUMEN) {
    const file = files[jenis];
    const path = `${pendaftar.id}/${jenis}.${ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES]}`;
    const { error: uploadError } = await supabase.storage
      .from("dokumen")
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      await bersihkan(supabase, pendaftar.id, terupload);
      return { ok: false, error: PESAN_GAGAL };
    }
    terupload.push(path);

    const { error: dokumenError } = await supabase
      .from("dokumen")
      .insert({ pendaftar_id: pendaftar.id, jenis, path_storage: path });
    if (dokumenError) {
      await bersihkan(supabase, pendaftar.id, terupload);
      return { ok: false, error: PESAN_GAGAL };
    }
  }

  return { ok: true, nomor_pendaftaran: pendaftar.nomor_pendaftaran };
}

async function bersihkan(
  supabase: ReturnType<typeof createAdminClient>,
  pendaftarId: string,
  paths: string[]
) {
  if (paths.length > 0) await supabase.storage.from("dokumen").remove(paths);
  // baris dokumen ikut terhapus lewat on delete cascade
  await supabase.from("pendaftar").delete().eq("id", pendaftarId);
}
