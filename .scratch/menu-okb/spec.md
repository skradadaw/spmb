Status: ready-for-agent

# Spec: Menu OKB

## Problem Statement

Pekerjaan admin seputar OKB tersebar di beberapa tempat. Name Tag dan Scan Kehadiran masing-masing menjadi item sidebar, sedangkan gambaran Jadwal OKB hanya ada sebagai kartu di Ringkasan. Admin harus berpindah-pindah menu untuk menyiapkan dan menjalankan satu hari OKB, dan sidebar makin panjang setiap kali ada fitur OKB baru.

Kartu Jadwal OKB terdekat juga tidak cukup sebagai gambaran jadwal:

- Kartu hanya memuat empat tanggal terdekat.
- Kartu hanya menghitung Pendaftar Terjadwal OKB. Pada hari OKB, angkanya terus turun setiap kali Scan Kehadiran berhasil, dan tanggalnya hilang setelah semua Pendaftar pada tanggal itu tercatat hadir.

## Solution

Sidebar dan menu mobile hanya punya satu item **OKB**, menggantikan item Name Tag dan Scan Kehadiran. Item itu membuka halaman dengan tiga tab, dan setiap tab punya alamat sendiri:

| Tab | Alamat | Isi |
|---|---|---|
| **Jadwal** (tab pembuka) | `/admin/okb` | Tampilan baru, baca-saja |
| **Name Tag** | `/admin/okb/name-tag` | Halaman Name Tag yang sudah ada |
| **Scan Kehadiran** | `/admin/okb/scan` | Halaman Scan Kehadiran yang sudah ada |

Alamat lama dialihkan otomatis ke alamat baru, dan parameternya tetap dibawa.

**Tab Jadwal** menampilkan tanggal hari ini dan seterusnya, dengan jumlah Pendaftar Terjadwal OKB dan Sudah OKB per Gelombang OKB. Pada hari OKB, tampilannya misalnya "12 hadir dari 30", dan tanggalnya tetap ada setelah semua Pendaftar tercatat hadir. Dari tab ini admin dapat membuka Name Tag, Data Pendaftar, Scan Kehadiran pada tanggal hari ini, dan daftar Tidak Hadir OKB.

Pengumuman tetap menjadi menu sendiri. Aksi untuk satu Pendaftar tetap di Detail Pendaftar.

## User Stories

### Navigasi

1. Sebagai admin, saya ingin satu item OKB di sidebar, agar semua pekerjaan per tanggal dan Gelombang OKB ada di satu tempat.
2. Sebagai admin yang memakai HP, saya ingin item OKB yang sama di menu mobile, agar navigasinya sama di semua perangkat.
3. Sebagai admin, saya ingin item Name Tag dan Scan Kehadiran tidak lagi muncul di sidebar, agar sidebar tetap ringkas.
4. Sebagai admin, saya ingin item OKB terlihat aktif pada ketiga tab, agar saya tahu sedang berada di menu mana.
5. Sebagai admin, saya ingin melihat tab yang sedang aktif, agar saya tahu sedang mengerjakan bagian yang mana.
6. Sebagai admin, saya ingin urutan tab Jadwal, Name Tag, lalu Scan Kehadiran, agar urutannya mengikuti alur kerja menuju hari OKB.
7. Sebagai admin, saya ingin menu OKB selalu terbuka di tab Jadwal, agar halamannya tidak berubah sendiri dan kamera tidak meminta izin tanpa diduga.
8. Sebagai admin, saya ingin setiap tab punya alamat sendiri, agar tab bisa dibuka langsung, disimpan, dan dimuat ulang tanpa kembali ke tab pembuka.
9. Sebagai admin, saya ingin bookmark Name Tag dan Scan Kehadiran lama tetap berfungsi, agar pintasan di HP tidak rusak.
10. Sebagai admin, saya ingin tanggal dan Gelombang OKB pada tautan Name Tag lama tetap terbawa setelah dialihkan, agar kelompok yang sama tetap terbuka.
11. Sebagai admin, saya ingin menu Pengumuman tetap terpisah, agar urusan Surat Penerimaan dan Nomor VA tidak bercampur dengan pelaksanaan OKB.

### Tab Jadwal

12. Sebagai admin, saya ingin melihat semua tanggal OKB hari ini dan seterusnya, agar tidak terbatas pada empat tanggal terdekat.
13. Sebagai admin, saya ingin tanggal diurutkan dari yang terdekat, agar persiapan berikutnya terlihat lebih dulu.
14. Sebagai admin, saya ingin melihat Gelombang OKB pada setiap tanggal, agar tahu kelompok yang dijadwalkan pada hari itu.
15. Sebagai admin, saya ingin melihat jumlah Pendaftar per Gelombang OKB dan per tanggal, agar bisa menyiapkan ruangan dan panitia.
16. Sebagai admin pada hari OKB, saya ingin melihat jumlah Pendaftar yang sudah hadir dari seluruh jumlahnya, agar tahu perkembangan kehadiran.
17. Sebagai admin pada hari OKB, saya ingin tanggal hari ini tetap tampil setelah semua Pendaftar tercatat hadir, agar saya tahu semuanya sudah hadir.
18. Sebagai admin, saya ingin tanggal hari ini mudah dikenali, agar langsung tahu jadwal yang sedang berjalan.
19. Sebagai admin pada hari OKB, saya ingin tombol Scan Kehadiran pada tanggal hari ini, agar bisa langsung memindai dari tab pembuka.
20. Sebagai admin, saya ingin tombol Scan Kehadiran tidak muncul pada tanggal lain, agar tidak mengira scan berlaku untuk tanggal itu.
21. Sebagai admin, saya ingin tautan Name Tag per Gelombang OKB, agar kelompok yang tepat langsung terbuka.
22. Sebagai admin, saya ingin tautan Name Tag tidak muncul pada Gelombang OKB yang semua Pendaftarnya sudah hadir, agar tidak diarahkan ke kelompok lain.
23. Sebagai admin, saya ingin tautan ke Data Pendaftar per Gelombang OKB, agar bisa melihat dan menangani setiap Pendaftarnya.
24. Sebagai admin, saya ingin tautan ke daftar Tidak Hadir OKB beserta jumlahnya bila ada, agar Pendaftar dari tanggal yang sudah lewat tidak terlupakan.
25. Sebagai admin, saya ingin tautan Tidak Hadir OKB tidak muncul bila jumlahnya nol, agar halaman tidak menampilkan hal yang tidak perlu ditindaklanjuti.
26. Sebagai admin, saya ingin tab Jadwal tidak menampilkan tanggal yang sudah lewat, agar fokus pada jadwal yang masih berjalan.
27. Sebagai admin, saya ingin pesan yang jelas bila belum ada Jadwal OKB mendatang, agar tidak mengira halamannya rusak.
28. Sebagai admin, saya ingin pesan yang jelas bila data Jadwal OKB gagal dimuat, agar tahu perlu memuat ulang, bukan mengira jadwalnya kosong.
29. Sebagai admin, saya ingin Pendaftar yang sudah Diterima, Ditolak, atau Dibatalkan tidak dihitung, agar angka hanya mencerminkan Pendaftar yang masih menunggu atau sedang mengikuti OKB.
30. Sebagai admin, saya ingin angka tab Jadwal diperbarui setelah Scan Kehadiran, Batalkan Kehadiran, atau perubahan Jadwal OKB, agar tidak melihat angka lama.
31. Sebagai admin, saya ingin Pendaftar yang Batalkan Kehadiran dihitung kembali sebagai Terjadwal OKB pada tanggal yang sama, agar salah scan tidak mengubah total hari itu.

### Name Tag dan Scan Kehadiran

32. Sebagai admin, saya ingin tab Name Tag berfungsi sama seperti halaman Name Tag sekarang, agar pemindahan menu tidak mengubah cara kerja saya.
33. Sebagai admin, saya ingin memilih tanggal dan Gelombang OKB di tab Name Tag tanpa keluar dari tab itu, agar alamat dan tab aktifnya tetap benar.
34. Sebagai admin, saya ingin tab Scan Kehadiran berfungsi sama seperti halaman Scan Kehadiran sekarang, agar kebiasaan hari OKB tidak berubah.
35. Sebagai admin, saya ingin kamera berhenti ketika saya pindah dari tab Scan Kehadiran, agar kamera tidak tetap menyala di latar belakang.
36. Sebagai admin yang belum masuk, saya ingin diarahkan ke halaman login pada setiap tab dan alamat lama, agar data OKB tetap terlindungi.

### Ringkasan dan Detail Pendaftar

37. Sebagai admin, saya ingin kartu Jadwal OKB terdekat tetap ada di Ringkasan, agar jadwal terdekat langsung terlihat setelah masuk.
38. Sebagai admin, saya ingin tautan "Lihat semua" di kartu itu membuka tab Jadwal, agar gambaran lengkapnya ada di satu tempat.
39. Sebagai admin, saya ingin tombol Scan Kehadiran dan tautan Name Tag di kartu itu membuka tab yang sesuai, agar tidak melewati pengalihan.
40. Sebagai admin, saya ingin kartu tugas di Ringkasan tetap membuka Data Pendaftar yang tersaring, agar alur tindak lanjut per Pendaftar tidak berubah.
41. Sebagai admin, saya ingin menetapkan dan menghapus Jadwal OKB tetap dari Detail Pendaftar, agar aksi per Pendaftar tetap memperhatikan Status Pendaftar.
42. Sebagai admin, saya ingin Ruang OKB satuan, cetak satu Name Tag, Batalkan Kehadiran, dan Keputusan Penerimaan tetap di Detail Pendaftar, agar semua aksi untuk satu Pendaftar ada di satu tempat.
43. Sebagai admin, saya ingin filter Gelombang OKB dan Tidak Hadir OKB tetap di Data Pendaftar, agar cara menyaring Pendaftar tidak berubah.

## Implementation Decisions

### Modul yang dibangun atau diubah

- **Navigasi admin.** Item Name Tag dan Scan Kehadiran diganti satu item OKB. Bagian aktif pada navigasi digabung menjadi satu nilai untuk semua alamat di bawah `/admin/okb`. Menu mobile memakai daftar navigasi yang sama, sehingga ikut berubah.
- **Kerangka menu OKB (baru).** Layout bersarang untuk semua alamat di bawah `/admin/okb`, berisi judul halaman OKB dan navigasi tab.
  - Tab berupa tautan biasa yang ditandai `aria-current`, bukan tab di sisi klien, karena setiap tab punya alamat sendiri.
  - Tab Jadwal hanya aktif pada alamat `/admin/okb` secara persis.
  - Setiap tab tetap punya deskripsi sendiri.
- **Penyusun data tab Jadwal (baru).** Fungsi murni tanpa akses database yang menerima baris Pendaftar dan menghasilkan daftar tanggal, per Gelombang OKB, beserta jumlah Terjadwal OKB, jumlah Sudah OKB, dan totalnya. Modul ini menjadi seam pengujian utama untuk aturan tab Jadwal.
- **Repository tab Jadwal (baru).** Membaca Pendaftar untuk tab Jadwal dan jumlah Tidak Hadir OKB. Polanya mengikuti repository Name Tag.
- **Halaman tab Jadwal (baru).** Halaman server yang memeriksa sesi admin, memuat data, dan menampilkannya, termasuk keadaan kosong dan gagal dimuat.
- **Halaman Name Tag dan Scan Kehadiran.** Rute dipindahkan ke alamat baru tanpa mengubah fiturnya. Judul halaman digantikan oleh kerangka menu OKB. Setiap halaman tetap memeriksa sesi admin sendiri.
- **Pembuat alamat Name Tag.** Mengarah ke alamat baru. Pemilih kelompok Name Tag harus tetap berada di tab Name Tag.
- **Kartu Jadwal OKB terdekat.** Data dan batas empat tanggalnya tidak berubah. Hanya tautannya yang diarahkan ke alamat baru.
- **Konfigurasi Next.js.** Menambahkan pengalihan alamat lama.

### Aturan tab Jadwal

- Pendaftar yang dihitung berstatus Terjadwal OKB atau Sudah OKB, dengan tanggal Jadwal OKB hari ini atau setelahnya menurut waktu Jakarta.
- Jumlah hadir adalah jumlah Sudah OKB. Totalnya adalah Terjadwal OKB ditambah Sudah OKB.
- Pendaftar yang sudah Diterima, Ditolak, atau Dibatalkan tidak dihitung, walaupun tanggal Jadwal OKB-nya masih tersimpan. Karena itu, total hari itu bisa turun bila keputusan dimasukkan pada hari yang sama. Ini dapat diterima karena Keputusan Penerimaan biasanya dibuat setelah hari OKB.
- Pendaftar dengan Gelombang OKB yang tidak valid dilewati, sama seperti pada repository Name Tag.
- Tanggal diurutkan dari yang terdekat, lalu Gelombang OKB dari yang terkecil.
- Tanggal selain hari ini menampilkan jumlah Terjadwal OKB saja, sehingga Pendaftar yang ditandai hadir lebih awal dari Detail Pendaftar tidak ikut dihitung. Tanggal hari ini menampilkan jumlah hadir dari totalnya.
- Tombol Scan Kehadiran hanya muncul pada tanggal hari ini.
- Tautan Tidak Hadir OKB memakai filter yang sudah ada di Data Pendaftar dan hanya muncul bila jumlahnya lebih dari nol.

### Tautan dari tab Jadwal

- **Name Tag:** membuka tanggal dan Gelombang OKB yang tepat. Tautan hanya muncul bila Gelombang itu masih punya Pendaftar Terjadwal OKB, karena halaman Name Tag hanya memuat status itu dan akan membuka kelompok lain bila kelompok yang diminta tidak ada.
- **Data Pendaftar:** memakai filter Gelombang OKB saja. Filter ini diperluas agar mencakup Pendaftar Terjadwal OKB dan Sudah OKB, sehingga Pendaftar yang sudah hadir tetap terlihat. Perluasan ini juga berlaku saat admin memakai filter Gelombang OKB langsung di Data Pendaftar. Data Pendaftar belum punya filter tanggal, jadi daftarnya dapat memuat Pendaftar dari tanggal lain dalam Gelombang yang sama.

### Pengalihan alamat

- `/admin/name-tag` dialihkan ke `/admin/okb/name-tag`, dan `/admin/scan` ke `/admin/okb/scan`.
- Pengalihan memakai `redirects` pada konfigurasi Next.js, yang meneruskan parameter alamat secara otomatis. Lihat panduan `redirects` di dokumentasi Next.js dalam `node_modules` sebelum menulisnya.
- Pengalihan bersifat sementara (307), karena browser menyimpan pengalihan permanen tanpa batas waktu sehingga lebih sulit dibalik.

### Validasi ulang data

- Action yang mengubah kehadiran, Jadwal OKB, atau Status Pendaftar sehingga memengaruhi tab Jadwal harus memvalidasi ulang `/admin/okb`, termasuk Scan Kehadiran dan Batalkan Kehadiran.
- Action Ruang OKB memvalidasi ulang alamat Name Tag yang baru.

### Keamanan

- Pengalihan terjadi sebelum halaman dibuka, lalu halaman tujuan memeriksa sesi admin. Pengguna tanpa sesi berakhir di halaman login.
- Tab Jadwal hanya menampilkan jumlah agregat dan hanya untuk admin.

### Skema

- Tidak ada perubahan skema. Fungsi ringkasan untuk kartu Jadwal OKB terdekat juga tidak diubah.

### Istilah

- Teks untuk pengguna dan kode baru mengikuti `CONTEXT.md`. "Menu OKB" adalah istilah navigasi, jadi glosarium tidak berubah.

## Testing Decisions

Tes yang baik memeriksa perilaku yang terlihat dari luar: apa yang ditampilkan, ke mana tautan mengarah, dan apa yang dihasilkan fungsi. Tes tidak boleh bergantung pada struktur internal modul.

**Penyusun data tab Jadwal**
- Mengelompokkan per tanggal dan Gelombang OKB dengan urutan yang stabil.
- Menghitung Terjadwal OKB, Sudah OKB, dan total, termasuk kelompok yang semua Pendaftarnya sudah hadir.
- Melewati Gelombang OKB yang tidak valid.
- Prior art: tes pengelompokan Name Tag.

**Halaman tab Jadwal**
- Mengarahkan pengguna tanpa sesi admin ke halaman login sebelum membaca data.
- Menampilkan jumlah hadir dari total pada tanggal hari ini, dan jumlah terjadwal pada tanggal lain.
- Tombol Scan Kehadiran hanya muncul pada tanggal hari ini.
- Tautan Name Tag dan Data Pendaftar mengarah ke alamat yang tepat, dan tautan Name Tag hilang bila tidak ada lagi Pendaftar Terjadwal OKB.
- Tautan Tidak Hadir OKB muncul dan hilang sesuai jumlahnya.
- Menampilkan keadaan kosong dan keadaan gagal dimuat.
- Prior art: tes halaman Name Tag.

**Repository tab Jadwal**
- Hanya membaca status dan rentang tanggal yang benar, dan melaporkan kegagalan database.
- Prior art: tes repository Name Tag.

**Kerangka menu dan AdminShell**
- Item OKB aktif pada ketiga alamat, dan item Name Tag serta Scan Kehadiran tidak lagi ada di sidebar maupun menu mobile.
- Tab yang tepat ditandai aktif pada setiap alamat.
- Prior art: tes AdminShell.

**Halaman yang dipindahkan**
- Tes Name Tag dan Scan Kehadiran mengikuti alamat baru, dan perilakunya tetap lulus tanpa perubahan lain.
- Tes kartu Jadwal OKB terdekat, pembuat alamat Name Tag, dan action Ruang OKB diperbarui ke alamat baru.

**Pengalihan alamat**
- Tes membaca konfigurasi Next.js dan memastikan kedua alamat lama mengarah ke alamat barunya secara sementara.

**Action**
- Scan Kehadiran dan Batalkan Kehadiran memvalidasi ulang `/admin/okb`.
- Prior art: tes action Scan Kehadiran dan perubahan Status Pendaftar.

**Pemeriksaan manual**
- Buka alamat lama, termasuk `?tanggal=` dan `?gelombang=`, dan pastikan pengalihannya membawa parameter.
- Pada HP sungguhan, pastikan Scan Kehadiran tetap bisa memakai kamera di tab, dan kamera berhenti setelah pindah tab.
- Pastikan tab tetap nyaman dipakai pada layar sempit.

## Out of Scope

- Penjadwalan OKB massal.
- Filter tanggal di Data Pendaftar.
- Memindahkan Pengumuman, template Surat Penerimaan, atau impor Nomor VA ke menu OKB.
- Memindahkan aksi per Pendaftar dari Detail Pendaftar.
- Memindahkan filter Gelombang OKB dan Tidak Hadir OKB dari Data Pendaftar.
- Menampilkan riwayat tanggal OKB yang sudah lewat.
- Mengubah data atau batas empat tanggal pada kartu Jadwal OKB terdekat.
- Mengubah kartu tugas di Ringkasan.
- Pindah otomatis ke tab Scan Kehadiran pada hari OKB.
- Mengubah cara kerja Name Tag, Scan Kehadiran, atau Status Pendaftar.
- Halaman publik, termasuk Cek Hasil OKB dan halaman depan.

## Further Notes

- Pekerjaan ini bergantung pada fitur Name Tag, jadi harus berawal dari `feat/name-tag` atau setelah branch itu digabung ke `main`.
- Kartu di Ringkasan dan tab Jadwal sengaja menghitung secara berbeda: kartu hanya menghitung Pendaftar yang masih Terjadwal OKB, sedangkan tab Jadwal ikut menghitung Sudah OKB. Pada hari OKB, angka keduanya bisa berbeda.
- Filter tanggal di Data Pendaftar adalah kandidat lanjutan bila tautan per Gelombang OKB ternyata kurang tepat di lapangan.
