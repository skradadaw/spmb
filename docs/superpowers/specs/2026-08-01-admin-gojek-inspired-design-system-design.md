# Desain Sistem UI Admin SPMB Terinspirasi Gojek

## Ringkasan

Fase ini menyatukan halaman login admin dan seluruh area admin SPMB SD Plus 3 Al-Muhajirin dalam satu sistem visual light-mode yang modern, ramah, dan operasional. Sistem mengambil inspirasi dari disiplin warna hijau, kontras, dan standardisasi komponen Gojek, tetapi tidak menyalin logo, nama, ilustrasi, font berlisensi, atau susunan halaman Gojek.

Sumber inspirasi resmi:

- Gojek Colors: <https://gojek-design.webflow.io/colors>
- Gojek Design System: <https://gojek-design.webflow.io/design-system>
- Cerita identitas Gojek: <https://www.gojek.com/blog/gojek/info-gojek>

## Subjek, Pengguna, dan Pekerjaan Utama

- Subjek: sistem operasional penerimaan murid baru SD Plus 3 Al-Muhajirin.
- Pengguna utama: panitia sekolah yang memverifikasi berkas, menentukan hasil, mengekspor data, dan memperbarui konten informasi.
- Pekerjaan utama login: memberi akses yang jelas dan aman ke area admin.
- Pekerjaan utama area admin: membantu panitia mengetahui kondisi pendaftaran dan menyelesaikan pekerjaan yang membutuhkan tindakan.

## Cakupan Fase Pertama

Termasuk:

- `/admin/login`
- `/admin`
- `/admin/pendaftar`
- `/admin/pendaftar/[id]`
- `/admin/pendaftar/export`
- `/admin/konten`
- Shell admin: sidebar, header, navigasi mobile, profil, dan logout.

Tidak termasuk:

- Landing page publik.
- Formulir pendaftaran publik.
- Halaman cek status publik.
- Perubahan skema database atau alur bisnis.
- Dark mode.

## Prinsip Desain

1. Hijau menandai tindakan dan kemajuan, bukan memenuhi seluruh layar.
2. Data yang tampil harus nyata dan relevan dengan SPMB; tidak ada nilai uang, angka palsu, atau istilah finansial.
3. Semua teks antarmuka menggunakan Bahasa Indonesia yang langsung dan konsisten.
4. Setiap halaman memiliki satu aksi utama yang jelas.
5. Bentuk membulat digunakan dengan hierarki, bukan pada semua elemen secara berlebihan.
6. Sistem mempertahankan kontras, focus state, dan responsivitas sebagai kualitas dasar.

## Arah Visual dan Elemen Khas

Identitas visual disebut “Jalur Siswa”. Elemen khasnya adalah garis perjalanan dengan node yang mewakili tahap:

`Daftar → Verifikasi → Seleksi → Diterima`

Jalur ini muncul sebagai elemen informatif pada dashboard dan sebagai motif visual yang lebih tenang pada login. Elemen tersebut menggantikan dekorasi finansial dan membuat identitas sesuai dunia penerimaan siswa.

## Token Warna

### Warna inti

| Token | Nilai | Penggunaan |
|---|---:|---|
| `brand-primary` | `#00AA13` | Tombol utama, menu aktif, progress, tautan penting |
| `brand-primary-hover` | `#00880F` | Hover dan pressed state |
| `ink` | `#101820` | Judul, teks utama, elemen kontras tinggi |
| `canvas` | `#F6F7F5` | Background aplikasi |
| `surface` | `#FFFFFF` | Kartu, form, tabel, sidebar |
| `muted` | `#667085` | Deskripsi, metadata, placeholder |

### Warna semantik

- Hijau: terverifikasi, diterima, atau selesai.
- Amber: menunggu.
- Biru: informasi atau perlu perbaikan.
- Merah: gagal, ditolak, atau tindakan berbahaya.

Warna semantik tidak boleh digunakan sebagai dekorasi tanpa makna status.

## Tipografi

- Display dan judul: Kumbh Sans, bobot 700–900.
- Isi, form, tabel, dan navigasi: Inter, bobot 400–600.
- Nomor pendaftaran: keluarga monospace sistem.

Skala:

- Judul login atau halaman utama: `36–48px` bila ruang memungkinkan.
- Judul halaman admin: `28–32px`.
- Judul bagian: `20–24px`.
- Isi utama: `16px`.
- Label dan metadata: `12–14px`.

## Sistem Layout

- Spacing memakai kelipatan 8: `8, 16, 24, 32, 48, 64px`.
- Sidebar desktop: `260px`.
- Lebar konten admin maksimum: `1280px`.
- Konten menggunakan grid 12 kolom pada desktop.
- Kartu utama: radius `20px`.
- Input dan tombol: radius `12px`.
- Badge: pill.
- Maksimal tiga level permukaan: canvas, kartu, dan elemen aktif.
- Desktop menggunakan sidebar tetap; mobile menggunakan drawer.
- Grid menjadi satu kolom pada mobile.
- Aksi utama berada di kanan atas desktop dan tetap mudah dijangkau pada mobile.

## Halaman Login

### Desktop

Login menggunakan dua panel:

```text
┌──────────────────────┬──────────────────────┐
│ Panel hijau sekolah  │ Masuk sebagai admin  │
│ Identitas SPMB       │ Email                │
│ Tahun ajaran         │ Password             │
│ Motif jalur siswa    │ Tombol masuk         │
└──────────────────────┴──────────────────────┘
```

### Mobile

- Form menjadi fokus utama dalam satu kolom.
- Identitas sekolah diringkas dalam header hijau.
- Tidak ada dekorasi yang mengurangi ruang input.

### Aturan

- Hanya satu aksi utama: `Masuk ke Dasbor`.
- Tidak ada identitas “Maglo”.
- Error login menjelaskan bahwa email atau kata sandi tidak sesuai.
- State memuat mencegah pengiriman ganda dan mempertahankan ukuran tombol.
- Input memiliki label terlihat, tinggi minimum `48px`, dan focus ring hijau.

## Shell Admin

### Sidebar

- Menampilkan identitas SD Plus 3 Al-Muhajirin dan tahun ajaran.
- Menu: `Dasbor`, `Pendaftar`, dan `Kelola Konten`.
- Menu aktif memakai background hijau dan teks dengan kontras memadai.
- Logout berada di bagian bawah dan memiliki gaya destruktif yang tertahan.

### Header

- Menampilkan judul halaman dalam Bahasa Indonesia.
- Menyediakan menu mobile, profil panitia, dan tindakan halaman bila diperlukan.
- Pencarian atau notifikasi tidak ditampilkan jika belum memiliki fungsi nyata.
- Theme toggle dihapus karena fase ini light-mode saja.

## Dashboard

- Kartu statistik: `Total Pendaftar`, `Menunggu Verifikasi`, dan `Diterima`.
- Jalur siswa menampilkan jumlah pada setiap tahap.
- Daftar `Perlu Ditindaklanjuti` menampilkan maksimal lima pendaftar yang relevan.
- Quick action: `Lihat Pendaftar`, `Export Excel`, dan `Kelola Konten`.
- Hilangkan `Total balance`, `Total spending`, `Total saved`, nilai dolar, dan `Recent Transaction`.

## Daftar Pendaftar

- Toolbar tunggal memuat pencarian, filter verifikasi, filter penerimaan, dan export.
- Filter aktif tampil sebagai chip hijau muda.
- Desktop menggunakan tabel; mobile menggunakan kartu ringkas.
- Nomor pendaftaran menggunakan monospace.
- Baris atau kartu memiliki aksi `Lihat detail`.
- Header tabel memakai abu-abu muda; tinggi baris sekitar `56px`.

## Detail Pendaftar

- Kolom utama: data siswa, data orang tua atau wali, dan dokumen.
- Panel kanan sticky: status, catatan panitia, dan `Simpan perubahan`.
- Menunggu memakai amber, terverifikasi atau diterima memakai hijau, perlu perbaikan memakai biru, dan tidak diterima memakai merah.
- Tindakan berisiko meminta konfirmasi.

## Kelola Konten

- Kelompok: Jadwal, Syarat, Biaya, FAQ, dan Kontak.
- Setiap kelompok memiliki satu tombol `Simpan`.
- Pesan sukses menyebut tindakan, misalnya `Jadwal berhasil disimpan`.
- Perubahan belum tersimpan memiliki indikator yang jelas.

## Komponen UI

### Tombol

- Primer: hijau solid, tinggi `44–48px`.
- Sekunder: putih dengan border abu-abu.
- Destruktif: merah dan hanya untuk tindakan berbahaya.
- Icon button selalu memiliki accessible name.

### Input

- Tinggi minimum `48px`.
- Label selalu terlihat; placeholder hanya contoh.
- Focus ring hijau terlihat jelas.
- Error diletakkan dekat field dan menjelaskan cara memperbaiki.

### Kartu dan tabel

- Kartu memakai border tipis dan shadow sangat ringan.
- Tabel mengutamakan scan vertikal dan tidak memakai dekorasi yang tidak bermakna.
- Badge hanya untuk status atau filter.

### Ikon

- Gunakan satu keluarga ikon SVG dengan ukuran dan ketebalan konsisten.
- Hapus emoji dekoratif dari navigasi, statistik, dan tabel.

## Data, Loading, Error, dan Empty State

- Data statistik berasal dari Supabase dan tidak digantikan angka simulasi.
- Loading mempertahankan bentuk layout dengan skeleton yang tenang.
- Empty state menjelaskan apa yang kosong dan tindakan berikutnya.
- Error menjelaskan masalah dan tindakan pemulihan.
- Sesi habis mengarahkan pengguna kembali ke login dengan pesan yang jelas.
- Pesan sukses menggunakan nama aksi yang sama dengan tombol pemicunya.

## Gerak dan Interaksi

- Durasi interaksi `150–200ms` untuk hover, drawer, dan feedback.
- Tidak ada animasi ambient terus-menerus pada dashboard.
- `prefers-reduced-motion` harus dihormati.

## Aksesibilitas

- Semua kontrol dapat digunakan dengan keyboard.
- Focus state tidak boleh dihilangkan.
- Kontras teks, tombol, badge, dan error memenuhi kebutuhan baca dasar WCAG AA.
- Label, judul, dan landmark halaman memiliki struktur semantik.
- Ukuran target sentuh minimum mendekati `44px`.

## Pengujian

- Login berhasil dan gagal.
- State loading dan pencegahan submit ganda.
- Sesi habis dan logout.
- Navigasi desktop dan drawer mobile.
- Responsif pada mobile, tablet, dan desktop.
- Keyboard, focus state, dan reduced motion.
- Loading, empty, error, serta data panjang.
- Status dan filter pada daftar pendaftar.
- Simpan perubahan pada detail dan kelola konten.
- Scan source/UI memastikan tidak ada `Maglo`, istilah finansial, nilai dolar palsu, atau dark-mode class yang tersisa dalam area admin.

## Kriteria Selesai

1. Login dan seluruh area admin memakai token, tipografi, spacing, radius, dan komponen yang konsisten.
2. Identitas “Maglo” dan bahasa finansial hilang dari area admin.
3. Semua metrik dashboard menggunakan data SPMB nyata.
4. Seluruh label dan tindakan memakai Bahasa Indonesia.
5. UI light-mode berfungsi pada mobile, tablet, dan desktop.
6. Focus, error, loading, empty state, serta feedback tindakan tersedia dan konsisten.
7. Halaman publik tidak berubah pada fase ini.
