Status: ready-for-agent

# Spec: Pengumuman Hasil OKB dan Surat Penerimaan

## Problem Statement

Setelah Panitia menetapkan Keputusan Penerimaan dan admin mencatatnya di sistem, orang tua tidak punya cara untuk melihat hasilnya sendiri. Orang tua tidak punya akun dan tidak ada halaman untuk mereka setelah mendaftar. Akibatnya admin harus mengabarkan hasil satu per satu lewat WhatsApp, dan orang tua sering bertanya tentang tahap pendaftaran anaknya.

Orang tua Pendaftar Diterima juga membutuhkan Surat Penerimaan untuk Daftar Ulang. Surat ini berisi pengumuman resmi dengan nama anak dan Nomor VA untuk pembayaran, serta Surat Pernyataan yang ditandatangani di atas materai. Saat ini sekolah menyiapkan surat itu satu per satu di luar sistem. Setiap anak punya Nomor VA berbeda yang diberikan bank secara acak, sehingga mudah salah ketik atau tertukar.

Keputusan Penerimaan saat ini langsung berlaku begitu admin memasukkannya. Belum ada cara menahan hasil sampai siap diumumkan, misalnya sampai keputusan selesai dikoreksi dan Nomor VA terisi.

## Solution

**Halaman publik Cek Hasil OKB**
- Orang tua memasukkan Nomor Pendaftaran dan tanggal lahir anak. Jumlah percobaan dibatasi supaya hasil dan Nomor VA keluarga lain tidak bisa ditebak.
- Sebelum diumumkan, halaman menampilkan tahap Pendaftar saat ini, termasuk Jadwal OKB dan Gelombang OKB bila sudah ada.
- Setelah diumumkan:
  - Pendaftar Diterima melihat ucapan selamat dan tombol "Unduh Surat Penerimaan".
  - Pendaftar Ditolak melihat pesan yang santun beserta kontak Humas SPMB, tanpa PDF.
  - Pendaftar Dibatalkan melihat bahwa pendaftarannya dibatalkan dan diminta menghubungi sekolah.

**Pengumuman Hasil OKB oleh admin**
- Keputusan Penerimaan hanya terlihat oleh orang tua setelah admin menekan **Umumkan**, per Gelombang OKB atau per Pendaftar. Pengumuman dapat ditarik kembali.
- Pendaftar Diterima yang belum punya Nomor VA tidak dapat diumumkan.

**Nomor VA**
- Admin mengisi Nomor VA satu per satu di detail Pendaftar, atau mengimpor banyak sekaligus dari Excel/CSV berisi pasangan Nomor Pendaftaran dan Nomor VA.

**Surat Penerimaan**
- Dibuat otomatis saat diunduh, dari satu template PDF 2 halaman yang diunggah admin (lihat ADR 0002).
- Halaman 1 diisi nama anak dan Nomor VA. Halaman 2 (Surat Pernyataan) diisi nama serta tempat/tanggal lahir anak.

**Pemberitahuan**
- Tombol WhatsApp di detail Pendaftar menyediakan pesan siap kirim berisi tautan Cek Hasil OKB dan Nomor Pendaftaran anak.

## User Stories

### Orang tua: Cek Hasil OKB

1. Sebagai orang tua, saya ingin mengecek hasil anak saya dengan Nomor Pendaftaran dan tanggal lahir anak, supaya saya tidak perlu akun atau bertanya ke admin lewat WhatsApp.
2. Sebagai orang tua, saya ingin ada tautan ke Cek Hasil OKB di landing page, supaya saya bisa menemukan halamannya sendiri.
3. Sebagai orang tua, saya ingin pesan yang jelas bila Nomor Pendaftaran atau tanggal lahir tidak cocok, tanpa menyebut mana yang salah, supaya saya tahu harus memeriksa ketikan saya.
4. Sebagai orang tua, saya ingin Nomor Pendaftaran tetap dikenali walau saya mengetiknya dengan huruf kecil atau ada spasi berlebih, supaya salah ketik kecil tidak menghalangi saya.
5. Sebagai orang tua, saya ingin melihat "Berkas sedang diverifikasi" ketika anak saya berstatus Menunggu Verifikasi, supaya saya tahu sekolah masih memeriksa Berkas.
6. Sebagai orang tua, saya ingin melihat bahwa Berkas sudah terverifikasi dan Jadwal OKB akan segera ditetapkan ketika anak saya Terverifikasi, supaya saya tahu langkah berikutnya.
7. Sebagai orang tua, saya ingin melihat tanggal Jadwal OKB dan Gelombang OKB ketika anak saya Terjadwal OKB, supaya saya tahu kapan harus datang.
8. Sebagai orang tua, saya ingin melihat "Hasil OKB belum diumumkan" setelah anak saya mengikuti OKB, atau ketika keputusan sudah dicatat tetapi belum diumumkan, supaya saya tahu harus menunggu.
9. Sebagai orang tua Pendaftar Diterima, saya ingin melihat ucapan selamat beserta Kelas Penempatan (atau Kelas Tujuan untuk Pindahan), supaya saya tahu di kelas mana anak saya belajar.
10. Sebagai orang tua Pendaftar Diterima, saya ingin mengunduh Surat Penerimaan dalam PDF, supaya saya bisa membayar Daftar Ulang dan menandatangani Surat Pernyataan.
11. Sebagai orang tua Pendaftar Diterima, saya ingin Nomor VA juga tampil di layar, supaya saya bisa menyalinnya tanpa membuka PDF.
12. Sebagai orang tua Pendaftar Ditolak, saya ingin pesan yang santun tanpa nilai atau alasan, beserta kontak Humas SPMB, supaya saya bisa bertanya langsung ke sekolah bila perlu.
13. Sebagai orang tua Pendaftar Dibatalkan, saya ingin melihat bahwa pendaftaran dibatalkan dan saya perlu menghubungi sekolah, supaya saya tidak tertipu oleh hasil lama.
14. Sebagai orang tua, saya ingin halaman selalu menampilkan keadaan terbaru, supaya keputusan yang dikoreksi atau pendaftaran yang dipulihkan tampil dengan benar.
15. Sebagai orang tua, saya ingin halaman nyaman dipakai di HP, supaya saya bisa membukanya dari tautan WhatsApp.
16. Sebagai orang tua, saya ingin pesan penguncian sementara setelah terlalu banyak percobaan gagal, supaya saya mengerti mengapa belum bisa mencoba lagi.

### Orang tua: Surat Penerimaan

17. Sebagai orang tua, saya ingin nama lengkap anak saya tercetak dalam huruf kapital, di tengah, tebal dan biru pada halaman 1, supaya sama dengan surat resmi sekolah.
18. Sebagai orang tua, saya ingin Nomor VA anak saya tercetak di catatan pembayaran halaman 1, supaya saya mentransfer ke nomor yang benar.
19. Sebagai orang tua, saya ingin nama dan tempat/tanggal lahir anak sudah terisi di Surat Pernyataan, supaya saya hanya perlu menulis data saya sendiri.
20. Sebagai orang tua, saya ingin bagian orang tua/wali pada Surat Pernyataan dibiarkan kosong, supaya yang menandatangani (ayah, ibu, atau wali) menulis datanya sendiri.
21. Sebagai orang tua, saya ingin nama file PDF memuat nama anak atau Nomor Pendaftaran, supaya mudah dicari di HP.
22. Sebagai orang tua, saya ingin Surat Penerimaan tidak bisa diunduh lagi setelah pendaftaran Dibatalkan atau pengumuman ditarik, supaya surat yang tidak berlaku tidak dipakai.

### Admin: Nomor VA

23. Sebagai admin, saya ingin mengisi atau mengubah Nomor VA di detail Pendaftar Diterima, supaya saya bisa mengisi atau mengoreksi satu VA dengan cepat.
24. Sebagai admin, saya ingin sistem menolak Nomor VA yang bukan tepat 16 digit, supaya salah ketik tertangkap.
25. Sebagai admin, saya ingin sistem menolak Nomor VA yang sudah dipakai Pendaftar lain dan menyebutkan Pendaftar tersebut, supaya dua keluarga tidak pernah berbagi satu VA.
26. Sebagai admin, saya ingin spasi atau tanda hubung pada Nomor VA yang ditempel otomatis dibuang, supaya menyalin dari daftar bank langsung berhasil.
27. Sebagai admin, saya ingin mengimpor file Excel atau CSV berkolom Nomor Pendaftaran dan Nomor VA, supaya banyak VA terisi sekaligus.
28. Sebagai admin, saya ingin ringkasan sebelum impor disimpan (baris cocok, Nomor Pendaftaran tidak dikenal, VA tidak valid, VA ganda, Pendaftar bukan Diterima, Pendaftar yang sudah punya VA berbeda), supaya saya bisa memperbaiki file lebih dulu.
29. Sebagai admin, saya ingin impor baru tersimpan setelah saya konfirmasi, dan tersimpan seluruhnya atau tidak sama sekali, supaya file yang rusak tidak meninggalkan data setengah terisi.
30. Sebagai admin, saya ingin melihat di daftar Pendaftar siapa saja Pendaftar Diterima yang belum punya Nomor VA, supaya saya tahu apa yang tersisa sebelum mengumumkan.
31. Sebagai admin, saya ingin bisa mengosongkan Nomor VA untuk memperbaiki VA yang salah orang, kecuali ketika hasil Diterima Pendaftar itu sudah diumumkan.

### Admin: Pengumuman Hasil OKB

32. Sebagai admin, saya ingin Keputusan Penerimaan tidak terlihat oleh orang tua sampai saya mengumumkannya, supaya keputusan yang masih dikoreksi tidak terlanjur dilihat.
33. Sebagai admin, saya ingin mengumumkan semua Pendaftar yang sudah diputuskan dalam satu Gelombang OKB sekaligus, supaya satu Gelombang menerima hasilnya bersamaan.
34. Sebagai admin, saya ingin mengumumkan satu Pendaftar saja, supaya kasus susulan bisa ditangani.
35. Sebagai admin, saya ingin pengumuman ditolak bila ada Pendaftar Diterima di dalamnya yang belum punya Nomor VA, beserta daftar namanya, supaya tidak ada Surat Penerimaan tanpa VA.
36. Sebagai admin, saya ingin Pendaftar yang masih Sudah OKB (belum diputuskan) dilewati saat saya mengumumkan satu Gelombang, dan diberi tahu berapa yang dilewati, supaya hanya hasil yang sudah diputuskan yang diumumkan.
37. Sebagai admin, saya ingin dialog konfirmasi yang menyebut jumlah Pendaftar Diterima dan Ditolak yang akan diumumkan, supaya saya tidak salah mengumumkan.
38. Sebagai admin, saya ingin menarik kembali pengumuman per Gelombang atau per Pendaftar dengan konfirmasi, supaya pengumuman yang salah bisa diperbaiki; orang tua kembali melihat "belum diumumkan".
39. Sebagai admin, saya ingin melihat di setiap Pendaftar apakah hasilnya sudah diumumkan dan kapan, supaya saya tahu apa yang bisa dilihat orang tua.
40. Sebagai admin, saya ingin peringatan sebelum mengubah Keputusan Penerimaan yang sudah diumumkan, supaya saya sadar orang tua akan langsung melihat perubahannya.
41. Sebagai admin, saya ingin menyaring daftar Pendaftar menurut sudah atau belum diumumkan, supaya saya bisa memantau kemajuannya.
42. Sebagai admin, saya ingin dashboard menampilkan jumlah keputusan yang belum diumumkan, supaya saya tidak lupa mengumumkannya.

### Admin: Template Surat Penerimaan

43. Sebagai admin, saya ingin mengunggah template Surat Penerimaan 2 halaman dalam PDF, supaya sekolah bisa memperbarui tanggal, nomor surat, dan teks setiap tahun tanpa developer.
44. Sebagai admin, saya ingin sistem menolak template yang bukan PDF 2 halaman, supaya file yang salah tidak terpakai.
45. Sebagai admin, saya ingin pratinjau template yang diisi data contoh (termasuk nama yang sangat panjang) sebelum template diaktifkan, supaya saya bisa memastikan posisi tulisannya tepat.
46. Sebagai admin, saya ingin template baru langsung berlaku untuk semua unduhan berikutnya, supaya tidak ada yang perlu dibuat ulang.
47. Sebagai admin, saya ingin melihat template mana yang aktif dan bisa mengunduhnya kembali, supaya saya bisa memeriksa apa yang diterima orang tua.
48. Sebagai admin, saya ingin pengumuman ditolak bila belum ada template aktif, supaya orang tua tidak pernah mendapat hasil Diterima tanpa surat.
49. Sebagai admin, saya ingin mengunduh Surat Penerimaan seorang Pendaftar dari halaman detailnya, supaya saya bisa mengirimkannya sendiri bila orang tua meminta.

### Admin: Pemberitahuan

50. Sebagai admin, saya ingin tombol WhatsApp di detail Pendaftar menyediakan pesan siap kirim berisi tautan Cek Hasil OKB dan Nomor Pendaftaran, supaya saya bisa mengabari orang tua dengan sekali klik.

## Implementation Decisions

**Data Pendaftar**
- **Nomor VA**: kolom baru (boleh kosong) pada tabel Pendaftar, unik antar-Pendaftar, dan dibatasi 16 digit angka lewat constraint database.
- **Waktu pengumuman**: kolom timestamp baru (boleh kosong). Pendaftar dianggap sudah diumumkan bila kolom ini terisi. Menarik pengumuman mengosongkannya kembali.
- **Pengumuman tetap berlaku walau keadaan berubah.** Mengubah Keputusan Penerimaan, membatalkan (Dibatalkan), atau memulihkan Pendaftar tidak mengosongkan waktu pengumuman; halaman orang tua selalu menampilkan keadaan terkini.

**Mengumumkan (fungsi database)**
- Mengumumkan dan menarik pengumuman berjalan lewat fungsi database yang hanya bisa dipanggil service role, seperti `decide_admission` dan `restore_cancelled_applicant`. Fungsinya menerima satu Gelombang OKB atau satu Pendaftar, sehingga validasi dan perubahan data terjadi dalam satu transaksi.
- Hanya Pendaftar Diterima atau Ditolak yang bisa diumumkan.
- Pengumuman ditolak bila:
  - ada Pendaftar Diterima di dalamnya yang belum punya Nomor VA (nama-namanya dikembalikan), atau
  - belum ada template aktif.

**Template Surat Penerimaan**
- Disimpan di Supabase Storage dalam bucket privat yang terpisah dari bucket Berkas, ditambah tabel kecil yang mencatat template aktif dan waktu unggahnya.
- Hanya satu template yang aktif pada satu waktu.
- Unggahan memakai signed upload URL, seperti Berkas Pengganti.

**Pembuat Surat Penerimaan (modul baru)**
- Berupa fungsi murni: byte template + data surat (nama lengkap, Nomor VA, tempat lahir, tanggal lahir) → byte PDF.
- Memakai dependensi baru, `pdf-lib`, karena jsPDF tidak bisa menulis di atas PDF yang sudah ada.
- Posisi setiap isian diukur dari template sekolah dan dikunci di modul (ADR 0002).
- Nama ditulis kapital, di tengah, tebal, dan biru. Ukuran hurufnya diperkecil bila perlu agar muat satu baris.
- Nomor VA ditulis setelah label "Account (VA):" pada catatan pembayaran.
- Tanggal lahir ditulis dalam format Indonesia, misalnya "Purwakarta, 12 Maret 2020".
- Fungsi yang sama dipakai untuk pratinjau admin dengan data contoh.

**Layanan Cek Hasil OKB (modul baru)**
- Masukan: Nomor Pendaftaran dan tanggal lahir. Keluaran: tampilan untuk orang tua, salah satu dari:
  - tidak ditemukan / tidak cocok (satu hasil umum yang sama),
  - tahap saat ini (Menunggu Verifikasi, Terverifikasi, Terjadwal OKB beserta tanggal dan Gelombang, Sudah OKB),
  - belum diumumkan,
  - Diterima (dengan Kelas Penempatan atau Kelas Tujuan, dan Nomor VA),
  - Ditolak,
  - Dibatalkan.
- Pendaftar yang masih Menunggu Unggahan diperlakukan sebagai tidak ditemukan.
- Layanan tidak pernah mengembalikan data pribadi lain (alamat, NIK, data orang tua).
- Route unduhan PDF memakai layanan yang sama untuk otorisasi: surat hanya dilayani bila tampilannya "Diterima dan sudah diumumkan", dan ini dihitung ulang setiap kali diunduh.

**Pembatasan percobaan**
- Percobaan gagal dihitung di database per IP. Pembatas di memori yang dipakai untuk login admin tidak bertahan antar-instance serverless.
- Setelah sejumlah kegagalan dalam satu jendela waktu, percobaan berikutnya ditolak sampai jendela itu lewat. Angka pastinya diatur di konfigurasi.

**Impor Nomor VA**
- Berjalan dua langkah: membaca dan memvalidasi file hingga menghasilkan laporan per baris, lalu menyimpan setelah admin mengonfirmasi.
- Menerima CSV dan XLSX. Pembaca XLSX memakai ulang pendekatan zip/deflate dari fitur ekspor bila memungkinkan.
- Kolom dikenali dari judulnya ("Nomor Pendaftaran", "Nomor VA"), tanpa membedakan huruf besar/kecil.
- Penyimpanan bersifat atomik.
- Baris yang akan mengubah Nomor VA Pendaftar Diterima yang sudah diumumkan ditolak dalam laporan.

**Tampilan admin**
- Panel status di detail Pendaftar mendapat: isian Nomor VA (untuk Pendaftar Diterima), status pengumuman dengan tombol Umumkan / Tarik Pengumuman, dan tombol Unduh Surat Penerimaan.
- Daftar Pendaftar mendapat filter "Sudah diumumkan" / "Belum diumumkan", serta penanda "VA belum diisi" pada Pendaftar Diterima tanpa Nomor VA.
- Halaman admin baru "Pengumuman" berisi:
  - umumkan dan tarik pengumuman per Gelombang, beserta jumlahnya,
  - impor VA,
  - unggah template beserta pratinjau.
- Dashboard menampilkan jumlah Pendaftar yang sudah diputuskan tetapi belum diumumkan.
- Aksi keputusan yang sudah ada menampilkan peringatan bila hasil Pendaftar tersebut sudah diumumkan.

**Pesan WhatsApp**
- Helper WhatsApp yang sudah ada mendapat template pesan berisi URL Cek Hasil OKB dan Nomor Pendaftaran.

**Istilah**
- Teks di layar memakai "Diterima" / "Ditolak", tidak pernah "lulus".
- PDF tetap memakai kata-kata sekolah sendiri ("LULUS / DITERIMA").

## Testing Decisions

- **Yang diuji:** hanya perilaku dari luar pada tiga seam yang sudah disepakati, bukan helper internal atau teks SQL. Setiap tes menyiapkan situasi (keadaan Pendaftar, masukan), lalu memeriksa apa yang dilihat pengguna atau apa yang tersimpan.

- **Pembuat Surat Penerimaan:**
  - Memakai salinan template kosong 2 halaman sebagai fixture.
  - Teks PDF hasilnya dibaca kembali (pdfjs-dist sudah menjadi dependensi) untuk memastikan:
    - nama tercetak kapital di halaman 1,
    - Nomor VA ada di halaman 1,
    - nama dan tempat/tanggal lahir ada di halaman 2,
    - jumlah halamannya tetap 2.
  - Nama yang sangat panjang dicek tetap satu baris dan tidak melewati lebar halaman.
  - Contoh tes serupa: tes PDF Bukti Pendaftaran.

- **Layanan Cek Hasil OKB:**
  - Memakai repository palsu dan mencakup setiap tahap serta setiap kombinasi sudah/belum diumumkan.
  - Tanggal lahir yang salah memberi hasil yang sama dengan nomor yang tidak dikenal.
  - Nomor Pendaftaran dinormalisasi.
  - Penguncian berlaku setelah kegagalan berulang.
  - Unduhan hanya diizinkan untuk Pendaftar Diterima yang sudah diumumkan.
  - Tidak ada data pribadi lain yang bocor.
  - Contoh tes serupa: tes repository Pendaftar dan dashboard.

- **Server action admin:**
  - Memakai Supabase dan sesi admin tiruan (mock).
  - Mencakup:
    - umumkan/tarik per Gelombang dan per Pendaftar,
    - penolakan bila Pendaftar Diterima belum punya Nomor VA atau belum ada template aktif,
    - validasi Nomor VA (format, keunikan, normalisasi, aturan mengosongkan),
    - laporan impor VA dan penyimpanan atomik,
    - validasi unggahan template,
    - penolakan tanpa sesi admin.
  - Contoh tes serupa: tes aksi update status, review Berkas, dan Berkas Pengganti.

- **Tes skema database:** tes skema yang sudah ada diperluas untuk memastikan kolom, constraint, dan fungsi baru ada dan hanya bisa dipanggil service role.

## Out of Scope

- Mengirim WhatsApp, SMS, atau email secara otomatis. Admin mengirim pesan dengan tautan WhatsApp yang sudah ada.
- Mencatat pembayaran Daftar Ulang atau mengecek status pembayaran VA ke bank.
- Nominal biaya per Pendaftar, termasuk potongan Afiliasi Direktorat 2.
- Template berbeda per Kelas Penempatan atau khusus Pindahan.
- Tampilan admin untuk menggeser posisi isian pada template.
- Tanda tangan digital Surat Pernyataan; surat tetap dicetak dan ditandatangani di atas materai.
- Akun atau login untuk orang tua.

## Further Notes

- **Template kosong harus ditambahkan sebelum modul PDF bisa diukur.** Lokasinya `docs/templates/surat-penerimaan.pdf`: surat 2 halaman dari sekolah dengan nama anak dan Nomor VA dikosongkan. Contoh terisi yang dibagikan saat sesi desain hanya menunjukkan tata letaknya.
- **Template sekolah memuat salah ketik**, misalnya "16 Februari 2025" dan "15 Februari 2025" yang seharusnya 2026. Perbaikannya dilakukan sekolah di template; sistem tidak mengubah teks template.
- **Istilah domain didefinisikan di CONTEXT.md:** Pengumuman Hasil OKB, Surat Penerimaan, Nomor VA, Daftar Ulang.
- **Keputusan desainnya tercatat** di ADR 0002, "Surat Penerimaan dibuat dari satu template dengan posisi isian tetap".
