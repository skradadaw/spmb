# Spesifikasi Data Peserta Admin

Tanggal: 2026-10-10
Status: Menunggu tinjauan pengguna; belum izin implementasi.

## Tujuan dan batasan

Pengguna meminta fitur Data Peserta dan secara eksplisit tidak menginginkan verifikasi pembayaran. Modul memungkinkan panitia mencari peserta, membaca detail, dan membuka dokumen yang telah diunggah. Mengikuti cakupan tahap pertama yang sebelumnya diusulkan: read-only, tanpa edit, hapus, perubahan status, export, atau alur verifikasi apa pun. Tidak mengubah formulir publik, aturan kuota 112, maupun status database.

Dokumen bukti pembayaran yang sudah ada hanya dapat dibuka sebagai lampiran, sama seperti dokumen lainnya; tidak ada tombol persetujuan, penolakan, status pembayaran, maupun perhitungan pembayaran baru.

## Pendekatan

Pilihan yang direkomendasikan: halaman daftar dan detail terpisah. Ini mendukung tautan langsung, navigasi kembali, dan detail panjang pada mobile. Alternatif drawer detail lebih cepat untuk meninjau daftar tetapi lebih kompleks untuk akses langsung dan konten panjang. Alternatif tabel lengkap tanpa detail membocorkan terlalu banyak informasi pribadi pada layar daftar. Gunakan pendekatan halaman terpisah dengan stack dan primitive UI yang sudah tersedia.

## Route dan navigasi

- `/admin/pendaftar`: judul Data Peserta, pencarian nama, filter kelas/jenis/status, jumlah hasil, dan pagination 20 peserta per halaman.
- `/admin/pendaftar/[id]`: detail peserta serta akses lampiran.
- Tambahkan menu Data Peserta di desktop dan navigasi mobile; Ringkasan tetap tersedia dan indikator aktif sesuai halaman.
- Daftar pendaftar terbaru pada dashboard dapat mengarah ke halaman detail.
- Tombol kembali ke Data Peserta mempertahankan query daftar bila berasal dari daftar; parameter tujuan tidak boleh menerima URL eksternal.

## Daftar peserta

Kolom: nama, pilihan kelas, jenis pendaftaran, tanggal masuk, status yang tersimpan, dan Lihat detail. NIK, alamat, telepon, dan informasi keluarga tidak dimuat di query daftar. Gunakan kartu pada mobile.

Parameter URL untuk pencarian, filter, dan halaman divalidasi di server. Pencarian nama case-insensitive, dipangkas dan dibatasi panjangnya, dengan karakter wildcard diperlakukan secara aman. Filter kelas/jenis memakai nilai yang sudah digunakan aplikasi; filter status memakai nilai aktual dari database melalui query server terbatas yang tidak memuat PII. Default menampilkan semua status termasuk Menunggu Unggahan, dengan label bahwa unggahan belum selesai. Perubahan pencarian/filter mereset halaman ke 1. Urutkan created_at descending lalu id sebagai penentu urutan stabil. Halaman tidak valid dinormalisasi; halaman di luar rentang diarahkan ke halaman terakhir yang valid. Daftar kosong mempunyai empty state dan reset filter.

Tidak membuat nomor pendaftaran baru: schema saat ini menggunakan UUID. Pencarian awal cukup nama; ID internal tidak dijadikan nomor urut pendaftaran.

## Detail peserta

Kelompok informasi: identitas anak, jenis pendaftaran dan kelas, sekolah asal/prestasi, hubungan dengan Direktorat 2 bila terisi, alamat, data ayah, data ibu, dokumen, status, dan tanggal masuk. Nilai kosong diberi tanda Belum diisi. Data identitas hanya tersedia bagi sesi admin valid, tidak ditampilkan pada log atau metadata publik. Tidak menciptakan data wali yang tidak ada dalam schema.

Dokumen mengikuti DOCUMENT_DEFINITIONS yang ada: akta, kartu keluarga, pas foto, dan bukti pembayaran. Tampilkan Buka dokumen atau Belum tersedia. Tidak ada verifikasi pembayaran maupun perubahan status dokumen.

## Keamanan dan alur data

Tetap gunakan feature admin: contracts terpisah untuk daftar/detail, repository server-only untuk Supabase, komponen presentasi menggunakan primitive yang tersedia. Query memilih kolom eksplisit, tidak select('*'), dan tidak mengekspos submission_secret_hash, submission_id, token unggahan, atau secret server.

Setiap entry point pengambilan data sensitif wajib memeriksa sesi admin, tidak hanya mengandalkan layout. Data admin dan respons dokumen tidak menggunakan shared/public cache. UUID detail invalid atau peserta tidak ditemukan menghasilkan not found; kegagalan database menghasilkan pesan aman yang berbeda dari data kosong.

Akses dokumen menggunakan endpoint server terautentikasi yang menerima ID peserta dan jenis dokumen dari allowlist, mengambil path dari row peserta sendiri, lalu membuat signed URL bucket dokumen_pendaftaran selama 60 detik. Client tidak boleh mengirim path storage bebas. Validasi pola path mengikuti implementasi upload yang ada dan tolak URL eksternal/path tak sesuai. Respons tidak dicache dan tidak mencatat signed URL. Jika gagal, tampilkan pesan aman dengan jalan kembali/coba lagi. Tautan dibuka pada tab baru dengan noopener/noreferrer. Bucket tetap privat; signed URL hanya dibuat ketika diminta dan merupakan bearer URL yang berlaku sampai kedaluwarsa.

Tidak membutuhkan migrasi database untuk tahap ini. Sesi admin masih PIN bersama; modul ini tidak mengklaim menyediakan audit identitas petugas individual.

## Tampilan dan keadaan UI

Gunakan warna, font, Card, Table, Input, Button, Badge, dan Alert yang sudah ada. Hindari dependensi baru. Search/filter memakai label aksesibel dan submit eksplisit agar berfungsi tanpa interaksi kompleks. Sediakan loading, error dengan retry, empty state, dan 404. Detail tidak menimbulkan horizontal overflow pada lebar 375 px.

## Pengujian dan kriteria penerimaan

- Test parameter query, filter, pagination, urutan, pemilihan kolom minimum, dan mapping null.
- Test sesi invalid pada daftar, detail, dan akses dokumen.
- Test ID invalid, peserta tidak ada, dokumen tidak ada, jenis/path dokumen invalid, dan storage gagal.
- Test bahwa signed URL hanya dibuat setelah autentikasi dan menggunakan path row peserta serta TTL 60 detik.
- Test navigasi aktif desktop/mobile, pencarian/reset, detail, loading/empty/error, dan tautan dokumen.
- Tidak ada mutasi database, perubahan kuota, atau fitur verifikasi pembayaran.
- Jalankan Vitest, ESLint, TypeScript, dan production build; laporkan hambatan lingkungan secara jujur.
- Periksa visual desktop/mobile jika lingkungan memungkinkan, memakai data sintetis untuk pengujian.
- Pertahankan perubahan lokal pengguna pada src/features/home/__tests__/page.test.tsx.

## Urutan setelah persetujuan

Setelah pengguna meninjau dan menyetujui spesifikasi ini, susun implementation plan dengan writing-plans dan minta pilihan metode eksekusi sebelum implementasi sesuai workflow brainstorming yang diminta.
