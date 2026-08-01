# Penyempurnaan Visual Dashboard Admin SPMB

**Tanggal:** 1 Agustus 2026  
**Status:** Disetujui untuk perencanaan implementasi

## Tujuan

Merapikan dashboard admin agar lebih mudah dipindai oleh panitia: angka utama terbaca cepat, pekerjaan yang perlu ditindaklanjuti terlihat jelas, dan akses ke tindakan umum tetap dekat. Arah visual menggunakan gaya operasional seimbang yang terinspirasi dari kedisiplinan warna hijau dan bahasa sederhana Gojek, tanpa menyalin identitas mereknya.

## Ruang Lingkup

Perubahan dibatasi pada:

- `src/app/admin/(dasbor)/page.tsx`
- `src/components/admin/AdminStatCard.tsx`
- `src/components/admin/AdminQuickActions.tsx`
- kontrak tes dashboard yang relevan

Shell admin, sidebar, header global, query Supabase, aturan bisnis, tabel database, dan halaman admin lain tidak diubah. Komponen Jalur Siswa tetap tidak digunakan dan tidak dibuat kembali.

## Prinsip Desain

1. **Operasional lebih dahulu.** Informasi yang membantu panitia mengambil tindakan mendapat prioritas tertinggi.
2. **Satu hierarki yang jelas.** Judul halaman, angka statistik, judul bagian, dan isi tabel memiliki skala berbeda yang konsisten.
3. **Hijau digunakan dengan disiplin.** Hijau menandai identitas, tindakan utama, dan status positif; amber hanya untuk data yang membutuhkan perhatian.
4. **Bahasa natural dan profesional.** Kalimat pendek, aktif, dan mudah dipahami tanpa istilah teknis.
5. **Responsif tanpa kehilangan fungsi.** Urutan informasi tetap sama pada desktop dan mobile.

## Struktur Halaman

Urutan konten dashboard:

1. Header ringkasan dan badge tahun ajaran.
2. Tiga kartu statistik.
3. Area kerja dua kolom: tabel pendaftar di kiri dan aksi cepat di kanan.

Pada desktop, tabel menggunakan porsi sekitar dua pertiga dan aksi cepat satu pertiga. Pada layar kecil, semua bagian menjadi satu kolom dengan urutan statistik, tabel, lalu aksi cepat.

## Header Ringkasan

Header konten menggunakan:

- Judul: **Ringkasan Pendaftaran**
- Deskripsi: **Pantau data pendaftar dan berkas yang perlu diperiksa.**
- Badge: **Tahun ajaran 2027/2028**

Judul memakai Kumbh Sans 800, ukuran sekitar 28–32px, line-height rapat, dan warna `#101820`. Deskripsi memakai Inter 14px dengan warna `#667085`. Badge memakai permukaan hijau sangat muda, teks hijau `#00880F`, dan bentuk kapsul.

## Kartu Statistik

Tiga kartu tetap menampilkan data nyata:

| Label | Teks pendukung | Warna status |
|---|---|---|
| Total Pendaftar | Semua pendaftar yang masuk | Netral-hijau |
| Menunggu Verifikasi | Berkas belum diperiksa | Amber |
| Diterima | Siswa yang dinyatakan diterima | Hijau |

Setiap kartu menggunakan radius 20px, padding 24px pada desktop dan 20px pada mobile, serta tinggi visual yang konsisten. Angka memakai Kumbh Sans 800 sekitar 36–40px. Label memakai Inter 13–14px medium. Teks pendukung memakai Inter 13px. Ikon tetap berasal dari `AdminIcon` dan ditempatkan dalam bidang 44px.

Kartu Menunggu Verifikasi mendapat aksen amber yang jelas tetapi tidak dominan. Total Pendaftar dan Diterima tetap menggunakan variasi hijau yang tenang.

## Tabel Pendaftar

Judul bagian diubah menjadi **Perlu diperiksa** dengan deskripsi **Pendaftar terbaru yang masih menunggu verifikasi berkas.** Tautan **Lihat semua** tetap mengarah ke daftar berfilter menunggu verifikasi.

Ketentuan visual:

- Judul bagian memakai Kumbh Sans 700 sekitar 20px.
- Header kolom memakai Inter 12px semi-bold.
- Isi tabel memakai Inter 14px dengan tinggi baris sekitar 64px.
- Nama pendaftar menggunakan bobot 600.
- Nomor pendaftaran tetap menggunakan font monospace.
- Tautan Detail dan Lihat semua memiliki target sentuh minimal 44px serta focus ring yang terlihat.
- Tabel tetap dapat digeser horizontal pada layar sempit; perubahan ini tidak mengubah bentuk data atau jumlah baris.

Empty state menggunakan:

- **Belum ada berkas yang perlu diperiksa.**
- **Semua pendaftar sudah ditindaklanjuti.**

## Aksi Cepat

Judul tetap **Aksi cepat**. Label dan deskripsi diperbarui menjadi:

| Aksi | Deskripsi | Tujuan |
|---|---|---|
| Data Pendaftar | Lihat dan kelola data calon siswa. | `/admin/pendaftar` |
| Unduh Data Excel | Simpan rekap pendaftaran dalam Excel. | `/admin/pendaftar/export` |
| Atur Informasi Publik | Perbarui informasi pada halaman utama. | `/admin/konten` |

Setiap aksi menggunakan tinggi minimum sekitar 68px, ikon SVG 20px dalam bidang hijau muda 40px, label Inter 14px semi-bold, dan deskripsi Inter 12–13px. Hover menggunakan kanvas `#F6F7F5`; focus ring tetap hijau.

## Responsif

- **Mobile:** header bertumpuk, badge berada di bawah deskripsi, kartu statistik satu kolom, tabel sebelum aksi cepat.
- **Tablet:** kartu statistik dapat menjadi tiga kolom ketika ruang mencukupi; area kerja tetap satu kolom sampai breakpoint desktop.
- **Desktop:** tiga kartu sejajar; tabel dan aksi cepat menggunakan rasio dua banding satu.
- Tidak boleh ada overflow horizontal dari halaman; hanya kontainer tabel yang boleh digeser.

## Data dan Error

Query Supabase yang sudah ada tetap menjadi sumber kebenaran untuk Total Pendaftar, Menunggu Verifikasi, Diterima, dan lima pendaftar terbaru. Tidak ada data palsu, perkalian count, atau perubahan schema.

Jika query gagal, dashboard tetap melempar error eksplisit `Gagal memuat data dasbor. Silakan coba lagi.` dan tidak boleh menampilkan angka nol atau empty state palsu.

## Pengujian dan Kriteria Selesai

- Kontrak dashboard memeriksa copy baru, skala tipografi utama, badge tahun ajaran, dan tidak adanya Jalur Siswa.
- Tes mempertahankan kontrak penanganan error Supabase dan target sentuh 44px.
- Seluruh tes proyek dan scoped ESLint lulus.
- Build produksi Next.js berhasil.
- Tampilan desktop dan mobile mempertahankan urutan informasi serta tidak menimbulkan overflow halaman.
- Tidak ada perubahan pada file login, hydration, schema, atau halaman admin lain.
