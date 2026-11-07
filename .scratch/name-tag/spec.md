Status: ready-for-agent

# Spec: Name Tag dan Ruang OKB

## Problem Statement

Pada hari OKB, setiap Pendaftar perlu memakai kartu berkalung agar panitia dan penguji bisa memanggil namanya, tahu ruangannya, dan menandai Tes OKB yang sudah diikutinya (Literasi, Numerasi, Tahsin). Saat ini sistem belum bisa membuat kartu itu, sehingga admin harus menyalin nama satu per satu ke Word. Nama yang panjang perlu disingkat secara manual, dan penulisannya mudah berbeda atau salah.

Sistem juga belum mencatat ruangan. Jadwal OKB hanya menyimpan tanggal dan Gelombang OKB, padahal Pendaftar dalam satu Gelombang bisa terbagi ke beberapa ruangan. Admin tidak punya satu tempat untuk mengatur pembagian ruangan, dan panitia di meja registrasi tidak bisa melihat ke ruangan mana anak harus diarahkan setelah Scan Kehadiran.

## Solution

**Ruang OKB**
- Setiap Pendaftar dapat memiliki satu Ruang OKB untuk ketiga Tes OKB.
- Admin mengisinya sekaligus di halaman baru **Name Tag**, atau satu per satu di detail Pendaftar.
- Nama ruangan diketik bebas, dengan saran dari nama yang sudah dipakai.
- Ruang OKB tampil di detail Pendaftar, hasil Scan Kehadiran, dan ekspor admin. Orang tua tidak melihatnya di sistem.
- Ruang OKB dikosongkan ketika Jadwal OKB diubah atau dihapus.

**Cetak Name Tag**
- Hasil unduhan berupa gambar PNG. Admin memasukkannya sendiri ke Word untuk menyesuaikan ukuran dengan holder kalung.
- Cetak sekaligus menghasilkan satu ZIP untuk Pendaftar Terjadwal OKB pada tanggal dan Gelombang yang dipilih.
- Cetak satuan dari detail Pendaftar menghasilkan satu PNG, untuk Pendaftar Terjadwal OKB atau Sudah OKB.
- Pendaftar tanpa Ruang OKB tidak dapat dicetak, dan admin melihat jumlahnya sebelum mengunduh.

**Isi kartu**
- Kartu portrait berjudul "Kartu Peserta" berisi logo sekolah, Tahun Pelajaran, Ruang OKB, nama anak dalam satu baris, tiga kotak stiker berlabel Literasi, Numerasi, dan Tahsin, serta alamat sekolah.
- Nama yang tidak muat disingkat dari akhir mengikuti pola EYD, misalnya `Muhammad Abdurrahman A.R.`.
- Panitia menempelkan stiker bintang di kotak, dan tandanya tidak dicatat di sistem.

## User Stories

### Mengatur Ruang OKB

1. Sebagai admin, saya ingin membuka halaman Name Tag dari menu samping, agar persiapan kartu dan ruangan ada di satu tempat.
2. Sebagai admin, saya ingin membuka halaman Name Tag dari kartu Jadwal OKB terdekat, agar bisa langsung menyiapkan jadwal yang akan datang.
3. Sebagai admin, saya ingin memilih tanggal dan Gelombang OKB, agar hanya melihat Pendaftar Terjadwal OKB pada kelompok itu.
4. Sebagai admin, saya ingin melihat nama dan Ruang OKB setiap Pendaftar di kelompok itu, agar tahu siapa yang sudah dan belum punya ruangan.
5. Sebagai admin, saya ingin mencentang beberapa Pendaftar sekaligus, agar bisa membagi satu Gelombang ke beberapa ruangan dengan cepat.
6. Sebagai admin, saya ingin mencentang semua Pendaftar dalam kelompok itu, agar tidak perlu memilih satu per satu ketika semuanya berada di satu ruangan.
7. Sebagai admin, saya ingin mengisi satu nama ruangan untuk semua Pendaftar yang dicentang, agar pembagian ruangan tersimpan sekaligus.
8. Sebagai admin, saya ingin melihat saran dari nama ruangan yang sudah dipakai, agar satu ruangan tidak tertulis dengan dua cara.
9. Sebagai admin, saya ingin tetap bisa mengetik nama ruangan baru, agar tidak perlu mengelola daftar ruangan terlebih dahulu.
10. Sebagai admin, saya ingin mengganti Ruang OKB yang sudah terisi, agar pembagian ruangan bisa diperbaiki.
11. Sebagai admin, saya ingin mengosongkan Ruang OKB Pendaftar yang dicentang, agar kesalahan pembagian bisa dibatalkan.
12. Sebagai admin, saya ingin mengisi atau mengubah Ruang OKB di detail Pendaftar Terjadwal OKB, agar perubahan untuk satu anak tidak perlu lewat halaman Name Tag.
13. Sebagai admin, saya ingin mengisi atau mengubah Ruang OKB di detail Pendaftar Sudah OKB, agar anak yang sudah dipindai tetapi belum punya ruangan tetap bisa mendapat kartu pengganti.
14. Sebagai admin, saya ingin Ruang OKB dikosongkan ketika Jadwal OKB diubah, agar ruangan dari jadwal lama tidak terbawa ke jadwal baru.
15. Sebagai admin, saya ingin Ruang OKB dikosongkan ketika Jadwal OKB dihapus, agar Pendaftar yang kembali Terverifikasi tidak menyimpan ruangan lama.
16. Sebagai admin, saya ingin Ruang OKB tetap ada saat Batalkan Kehadiran, agar salah scan tidak menghapus pembagian ruangan.
17. Sebagai admin, saya ingin Ruang OKB tetap ada saat Pendaftar Dibatalkan lalu dipulihkan dengan Jadwal OKB yang sama, agar ruangannya tidak perlu diisi ulang.
18. Sebagai admin, saya ingin melihat Ruang OKB dalam ekspor data, agar daftar ruangan bisa dibagikan kepada panitia.

### Mencetak Name Tag

19. Sebagai admin, saya ingin mengunduh satu ZIP untuk tanggal dan Gelombang yang dipilih, agar seluruh kartu bisa disiapkan sebelum hari OKB.
20. Sebagai admin, saya ingin ZIP berisi satu PNG per Pendaftar, agar setiap gambar bisa dimasukkan ke Word dan disesuaikan dengan holder.
21. Sebagai admin, saya ingin nama file memuat Ruang OKB dan nama anak, misalnya `Ruang A - Aisyah Putri.png`, agar file tersusun per ruangan dan mudah dikenali.
22. Sebagai admin, saya ingin dua anak bernama sama di ruangan yang sama tetap mendapat dua file, agar tidak ada kartu yang tertimpa.
23. Sebagai admin, saya ingin melihat jumlah Pendaftar tanpa Ruang OKB sebelum mengunduh, agar tidak ada anak yang terlewat tanpa disadari.
24. Sebagai admin, saya ingin Pendaftar tanpa Ruang OKB tidak ikut diunduh, agar tidak ada kartu dengan ruangan kosong.
25. Sebagai admin, saya ingin melihat jumlah kartu yang akan diunduh, agar bisa mencocokkannya dengan jumlah Pendaftar.
26. Sebagai admin, saya ingin tombol unduh tidak aktif ketika tidak ada kartu yang bisa dibuat, agar tidak mengunduh ZIP kosong.
27. Sebagai admin, saya ingin mencetak satu Name Tag dari detail Pendaftar, agar kartu yang rusak, hilang, atau terlewat bisa diganti.
28. Sebagai admin, saya ingin cetak satuan tersedia untuk Pendaftar Terjadwal OKB dan Sudah OKB, agar kartu tetap bisa diganti setelah Scan Kehadiran.
29. Sebagai admin, saya ingin diminta mengisi Ruang OKB lebih dulu pada cetak satuan, agar kartu tidak dibuat tanpa ruangan.
30. Sebagai admin, saya ingin melihat pesan yang jelas bila pembuatan gambar atau ZIP gagal, agar bisa mencoba lagi.
31. Sebagai admin, saya ingin bisa mengunduh ulang kapan saja, agar perubahan ruangan dan kartu yang hilang bisa ditangani tanpa pencatatan tambahan.

### Isi kartu

32. Sebagai penguji, saya ingin melihat nama anak dalam huruf besar, agar bisa memanggilnya dari jarak dekat.
33. Sebagai panitia, saya ingin melihat Ruang OKB di kartu, agar bisa mengarahkan anak ke ruangan yang benar.
34. Sebagai penguji, saya ingin tiga kotak kecil yang pas untuk stiker bintang, agar tes yang sudah diikuti mudah terlihat.
35. Sebagai penguji, saya ingin setiap kotak berlabel Literasi, Numerasi, atau Tahsin, agar tidak salah menandai tes.
36. Sebagai panitia, saya ingin nama selalu satu baris, agar semua kartu rapi dan seragam.
37. Sebagai panitia, saya ingin nama panjang disingkat dari akhir, agar bagian awal nama tetap terbaca.
38. Sebagai admin, saya ingin data Pendaftar tidak berubah walaupun nama disingkat di kartu, agar dokumen lain tetap memakai nama lengkap.
39. Sebagai admin, saya ingin nama ditampilkan dengan huruf besar-kecil yang rapi walaupun orang tua mengetiknya dengan huruf kapital semua, agar kartu terlihat seragam.
40. Sebagai sekolah, saya ingin kartu memuat logo dan nama sekolah, agar identitasnya jelas.
41. Sebagai panitia, saya ingin kartu tidak memuat tanggal dan Gelombang OKB, agar kartu lama tidak menampilkan jadwal yang sudah berubah.
42. Sebagai penguji, saya ingin kartu tidak memuat Pilihan Kelas, agar penilaian tidak terpengaruh.

### Hari OKB

43. Sebagai panitia di meja registrasi, saya ingin melihat Ruang OKB pada hasil Scan Kehadiran, agar langsung tahu ke mana anak diarahkan.
44. Sebagai panitia, saya ingin melihat Ruang OKB ketika memindai Pendaftar yang sudah tercatat hadir, agar tetap bisa mengarahkan anak yang tersesat atau dipindai ulang.
45. Sebagai panitia, saya ingin ceklis di kartu tidak mengubah Status Pendaftar, agar alur Sudah OKB tetap sama.
46. Sebagai orang tua, saya tidak perlu melakukan apa pun untuk Name Tag, karena kartu disiapkan oleh sekolah.

## Implementation Decisions

### Modul yang dibangun atau diubah

- **Modul Name Tag murni (baru).** Modul ini berisi aturan tanpa akses database maupun canvas, sehingga menjadi seam utama untuk pengujian. Tanggung jawabnya:
  - menormalkan nama ruangan;
  - menyingkat nama, dengan fungsi pengukur lebar teks yang diberikan pemanggil;
  - menentukan siapa yang dapat dicetak pada cetak sekaligus dan cetak satuan;
  - menghitung Pendaftar tanpa Ruang OKB;
  - membuat nama file yang aman dan unik.
- **Penggambar kartu (baru).** Modul browser tipis yang menggambar satu kartu ke canvas dan menghasilkan PNG. Modul ini menerima nama lengkap, Ruang OKB, dan gambar desain kartu. Nama disingkat di dalam modul ini, agar pengukuran dan penggambaran memakai huruf yang sama.
- **Pembuat ZIP (baru).** Modul browser yang mengumpulkan PNG menjadi satu ZIP. Proyek ini belum punya pustaka ZIP, jadi perlu satu dependensi ringan yang berjalan di browser.
- **Server action Ruang OKB (baru).** Satu action menyimpan atau mengosongkan Ruang OKB untuk satu atau banyak Pendaftar.
- **Halaman admin Name Tag (baru).** Berisi pemilihan tanggal dan Gelombang, daftar Pendaftar, pengisian ruangan, dan unduhan ZIP. Halaman ini ditambahkan ke navigasi admin.
- **Modul yang diubah:**
  - repository dan kontrak Pendaftar admin, untuk detail dan ekspor;
  - detail Pendaftar, untuk mengisi Ruang OKB dan cetak satuan;
  - action Scan Kehadiran dan tampilannya, untuk menampilkan Ruang OKB;
  - kartu Jadwal OKB terdekat, untuk menambahkan tautan ke halaman Name Tag.

### Skema

- Tabel `pendaftar` mendapat kolom teks `ruang_okb` yang boleh kosong.
- Trigger database mengosongkan `ruang_okb` ketika `jadwal_okb_tanggal` atau `jadwal_okb_gelombang` benar-benar berubah, mengikuti pola trigger penanda NISN Tidak Sesuai.
- Trigger memakai perbandingan `IS DISTINCT FROM`, sehingga menyimpan ulang jadwal yang sama tidak menghapus ruangan.
- Scan Kehadiran, Batalkan Kehadiran, Dibatalkan, dan pemulihan tidak mengubah kolom jadwal, sehingga Ruang OKB tetap ada.

### Aturan Ruang OKB

- Spasi di awal dan akhir dibuang, dan spasi berurutan dijadikan satu.
- Nama ruangan maksimal 30 karakter, agar muat di kartu dan nama file.
- Nilai kosong berarti mengosongkan Ruang OKB.
- Saran berasal dari nama ruangan milik Pendaftar yang masih Terjadwal OKB dengan tanggal hari ini atau setelahnya.
- Tidak ada tabel atau halaman khusus untuk daftar ruangan.

### Kontrak action

- Masukannya daftar ID Pendaftar dan nama ruangan.
- Action menolak permintaan tanpa sesi admin yang valid.
- Action hanya mengubah Pendaftar berstatus Terjadwal OKB atau Sudah OKB.
- Hasilnya menyebut jumlah Pendaftar yang berhasil diubah. Bila ada yang statusnya sudah berubah, admin melihat pesan dan daftar dimuat ulang.
- Setelah berhasil, halaman admin yang menampilkan data itu divalidasi ulang.

### Pemilihan Pendaftar

- Pilihan tanggal dan Gelombang di halaman Name Tag mencakup Jadwal OKB hari ini dan setelahnya, sama seperti kartu Jadwal OKB terdekat. Pendaftar Tidak Hadir OKB harus dijadwalkan ulang lebih dulu.
- Pendaftar pada kelompok itu ditampilkan urut nama. Yang belum punya Ruang OKB mudah dikenali.
- ZIP mencakup semua Pendaftar Terjadwal OKB pada kelompok itu yang sudah punya Ruang OKB, bukan hanya yang sedang dicentang. Centang hanya dipakai untuk mengisi ruangan.
- Pindahan dan Siswa Baru diperlakukan sama.
- Sistem tidak mencatat kartu yang sudah dicetak.

### Tata letak kartu

- Gambar berupa PNG portrait dengan proporsi 8,5 × 11 cm dan resolusi 300 dpi, sekitar 1004 × 1299 piksel.
- Desain kartu adalah satu gambar dari sekolah yang memenuhi seluruh kartu sampai ke tepi. Sistem hanya menulis nama Ruang OKB dan nama anak di atasnya.
- Urutan isi dari atas ke bawah: judul "KARTU PESERTA", "OBSERVASI KESIAPAN BELAJAR (OKB)", Tahun Pelajaran, logo bulat besar tanpa panel di belakangnya, nama Ruang OKB tanpa tulisan "Ruang OKB", nama anak, tiga kotak stiker, lalu alamat sekolah.
- Label nama tidak menutupi atau menempel pada hewan dan kotak stiker.
- Judul, Tahun Pelajaran, logo, label Tes OKB, dan alamat sudah menyatu di gambar desain, jadi perubahannya memerlukan gambar baru. Tahun Pelajaran di gambar saat ini adalah 2027-2028.
- Bila gambar desain gagal dimuat, kartu tidak dibuat dan admin melihat pesan gagal.
- Nama Ruang OKB yang panjang diperkecil sampai muat di papannya, dengan batas ukuran yang masih terbaca.
- Tampilannya bertema hutan untuk anak: pohon, burung, serta singa, panda, dan rusa yang mengintip dari balik kotak stiker. Kotak stiker berukuran sekitar 1,3 cm dan tetap polos, agar kotak kosong tidak terlihat sudah terisi.
- Kotak hanya berlabel Literasi, Numerasi, dan Tahsin, tanpa kolom paraf atau nilai.
- Kartu tidak memuat Nomor Pendaftaran, Gelombang OKB, tanggal, foto anak, QR, Pilihan Kelas, atau asal sekolah.
- Tidak ada lembar A4 atau garis potong. Penataan cetak dilakukan admin di Word.

### Aturan menyingkat nama

- Nama dirapikan dulu dengan formatter nama yang sudah ada, tanpa mengubah data tersimpan.
- Di kartu, kata berhubung selalu berawal huruf kapital. Formatter bersama menghasilkan `al-Fatih`, sedangkan kartu menulis `Al-Fatih`.
- Ukuran huruf tetap. Nama selalu satu baris.
- Bila nama tidak muat, kata disingkat satu per satu dari kata terakhir ke kata pertama, dan berhenti begitu muat:
  1. `Muhammad Abdurrahman Al-Fatih Ramadhan`
  2. `Muhammad Abdurrahman Al-Fatih R.`
  3. `Muhammad Abdurrahman A.R.`
  4. `Muhammad A.A.R.`
  5. `M.A.A.R.`
- Setiap inisial diikuti titik, dan inisial yang berurutan ditulis tanpa spasi.
- Kata berhubung seperti `Al-Fatih` dihitung satu kata dan menjadi satu inisial.
- `bin` dan `binti` tetap ditulis utuh dan tidak dihitung sebagai kata yang disingkat, misalnya `Ahmad F. bin Y.`.

### Nama file

- Formatnya `<Ruang OKB> - <nama lengkap>.png`, memakai nama lengkap yang tidak disingkat.
- Karakter yang tidak boleh dipakai dalam nama file dibuang, seperti pada nama file Bukti Pendaftaran.
- Bila dua file bernama sama, file berikutnya diberi akhiran seperti `Ruang A - Aisyah Putri (2).png`, dengan urutan yang stabil.
- Nama ZIP memuat tanggal dan Gelombang OKB.

### Keamanan dan visibilitas

- Halaman, data, dan action Name Tag hanya untuk admin.
- Ruang OKB tidak ditambahkan ke data Cek Hasil OKB maupun halaman orang tua lainnya.
- Gambar dan ZIP dibuat di browser admin dan tidak disimpan di server.

### Istilah

- Teks untuk pengguna dan kode baru mengikuti `CONTEXT.md`: **Name Tag**, **Tes OKB**, dan **Ruang OKB**.
- "Kartu Peserta" hanya dipakai sebagai judul yang tercetak di kartu.

## Testing Decisions

Tes yang baik memeriksa perilaku yang terlihat dari luar, bukan cara kode bekerja di dalam. Tes tidak boleh bergantung pada struktur internal modul atau urutan panggilan yang tidak memengaruhi hasil.

**Modul Name Tag murni**
- Penyingkatan bertahap dari akhir nama, termasuk seluruh contoh di spec ini.
- Nama pendek tidak berubah.
- `bin`, `binti`, dan kata berhubung.
- Normalisasi dan batas panjang nama ruangan.
- Syarat cetak per status dan penghitungan Pendaftar tanpa Ruang OKB.
- Nama file unik untuk nama kembar dan karakter terlarang.
- Prior art: tes format nama sekolah dan tes impor Nomor VA.

**Server action Ruang OKB**
- Menolak sesi yang tidak valid.
- Menyimpan banyak Pendaftar sekaligus, dan mengosongkan dengan nilai kosong.
- Tidak mengubah Pendaftar di luar status yang diizinkan.
- Melaporkan kegagalan database dengan pesan yang jelas.
- Prior art: tes action Scan Kehadiran dan simpan Nomor VA.

**Komponen**
- Halaman Name Tag menampilkan kelompok yang dipilih, jumlah kartu, dan jumlah Pendaftar tanpa Ruang OKB, serta menonaktifkan unduhan saat tidak ada kartu.
- Detail Pendaftar hanya menampilkan cetak satuan untuk Terjadwal OKB dan Sudah OKB, dan meminta Ruang OKB bila kosong.
- Hasil Scan Kehadiran menampilkan Ruang OKB.
- Kartu Jadwal OKB terdekat menautkan ke halaman Name Tag.
- Prior art: tes komponen detail Pendaftar, pemindai kehadiran, dan dashboard admin.

**Skema**
- Kolom dan trigger pengosongan Ruang OKB tersedia di skema.
- Prior art: tes skema Supabase pada fitur pendaftaran.

**Ekspor**
- Ruang OKB muncul di ekspor. Prior art: tes repository Pendaftar.

**Pemeriksaan manual**
- Lingkungan tes jsdom tidak punya canvas sungguhan, jadi tampilan gambar tidak diuji otomatis.
- Sebelum dipakai, buka contoh PNG, masukkan ke Word, cetak, dan coba di holder B3. Gunakan nama pendek, nama panjang, dan nama ruangan terpanjang.
- Pastikan juga ZIP terbuka dengan benar di Windows.

## Out of Scope

- Mencatat ceklis Tes OKB atau nilai tes di sistem.
- Mengubah arti Sudah OKB atau Scan Kehadiran.
- Lembar A4, garis potong, atau jendela cetak langsung dari sistem.
- Unduhan dalam format PDF atau Word.
- Mencatat kartu yang sudah dicetak atau sudah dibagikan.
- Foto dan QR pada kartu.
- Tabel atau halaman pengelolaan daftar ruangan, termasuk kapasitas ruangan.
- Ruangan yang berbeda untuk tiap Tes OKB.
- Menampilkan Ruang OKB kepada orang tua di sistem, termasuk di Bukti Pendaftaran dan Cek Hasil OKB.
- Menambahkan penanda khusus pada kartu yang namanya kembar.
- Jadwal OKB massal.

## Further Notes

- Ukuran B1 sampai B4 tidak baku antarsumber. Proporsi 8,5 × 11 cm adalah patokan untuk B3. Kalau holder yang dibeli berbeda, proporsi gambar mudah diubah.
- PNG dari canvas mungkin tidak menyimpan informasi dpi, jadi Word bisa menampilkannya dengan ukuran awal yang tidak sesuai. Ini dapat diterima karena admin memang mengatur ukurannya di Word.
- Bila Jadwal OKB berubah setelah kartu dicetak, kartu lama masih bisa dipakai selama ruangannya sama, karena kartu tidak memuat jadwal. Admin tetap perlu mengisi ulang Ruang OKB di sistem.
- Kartu pengganti tidak menyalin stiker lama, jadi panitia perlu menempelkannya lagi.
- Dua anak bernama sama punya kartu yang sama bila berada di ruangan yang sama. Risiko ini diterima dan ditangani langsung oleh panitia.
