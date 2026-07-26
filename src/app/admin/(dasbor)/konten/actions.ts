"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import type { KontenKey } from "@/lib/types";

const teks = z.string().trim().min(1);

const skemaPerKey: Record<KontenKey, z.ZodTypeAny> = {
  jadwal: z.array(z.object({ tahapan: teks, tanggal: teks })),
  syarat: z.array(z.object({ teks })),
  biaya: z.array(z.object({ item: teks, jumlah: teks })),
  faq: z.array(z.object({ tanya: teks, jawab: teks })),
  kontak: z.object({
    whatsapp: z.string().trim(),
    telepon: z.string().trim(),
    alamat: z.string().trim(),
  }),
};

export async function simpanKonten(
  key: KontenKey,
  isi: unknown
): Promise<{ ok: boolean; error?: string }> {
  const auth = await createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return { ok: false, error: "Sesi berakhir. Silakan login ulang." };

  const skema = skemaPerKey[key];
  if (!skema) return { ok: false, error: "Jenis konten tidak dikenal." };
  const parsed = skema.safeParse(isi);
  if (!parsed.success) {
    return { ok: false, error: "Semua kolom wajib diisi sebelum disimpan." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("konten")
    .upsert({ key, isi: parsed.data }, { onConflict: "key" });
  if (error) return { ok: false, error: "Gagal menyimpan. Coba lagi." };

  revalidatePath("/");
  revalidatePath("/admin/konten");
  return { ok: true };
}
