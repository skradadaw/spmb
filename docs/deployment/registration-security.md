# Deployment Keamanan Pendaftaran (Vercel + Supabase)

Jangan membuka formulir untuk data asli sampai migrasi SQL dan versi aplikasi ini
sudah terpasang bersama-sama.

## 1. Environment Variables Vercel

Tambahkan untuk Production, Preview, dan Development sesuai kebutuhan:

- `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase; boleh tersedia di browser.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon key Supabase; boleh tersedia di browser dan
  tetap dibatasi oleh RLS/bucket privat.
- `SUPABASE_SERVICE_ROLE_KEY`: rahasia server; jangan memakai awalan `NEXT_PUBLIC_`.
- `ADMIN_PIN`: 6 digit PIN untuk login dashboard admin.
- `ADMIN_SESSION_SECRET`: secret acak minimal 32 karakter untuk sesi admin.

> **Catatan Kuota**: Sistem pendaftaran tidak lagi menggunakan batasan tanggal ataupun variabel override. Formulir selalu terbuka selama jumlah pendaftar lengkap (`status <> 'Menunggu Unggahan'`) masih di bawah 112 peserta. Ketika kuota 112 tercapai, halaman `/pendaftaran` otomatis menampilkan pesan kuota penuh dan server menolak pengiriman baru.

## 2. Migrasi Supabase

1. Jalankan preflight berikut di SQL Editor:

   ```sql
   SELECT nik, count(*)
   FROM public.pendaftar
   WHERE nik IS NOT NULL AND status <> 'Menunggu Unggahan'
   GROUP BY nik
   HAVING count(*) > 1;
   ```

2. Jika ada hasil, hentikan proses dan selesaikan duplikasi secara manual.
3. Jalankan seluruh isi `supabase/schema.sql`. Migrasi ini memasang fungsi
   `finalize_registration_with_capacity`, yang mengunci tabel `public.pendaftar`
   secara atomik (`LOCK TABLE public.pendaftar IN SHARE ROW EXCLUSIVE MODE`)
   agar pendaftar bersamaan tidak dapat melampaui batas 112 peserta.
4. Pastikan bucket `dokumen_pendaftaran` berstatus **Private**, batas 5 MB, dan
   hanya menerima PDF, JPEG, PNG, serta WebP.
5. Pastikan tidak ada policy yang memberi browser akses langsung:

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
2. Kirim satu formulir uji coba melalui halaman `/pendaftaran`.
3. Pastikan row berstatus `Menunggu Verifikasi`, empat kolom dokumen hanya berisi
   path privat, dan akses publik ke setiap path ditolak.
4. Coba file dengan ekstensi palsu atau PDF tanpa header `%PDF-`; finalisasi harus
   ditolak dan data pending dibersihkan.
5. Pastikan submit NIK yang sama ditolak ketika finalisasi.
6. Pastikan progres di landing page bertambah setelah dokumen lengkap, tetapi
   tidak bertambah untuk row berstatus `Menunggu Unggahan`.
7. Saat jumlah pendaftar lengkap mencapai 112, pastikan peserta berikutnya
   menerima pesan bahwa kuota pendaftaran sudah penuh.
8. Hapus row dan file sintetis dari dashboard.

Jika orang tua perlu memperbaiki pendaftaran dengan NIK yang sudah tercatat,
panitia menangani pemulihan identitas dan perubahan data secara manual. Jangan
menghapus data NIK hanya berdasarkan permintaan tanpa verifikasi panitia.

Jalankan `public.cleanup_expired_registration_security_data()` secara berkala.
Fungsi ini mengembalikan path file sesi kedaluwarsa; hapus objek pada path tersebut
dari Storage melalui proses admin sebelum/bersamaan dengan pembersihan rutin.
