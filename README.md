# SPMB SD Plus 3 Al-Muhajirin — Tahun Ajaran 2027/2028

Website Sistem Penerimaan Murid Baru: landing page informasi, pendaftaran online
(tanpa akun), cek status, dan panel admin (verifikasi, penerimaan, export Excel,
edit konten).

Teknologi: Next.js (App Router) + Tailwind CSS + Supabase (PostgreSQL, Storage, Auth).

## Menjalankan Lokal

1. `npm install`
2. Salin `.env.local.example` → `.env.local`, isi dari Supabase (Settings → API).
3. Jalankan `supabase/schema.sql` lalu `supabase/seed.sql` di Supabase SQL Editor
   (sekali saja).
4. Buat akun admin: Supabase Dashboard → Authentication → Users → Add user
   (centang Auto Confirm).
5. `npm run dev` → http://localhost:3000. Panel admin: `/admin`.

## Test

`npm test`

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Vercel → New Project → import repo.
3. Tambahkan environment variables: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
4. Deploy. Uji ulang alur pendaftaran + admin di URL produksi.

Catatan free tier Supabase: proyek dijeda bila tidak ada aktivitas ±1 minggu —
buka dashboard Supabase untuk mengaktifkan kembali, atau upgrade saat masa
pendaftaran berlangsung.
