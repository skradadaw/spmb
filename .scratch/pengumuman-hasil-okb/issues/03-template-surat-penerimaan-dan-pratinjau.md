# 03: Template Surat Penerimaan dan pratinjau

**What to build:** Admin membuka halaman baru "Pengumuman" di menu admin, mengunggah template Surat Penerimaan 2 halaman, melihat pratinjaunya yang sudah diisi data contoh, lalu mengaktifkannya. Lihat istilah Surat Penerimaan di CONTEXT.md, ADR 0002, dan spec `.scratch/pengumuman-hasil-okb/spec.md` (user stories 17–20, 43–47).

Keputusan yang sudah disepakati:

- **Pembuat Surat Penerimaan** adalah fungsi murni (byte template + nama lengkap, Nomor VA, tempat lahir, tanggal lahir → byte PDF) yang menjadi seam pengujian. Memakai dependensi baru `pdf-lib`, karena jsPDF tidak bisa menulis di atas PDF yang sudah ada.
- **Posisi isian diukur dari template sekolah** dan dikunci di modul (ADR 0002).
  - Halaman 1: nama anak ditulis kapital, di tengah, tebal, dan biru seperti contoh sekolah, dengan ukuran huruf diperkecil bila perlu agar muat satu baris. Nomor VA ditulis setelah "Account (VA):" pada catatan pembayaran.
  - Halaman 2 (Surat Pernyataan): bagian calon peserta didik diisi nama lengkap serta tempat dan tanggal lahir dalam format Indonesia, misalnya "Purwakarta, 12 Maret 2020". Bagian orang tua/wali dibiarkan kosong.
- **Template disimpan di bucket Storage privat** yang terpisah dari bucket Berkas, dengan tabel kecil yang mencatat template aktif dan waktu unggahnya. Hanya satu template aktif. Unggahan memakai signed upload URL, seperti Berkas Pengganti.
- **Template yang diunggah wajib PDF tepat 2 halaman.**
- **Pratinjau dibuat dengan dua data contoh**, nama biasa dan nama yang sangat panjang. Template baru tidak aktif sebelum admin mengonfirmasi dari pratinjau.

**Prasyarat:** template kosong (tanpa nama anak dan Nomor VA) tersedia di `docs/templates/surat-penerimaan.pdf` untuk mengukur posisi isian dan sebagai fixture tes.

**Catatan:** file yang ada saat ini adalah **template sementara** buatan sendiri yang meniru tata letak contoh sekolah, bertanda "TEMPLATE SEMENTARA - BUKAN DOKUMEN RESMI". Kerjakan tiket ini dengan template sementara tersebut. Posisinya: nama di halaman 1 sekitar y = 120 mm, di tengah; Nomor VA setelah "Account (VA):" di dalam kotak Catatan; nama dan tempat/tanggal lahir anak di atas titik-titik halaman 2. Simpan semua posisi isian di satu tempat supaya mudah diukur ulang. Ketika sekolah menyerahkan template resmi, posisinya harus diukur ulang dan fixture tes diganti.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Menu admin memiliki halaman "Pengumuman" yang menampilkan template aktif (atau keterangan belum ada) beserta tautan unduhnya.
- [x] Admin bisa mengunggah template; file selain PDF 2 halaman ditolak dengan pesan yang jelas.
- [x] Pratinjau dengan data contoh tampil sebelum template diaktifkan, termasuk satu contoh nama yang sangat panjang.
- [x] Setelah admin mengonfirmasi, template baru menjadi aktif dan menggantikan template sebelumnya.
- [x] Aksi template ditolak tanpa sesi admin.
- [x] Skema database dan Storage menambah tabel dan bucket template; tes skema diperbarui.
- [x] Tes Pembuat Surat Penerimaan membaca kembali teks PDF hasilnya dan memastikan: nama kapital dan Nomor VA ada di halaman 1, nama dan tempat/tanggal lahir ada di halaman 2, jumlah halaman tetap 2, dan nama yang sangat panjang tetap satu baris dalam lebar halaman.
