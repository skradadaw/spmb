"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StatusPenerimaan, StatusVerifikasi } from "@/lib/status";

export type CekStatusResult =
  | {
      ok: true;
      nama_lengkap: string;
      status_verifikasi: StatusVerifikasi;
      status_penerimaan: StatusPenerimaan;
      catatan_admin: string | null;
    }
  | { ok: false; error: string };

const cekSchema = z.object({
  nomor: z.string().trim().regex(/^SPMB-2728-\d{4}$/, "Format nomor: SPMB-2728-0001"),
  tanggal_lahir: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal lahir wajib diisi"),
});

const PESAN_TIDAK_KETEMU =
  "Data tidak ditemukan. Periksa kembali nomor pendaftaran dan tanggal lahir.";

export async function cekStatus(input: {
  nomor: string;
  tanggal_lahir: string;
}): Promise<CekStatusResult> {
  const parsed = cekSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? PESAN_TIDAK_KETEMU };
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("pendaftar")
    .select("nama_lengkap, status_verifikasi, status_penerimaan, catatan_admin")
    .eq("nomor_pendaftaran", parsed.data.nomor)
    .eq("tanggal_lahir", parsed.data.tanggal_lahir)
    .maybeSingle();

  if (!data) return { ok: false, error: PESAN_TIDAK_KETEMU };
  return { ok: true, ...data };
}
