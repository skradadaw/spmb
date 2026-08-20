# Deployment Keamanan Pendaftaran (Vercel + Supabase)

Jangan membuka formulir untuk data asli sampai migrasi SQL dan versi aplikasi ini
sudah terpasang bersama-sama.

## 1. Environment Variables Vercel

Tambahkan untuk Production, Preview, dan Development sesuai kebutuhan:

- `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase; boleh tersedia di browser.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon key Supabase; boleh tersedia di browser dan
  tetap dibatasi oleh RLS/bucket privat.
- `SUPABASE_SERVICE_ROLE_KEY`: rahasia server; jangan memakai awalan `NEXT_PUBLIC_`.
- `REGISTRATION_OVERRIDE=closed`: tutup pendaftaran selama migrasi dan smoke test.
- Opsional `REGISTRATION_OPENS_AT` dan `REGISTRATION_CLOSES_AT` dalam ISO-8601.
  Tanpa override, nilai bawaan adalah 1 September sampai 10 Oktober 2026 WIB.

Setelah verifikasi selesai, hapus `REGISTRATION_OVERRIDE` agar jadwal berlaku,
atau ubah sementara menjadi `open` hanya ketika panitia memang ingin membuka di
luar jadwal. Gunakan `closed` sebagai tombol darurat.

## 2. Migrasi Supabase

1. Pastikan `REGISTRATION_OVERRIDE=closed` sudah aktif dan deploy maintenance
   selesai.
2. Jalankan preflight berikut di SQL Editor:

   ```sql
   SELECT nik, count(*)
   FROM public.pendaftar
   WHERE nik IS NOT NULL AND status <> 'Menunggu Unggahan'
   GROUP BY nik
   HAVING count(*) > 1;
   ```

3. Jika ada hasil, hentikan proses dan selesaikan duplikasi secara manual.
4. Jalankan seluruh isi `supabase_schema.sql`.
5. Pastikan bucket `dokumen_pendaftaran` berstatus **Private**, batas 5 MB, dan
   hanya menerima PDF, JPEG, PNG, serta WebP.
6. Pastikan tidak ada policy yang memberi browser akses langsung:

   ```sql
   SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
   FROM pg_policies
   WHERE (schemaname = 'public' AND tablename = 'pendaftar')
      OR (schemaname = 'storage' AND tablename = 'objects');
   ```

   `public.pendaftar` harus tidak memiliki policy. Tinjau policy `storage.objects`
   dan pastikan tidak ada yang mengizinkan akses umum ke bucket
   `dokumen_pendaftaran`.

## 3. Perlindungan Vercel

- Aktifkan WAF/rate limiting Vercel untuk endpoint Server Action pendaftaran.
  Pembatasan aplikasi memakai header tepercaya `x-vercel-forwarded-for`, tetapi
  WAF tetap diperlukan untuk menahan request sebelum diproses aplikasi.
- Aplikasi tidak menaikkan body limit Next.js. File maksimum 5 MB diunggah langsung
  dengan signed token ke bucket privat, bukan melewati batas body Function Vercel.

## 4. Smoke Test Data Percobaan

1. Gunakan data dan dokumen sintetis, jangan identitas orang asli.
2. Sementara set `REGISTRATION_OVERRIDE=open`, deploy, lalu kirim satu formulir.
3. Pastikan row berstatus `Menunggu Verifikasi`, empat kolom dokumen hanya berisi
   path privat, dan akses publik ke setiap path ditolak.
4. Coba file dengan ekstensi palsu atau PDF tanpa header `%PDF-`; finalisasi harus
   ditolak dan data pending dibersihkan.
5. Pastikan submit NIK yang sama ditolak ketika finalisasi.
6. Hapus row dan file sintetis dari dashboard.
7. Hapus override agar jadwal normal kembali, lalu deploy ulang.

Jika orang tua perlu memperbaiki pendaftaran dengan NIK yang sudah tercatat,
panitia menangani pemulihan identitas dan perubahan data secara manual. Jangan
menghapus data NIK hanya berdasarkan permintaan tanpa verifikasi panitia.

Jalankan `public.cleanup_expired_registration_security_data()` secara berkala.
Fungsi ini mengembalikan path file sesi kedaluwarsa; hapus objek pada path tersebut
dari Storage melalui proses admin sebelum/bersamaan dengan pembersihan rutin.
