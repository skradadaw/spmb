import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Klien SSR dengan cookie sesi — dipakai untuk auth admin. */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // dipanggil dari Server Component: aman diabaikan (middleware yang menyegarkan sesi)
          }
        },
      },
    }
  );
}
