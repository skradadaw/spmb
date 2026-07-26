import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Klien service-role: melewati RLS. HANYA untuk kode server. */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
