import { createAdminClient } from "@/lib/supabase/admin";
import type { Konten } from "@/lib/types";

export async function getKonten(): Promise<Konten> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("konten").select("key, isi");
  const peta = Object.fromEntries((data ?? []).map((r) => [r.key, r.isi]));
  return {
    jadwal: (peta.jadwal as Konten["jadwal"]) ?? [],
    syarat: (peta.syarat as Konten["syarat"]) ?? [],
    biaya: (peta.biaya as Konten["biaya"]) ?? [],
    faq: (peta.faq as Konten["faq"]) ?? [],
    kontak: (peta.kontak as Konten["kontak"]) ?? { whatsapp: "", telepon: "", alamat: "" },
  };
}
