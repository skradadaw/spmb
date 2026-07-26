# Desain Sistem SPMB SD Plus 3 Al-Muhajirin — Tahun Ajaran 2027/2028

Tanggal: 26 Juli 2026
Status: Disetujui pengguna (brainstorming selesai)

## 1. Tujuan

Website Sistem Penerimaan Murid Baru (SPMB) untuk SD Plus 3 Al-Muhajirin tahun ajaran
2027/2028. Orang tua/wali calon siswa dapat melihat informasi pendaftaran, mengisi
formulir pendaftaran secara online (tanpa membuat akun), dan mengecek status
pendaftaran. Panitia (admin) dapat memverifikasi pendaftar, menetapkan status
penerimaan, mengekspor data ke Excel, dan mengelola konten halaman informasi.

Tampilan responsive dengan pendekatan mobile-first — mayoritas pengguna diasumsikan
mengakses lewat HP.

## 2. Teknologi

- **Next.js** (App Router, TypeScript) + **Tailwind CSS** — seluruh halaman publik dan admin.
- **Supabase** (free tier):
  - PostgreSQL — data pendaftar, dokumen, dan konten landing page.
  - Storage — bucket privat untuk file dokumen upload.
  - Auth — login admin (satu akun panitia, email + password).
- **Deploy**: Vercel (free tier), otomatis dari repository GitHub.
- Validasi data dengan **Zod** (dipakai di sisi klien dan server).
- Export Excel dengan pustaka pembuat `.xlsx` di sisi server (mis. `exceljs`).

## 3. Struktur Halaman

### Halaman publik

| Rute | Isi |
|---|---|
| `/` | Landing page: hero SPMB 2027/2028, jadwal & alur pendaftaran, syarat & biaya, FAQ, kontak panitia, tombol menonjol "Daftar Sekarang". |
| `/daftar` | Form pendaftaran wizard 3 langkah: ① data calon siswa → ② data orang tua/wali → ③ upload dokumen. |
| `/daftar/sukses` | Bukti pendaftaran: nomor pendaftaran, ringkasan data, tombol cetak (gaya cetak khusus, bisa disimpan sebagai PDF lewat browser). |
| `/cek-status` | Input nomor pendaftaran + tanggal lahir → tampil nama, status verifikasi, status penerimaan, dan catatan admin. |

### Halaman admin (diproteksi login)

| Rute | Isi |
|---|---|
| `/admin/login` | Login akun panitia. |
| `/admin` | Dasbor ringkas: total pendaftar, jumlah belum diverifikasi, jumlah diterima. |
| `/admin/pendaftar` | Tabel pendaftar: pencarian, filter status, tombol export Excel (mengikuti filter aktif). |
| `/admin/pendaftar/[id]` | Detail pendaftar + preview dokumen (signed URL), ubah status verifikasi & penerimaan, isi catatan untuk pendaftar. |
| `/admin/konten` | Edit konten landing page: jadwal, syarat, biaya, FAQ, kontak. |

## 4. Struktur Data

### Tabel `pendaftar`

- `id` (uuid, primary key)
- `nomor_pendaftaran` (unik, format `SPMB-2728-0001`, berurutan, dibuat atomik lewat sequence database)
- Data calon siswa: `nama_lengkap`, `nik` (unik), `tempat_lahir`, `tanggal_lahir`,
  `jenis_kelamin`, `alamat`, `asal_tk` (opsional)
- Data ayah: `nama_ayah`, `pekerjaan_ayah`, `pendidikan_ayah`
- Data ibu: `nama_ibu`, `pekerjaan_ibu`, `pendidikan_ibu`
- Data wali (opsional): `nama_wali`, `pekerjaan_wali`
- Kontak: `no_whatsapp`
- `status_verifikasi`: `menunggu` (default) | `terverifikasi` | `perlu_perbaikan`
- `status_penerimaan`: `menunggu` (default) | `diterima` | `tidak_diterima`
- `catatan_admin` (teks, ditampilkan di halaman cek status)
- `created_at`, `updated_at`

### Tabel `dokumen`

- `id`, `pendaftar_id` (foreign key)
- `jenis`: `kartu_keluarga` | `akta_kelahiran` | `pas_foto`
- `path_storage` (lokasi file di bucket privat)
- Batasan file: JPG/PNG/PDF, maksimal 2 MB per file, diperiksa di server.

### Tabel `konten`

- Menyimpan isi landing page yang bisa diedit admin, per seksi (key + isi JSON
  terstruktur): `jadwal` (daftar tahapan + tanggal), `syarat` (daftar persyaratan),
  `biaya` (daftar rincian biaya), `faq` (daftar tanya-jawab), `kontak` (nomor
  WhatsApp/telepon panitia, alamat).
- Landing page membaca tabel ini saat dirender sehingga perubahan admin langsung tampil.

## 5. Alur Data

### Pendaftaran

1. Wizard 3 langkah; validasi per langkah di browser (pesan error bahasa Indonesia).
   Data langkah sebelumnya disimpan di state klien sehingga tidak hilang saat berpindah
   langkah.
2. Submit akhir → server: validasi ulang seluruh data dengan skema Zod, cek NIK belum
   terdaftar (tolak pendaftaran ganda dengan pesan jelas), upload dokumen ke bucket
   privat, buat nomor pendaftaran dari sequence, simpan dalam satu transaksi.
3. Jika ada langkah server yang gagal, tidak boleh ada data setengah jadi: transaksi
   dibatalkan, file yang terlanjur terupload dibersihkan, pengguna melihat pesan ramah
   dan bisa mencoba lagi.
4. Sukses → redirect ke halaman bukti pendaftaran.

### Cek status

- Input nomor pendaftaran + tanggal lahir; keduanya harus cocok.
- Respons hanya berisi: nama siswa, status verifikasi, status penerimaan, catatan
  admin. Data lain tidak pernah diekspos ke publik.

### Admin

- Login Supabase Auth; seluruh rute `/admin/*` diproteksi middleware.
- Preview dokumen memakai signed URL berumur pendek.
- Export Excel dibuat di server (`.xlsx`) berisi semua kolom pendaftar + status,
  sesuai filter yang aktif di tabel.

## 6. Keamanan

- Row Level Security aktif: tabel `pendaftar`, `dokumen`, dan bucket dokumen tidak
  dapat diakses langsung dari browser; semua operasi lewat kode server (service role
  hanya di server).
- Tabel `konten` boleh dibaca publik (isinya memang untuk landing page), tulis hanya
  oleh admin.
- Batas ukuran dan tipe file diverifikasi di server, bukan hanya di browser.
- Tidak ada data pribadi di URL/query string.

## 7. Tampilan (Mobile-First)

- Semua halaman didesain untuk layar HP dulu, menyesuaikan ke tablet/desktop lewat
  breakpoint Tailwind.
- Form wizard satu kolom, tombol besar mudah disentuh, indikator langkah 1-2-3,
  upload dokumen langsung dari kamera/galeri HP.
- Landing page: seksi bertumpuk vertikal, navigasi sederhana, tombol "Daftar
  Sekarang" menonjol.
- Tabel admin di layar sempit berubah menjadi tampilan kartu.
- Halaman bukti pendaftaran memiliki gaya cetak khusus (print stylesheet).
- Warna utama: hijau khas lembaga Al-Muhajirin (mudah diganti bila ada pedoman warna
  resmi sekolah).

## 8. Pengujian

- **Unit test**: skema validasi form (Zod), format & pembuatan nomor pendaftaran,
  logika pemeriksaan NIK ganda.
- **Test integrasi**: alur submit pendaftaran (sukses, NIK ganda, file terlalu
  besar/tipe salah) dan cek status (cocok, tidak cocok).
- **Checklist manual** di browser (HP & desktop): daftar → bukti → cek status →
  login admin → verifikasi → ubah status penerimaan → export Excel → edit konten
  landing.

## 9. Di Luar Cakupan (YAGNI)

- Notifikasi WhatsApp/email otomatis.
- Multi-akun admin atau pembedaan peran.
- Pembayaran online.
- Jalur pendaftaran ganda (reguler/prestasi/afirmasi) — satu jalur saja.
- Login/akun untuk pendaftar.

Keputusan-keputusan ini bisa ditambahkan belakangan tanpa mengubah arsitektur.
