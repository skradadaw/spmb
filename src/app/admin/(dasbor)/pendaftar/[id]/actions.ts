"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { STATUS_PENERIMAAN, STATUS_VERIFIKASI } from "@/lib/status";

const statusSchema = z.object({
  status_verifikasi: z.enum(STATUS_VERIFIKASI),
  status_penerimaan: z.enum(STATUS_PENERIMAAN),
  catatan_admin: z.string().trim().max(500, "Catatan maksimal 500 karakter"),
});

export async function updateStatusPendaftar(
  id: string,
  data: { status_verifikasi: string; status_penerimaan: string; catatan_admin: string }
): Promise<{ ok: boolean; error?: string }> {
  // server action = endpoint publik → wajib cek sesi admin
  const auth = await createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return { ok: false, error: "Sesi berakhir. Silakan login ulang." };

  const parsed = statusSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("pendaftar")
    .update({
      status_verifikasi: parsed.data.status_verifikasi,
      status_penerimaan: parsed.data.status_penerimaan,
      catatan_admin: parsed.data.catatan_admin || null,
    })
    .eq("id", id);

  if (error) return { ok: false, error: "Gagal menyimpan. Coba lagi." };
  revalidatePath(`/admin/pendaftar/${id}`);
  revalidatePath("/admin/pendaftar");
  return { ok: true };
}
