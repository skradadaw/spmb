# Desain Halaman Depan Informasi SPMB 2027/2028

## Ringkasan

Halaman depan SD Plus 3 Al-Muhajirin akan diubah menjadi landing page pendaftaran terpandu. Halaman membantu orang tua memahami jadwal, pembayaran, pilihan kelas, cicilan, diskon, dan dokumen yang perlu disiapkan sebelum membuka formulir.

Tampilan mengikuti bahasa visual halaman formulir pendaftaran: latar hijau pastel, kartu putih membulat, aksen hijau utama, tipografi Plus Jakarta Sans, serta dekorasi sekolah dasar yang ringan. Informasi tetap hardcoded agar mudah diperbarui langsung di kode ketika gelombang atau biaya berubah.

## Tujuan

- Menampilkan informasi terpenting tanpa membuat orang tua membaca tabel gambar yang padat.
- Memudahkan pengguna membandingkan biaya kelas Takhossus dan Reguler.
- Menjelaskan rekening, jadwal cicilan, diskon, dan persyaratan sebelum pendaftaran.
- Mengarahkan pengguna menuju `/pendaftaran` melalui CTA yang jelas.
- Menjaga konsistensi visual dan tahun ajaran antara halaman depan dan formulir.

## Ruang Lingkup

Pekerjaan mencakup:

- Mendesain ulang halaman depan publik.
- Menambahkan interaksi salin nomor rekening.
- Mempertahankan tiga keunggulan sekolah yang sudah ada.
- Mengoreksi tahun ajaran pada halaman formulir menjadi 2027/2028.

Pekerjaan tidak mencakup:

- Backend atau CMS untuk mengelola gelombang dan biaya.
- Gelombang pendaftaran kedua.
- Perubahan pada alur atau field formulir pendaftaran.
- Pembayaran daring atau verifikasi transfer otomatis.

## Data Resmi yang Ditampilkan

### Jadwal

- Tahun ajaran: 2027/2028.
- Gelombang 1: 1 September–10 Oktober 2026.
- Tes OKB Gelombang 1: 20 Oktober 2026.

### Pembayaran OKB

- Biaya OKB: Rp370.000.
- Bank: Bank Muamalat.
- Nomor rekening: 1060017434.
- Pemilik rekening tidak ditampilkan karena belum diberikan.

### Rincian Biaya

| Iuran | Takhossus | Reguler |
| --- | ---: | ---: |
| Infak rutin bulanan | Rp620.000 | Rp620.000 |
| Kelas Takhossus bulanan | Rp100.000 | — |
| Sarana dan prasarana | Rp2.500.000 | Rp2.500.000 |
| Kegiatan kesiswaan | Rp2.050.000 | Rp2.050.000 |
| Buku Lail, Kalender, dan Terbitan Muhajirin | Rp250.000 | Rp250.000 |
| Seragam sekolah dan atribut | Rp1.550.000 | Rp1.550.000 |
| Uang bangunan | Rp3.500.000 | Rp3.500.000 |
| Infak masjid | Rp100.000 | Rp100.000 |
| Jumlah total | Rp10.670.000 | Rp10.570.000 |

Kelas Takhossus dijelaskan sebagai program bilingual dan tahfidz. Seragam dan atribut mencakup seragam pramuka, merah putih, kotak-kotak, batik biru, pangsi/celana sarung untuk laki-laki, kebaya untuk perempuan, seragam olahraga, topi dua buah, dasi, tiga pasang kaos kaki, kerudung, peci dan sarung, kacu, ring, serta badge.

Catatan biaya menyatakan bahwa rincian registrasi belum termasuk buku paket.

### Jadwal Pembayaran

| Tahap | Waktu | Takhossus | Reguler |
| --- | --- | ---: | ---: |
| I | Satu minggu setelah dinyatakan lulus (30%) | Rp3.201.000 | Rp3.171.000 |
| II | Satu bulan setelah pembayaran pertama (40%) | Rp4.268.000 | Rp4.228.000 |
| III | Pembayaran sebelum masuk (30%) | Rp3.201.000 | Rp3.171.000 |

### Diskon Uang Bangunan

- Diskon 10% untuk prestasi tingkat kabupaten, adik/kakak satu jenjang Yayasan Al-Muhajirin, atau pelunasan sesuai bulan Tes OKB.
- Diskon 30% untuk alumni Al-Muhajirin atau prestasi tingkat provinsi.
- Diskon 50% untuk prestasi tingkat nasional.

### Persyaratan Pendaftaran

- Fotokopi akta lahir.
- Fotokopi kartu keluarga.
- Nomor NISN.
- Pas foto ukuran 3×4.

## Arsitektur Halaman

Urutan konten halaman:

1. Header berisi identitas sekolah dan CTA “Daftar Sekarang”.
2. Hero berisi status pendaftaran, tahun ajaran, proposisi sekolah, CTA utama, dan tautan ke informasi.
3. Ringkasan Gelombang 1, Tes OKB, dan biaya OKB.
4. Kartu rekening Bank Muamalat dengan tombol salin.
5. Perbandingan biaya kelas Takhossus dan Reguler.
6. Jadwal cicilan dan informasi diskon.
7. Checklist persyaratan pendaftaran.
8. Tiga kartu keunggulan sekolah: kurikulum, tenaga pendidik, dan fasilitas.
9. CTA penutup menuju formulir.
10. Footer.

Pada layar ponsel, konten disusun dalam satu kolom. Tabel biaya berubah menjadi penyajian responsif yang mempertahankan hubungan antara nama iuran dan nominal tanpa memaksa pengguna membaca teks yang terpotong.

## Komponen dan Batas Tanggung Jawab

- `Header`: identitas sekolah, navigasi dalam halaman, dan CTA pendaftaran.
- `Hero`: pesan utama, status pendaftaran, tahun ajaran, serta CTA.
- `ImportantDates`: ringkasan periode Gelombang 1, tanggal tes, dan biaya OKB.
- `PaymentAccount`: nama bank, nomor rekening, dan status interaksi salin.
- `FeeComparison`: rincian serta total biaya Takhossus dan Reguler.
- `InstallmentSchedule`: tiga tahap pembayaran untuk kedua pilihan kelas.
- `DiscountInfo`: kelompok diskon 10%, 30%, dan 50% beserta kriterianya.
- `RequirementChecklist`: dokumen dan data yang harus disiapkan.
- `SchoolHighlights`: tiga keunggulan sekolah yang telah ada.
- `FinalCTA`: ajakan terakhir menuju formulir pendaftaran.

Data statis dipisahkan dari markup melalui konstanta terstruktur di modul halaman atau modul data khusus. Komponen interaktif dibatasi pada bagian yang membutuhkan Clipboard API agar sebagian besar halaman tetap dapat dirender sebagai Server Component.

## Bahasa Visual

- Font: Plus Jakarta Sans dari root layout.
- Warna utama: hijau `#00AA13`, dengan hijau gelap untuk gradasi bagian penting.
- Latar: gradasi hijau sangat muda menuju putih atau abu-abu muda.
- Permukaan: kartu putih, border abu-abu tipis, sudut membulat besar, dan bayangan lembut.
- Aksen: amber, biru langit, dan merah muda dalam intensitas rendah.
- Ikon: Lucide, digunakan untuk membantu pemindaian kategori informasi.
- Gerak: transisi hover dan kemunculan ringan; preferensi `prefers-reduced-motion` dihormati.

## Interaksi dan Penanganan Kegagalan

- CTA membuka `/pendaftaran` melalui navigasi Next.js.
- Tombol salin mencoba menulis `1060017434` melalui Clipboard API.
- Setelah berhasil, label tombol berubah sementara menjadi “Berhasil disalin”.
- Jika Clipboard API tidak tersedia atau gagal, nomor rekening tetap dapat dipilih dan disalin manual; halaman tidak menampilkan status berhasil yang keliru.
- Tidak ada pengambilan data jaringan baru, sehingga halaman tidak membutuhkan loading state atau error state data.

## Aksesibilitas

- Hierarki heading berurutan dan landmark semantik digunakan.
- Tombol serta tautan memiliki label yang menjelaskan tujuannya.
- Kontras warna teks dan kontrol memenuhi keterbacaan pada latar terang maupun hijau.
- Area sentuh kontrol cukup besar pada ponsel.
- Informasi warna selalu disertai teks; warna tidak menjadi satu-satunya pembeda kelas atau status.
- Tabel memakai header kolom yang jelas atau pola kartu responsif dengan label eksplisit.
- Status salin disampaikan melalui area status yang dapat dikenali teknologi bantu.

## Verifikasi

- Menjalankan ESLint dan build produksi.
- Memastikan semua tanggal, nominal, persentase, rekening, dan persyaratan sesuai spesifikasi.
- Memeriksa tampilan pada lebar ponsel, tablet, dan desktop.
- Memastikan tabel tidak menyebabkan overflow yang tidak terkendali.
- Menguji tombol salin pada jalur berhasil dan gagal.
- Memastikan seluruh CTA menuju `/pendaftaran`.
- Memastikan tahun ajaran pada halaman depan dan formulir sama-sama 2027/2028.
- Memeriksa fokus keyboard, hierarki heading, label kontrol, dan reduced motion.

## Kriteria Penerimaan

- Orang tua dapat menemukan jadwal Gelombang 1, Tes OKB, biaya OKB, dan rekening tanpa membuka halaman lain.
- Seluruh rincian biaya, cicilan, diskon, dan persyaratan tampil lengkap serta mudah dibaca.
- Takhossus dijelaskan sebagai program bilingual dan tahfidz.
- Tampilan konsisten dengan halaman formulir dan responsif pada ponsel.
- Keunggulan sekolah lama tetap tersedia.
- Tidak ada perubahan pada proses pengiriman formulir pendaftaran.
