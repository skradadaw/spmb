# Desain Dashboard Ringkasan Admin SPMB

## Tujuan

Menyediakan satu halaman awal bagi panitia untuk memahami kondisi pendaftaran secara cepat setelah login. Tahap ini bersifat baca-saja: admin dapat melihat metrik, distribusi, dan pendaftar terbaru, tetapi belum dapat mengubah status atau data siswa.

## Ruang Lingkup

### Termasuk

- Route terlindungi `/admin` sebagai tujuan login berhasil.
- Ringkasan total pendaftar dan status proses.
- Distribusi pilihan kelas dan jenis pendaftaran.
- Daftar pendaftar terbaru.
- Logout admin.
- Kondisi data kosong dan kegagalan pemuatan data.
- Layout responsif desktop, tablet, dan mobile.

### Tidak termasuk

- Mengubah status pendaftaran.
- Mengedit atau menghapus data siswa.
- Membuka atau mengunduh dokumen siswa.
- Pencarian, filter lanjutan, pagination, ekspor, serta audit log.
- Grafik tren historis.

Fitur tersebut dapat ditambahkan sebagai tahap berikutnya tanpa mengubah struktur dasar dashboard.

## Arsitektur dan Keamanan

Route `/admin` menggunakan Server Component. Sebelum data diambil atau UI dirender, halaman memanggil `getAdminSession()`. Sesi tidak valid diarahkan ke `/login`; sesi valid diteruskan ke layanan ringkasan admin.

Pembacaan tabel `public.pendaftar` dilakukan hanya di server melalui Supabase service-role client yang sudah tersedia. Service-role key tidak boleh diimpor ke Client Component atau dikirim ke browser. Query hanya memilih kolom yang dibutuhkan dashboard dan tidak mengambil NIK, data orang tua, alamat, nomor telepon, atau jalur dokumen.

Server Action logout memeriksa konteks server, menghapus cookie sesi menggunakan `clearAdminSession()`, kemudian mengarahkan pengguna ke `/login`. Setiap Server Action admin yang ditambahkan pada tahap mendatang wajib memverifikasi sesi secara mandiri.

## Model Data Tampilan

Layanan dashboard mengembalikan bentuk data khusus yang tidak membocorkan row database mentah:

- `totalRegistrations`
- `awaitingVerification`
- `completedRegistrations`
- `incompleteUploads`
- distribusi kelas: `Reguler`, `Bilingual`, `Tahfizh`
- distribusi jenis: `Siswa Baru`, `Pindahan`
- maksimal delapan pendaftar terbaru dengan `id`, `namaLengkap`, `pilihanKelas`, `jenisPendaftaran`, `status`, dan `createdAt`

Definisi tahap pertama:

- Menunggu verifikasi: status `Menunggu Verifikasi`.
- Berkas belum lengkap: status `Menunggu Unggahan`.
- Pendaftaran selesai: seluruh data selain `Menunggu Unggahan`; metrik diberi label netral karena status penerimaan final belum didefinisikan.

Nilai kosong atau tidak dikenal ditempatkan pada kategori `Lainnya` untuk mencegah jumlah distribusi menyesatkan.

## Struktur Antarmuka

### Navigasi

Desktop menggunakan sidebar hijau gelap dengan logo sekolah, nama sekolah, satu menu aktif `Ringkasan`, indikator area administrator, dan tombol keluar di bagian bawah. Mobile menggunakan header ringkas dengan identitas sekolah; karena baru ada satu menu, tidak diperlukan drawer atau hamburger pada tahap ini.

### Konten

Header utama memuat judul `Dashboard Pendaftaran`, deskripsi pendek, dan waktu pembaruan data. Di bawahnya terdapat:

1. Empat kartu statistik utama.
2. Dua panel distribusi berbentuk progress list: pilihan kelas dan jenis pendaftaran.
3. Tabel `Pendaftar Terbaru` dengan status badge.

Tidak ada grafik dekoratif. Progress list dipilih karena jumlah kategori sedikit, mudah dibandingkan, dan tetap terbaca saat data bernilai nol.

### Responsive

- Desktop: sidebar tetap, empat kartu dalam empat kolom, dua panel distribusi berdampingan.
- Tablet: sidebar lebih sempit, kartu dua kolom.
- Mobile: identitas menjadi header, kartu dua kolom, panel bertumpuk, dan setiap baris tabel menjadi kartu ringkas agar tidak menimbulkan horizontal scrolling.

## Sistem Visual

Dashboard meneruskan identitas halaman login: Plus Jakarta Sans, hijau sekolah sebagai aksen, slate untuk teks, dan latar netral terang. Hijau dipakai untuk navigasi, status positif, focus ring, dan progress; bukan sebagai latar seluruh halaman. Spacing mengikuti ritme 4/8 px dan permukaan memakai radius serta bayangan lembut yang konsisten.

Ikon menggunakan satu keluarga, yaitu Lucide yang sudah menjadi dependensi proyek. Ikon dekoratif diberi `aria-hidden`, sedangkan tombol ikon memiliki accessible name. Animasi dibatasi pada perubahan warna/opacity singkat dan mengikuti `prefers-reduced-motion` yang sudah tersedia.

## Komponen shadcn

Implementasi menggunakan primitive shadcn yang sudah ada dan menambahkan primitive yang dibutuhkan dengan pola shadcn:

- `Button` untuk logout dan tindakan navigasi.
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, dan `CardContent` untuk statistik serta distribusi.
- `Badge` untuk status pendaftaran.
- `Table` untuk daftar desktop.
- `Separator` untuk pembagian area sidebar/header.
- `Alert` untuk kegagalan pemuatan data.

Komponen dashboard hanya menyusun primitive tersebut; tidak menduplikasi implementasi button, card, badge, atau table secara lokal.

## Kondisi dan Error Handling

- Tidak ada pendaftar: seluruh metrik bernilai nol dan tabel menampilkan empty state yang menjelaskan bahwa data akan muncul setelah formulir dikirim.
- Konfigurasi Supabase tidak tersedia: tampilkan pesan administratif yang aman tanpa membocorkan key atau detail internal.
- Query gagal: log detail hanya di server dan tampilkan pesan umum dengan tautan kembali atau instruksi memuat ulang.
- Data parsial/null: gunakan label `Belum diisi` atau `Lainnya`, bukan menyebabkan render gagal.

## Pengujian

- Unit test agregasi metrik dan kategori data.
- Test repository memastikan query hanya memilih kolom yang diperlukan dan membatasi data terbaru.
- Test halaman memastikan sesi tidak valid diarahkan ke `/login` dan sesi valid merender ringkasan.
- Test logout memastikan cookie dihapus dan pengguna diarahkan ke `/login`.
- Component test untuk empty state, status badge, struktur tabel, dan representasi mobile.
- Jalankan seluruh Vitest suite, ESLint, TypeScript, dan production build.

## Kriteria Selesai

- Login berhasil menuju halaman `/admin` yang nyata.
- Pengguna tanpa sesi valid tidak dapat melihat data dashboard.
- Tidak ada data sensitif yang tidak diperlukan terkirim ke client.
- Ringkasan memakai data Supabase aktual dan menangani kondisi nol/error.
- Semua elemen UI utama memakai primitive shadcn.
- Tampilan tetap terbaca tanpa horizontal scrolling pada lebar 375 px.
- Semua pengujian dan pemeriksaan build lulus.
