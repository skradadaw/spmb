# 02: Cetak satu Name Tag dari detail Pendaftar

**What to build:** Admin mengunduh satu PNG Name Tag dari detail Pendaftar Terjadwal OKB atau Sudah OKB. Tiket ini membuat aturan penyingkatan nama, penamaan file, dan penggambar kartu yang dipakai ulang tiket 04. Lihat istilah Name Tag di CONTEXT.md dan spec `.scratch/name-tag/spec.md` (user stories 27-42).

Keputusan yang sudah disepakati ada di spec, bagian Tata letak kartu, Aturan menyingkat nama, dan Nama file. Penggambar kartu berjalan di browser dengan canvas dan menerima logo seperti Bukti Pendaftaran. Kartu tetap dibuat bila logo gagal dimuat.

**Blocked by:** 01 (Ruang OKB per Pendaftar)

**Status:** ready-for-agent

- [x] Modul Name Tag murni menyingkat nama dari akhir sesuai seluruh contoh di spec, dengan fungsi pengukur lebar teks yang diberikan pemanggil.
- [x] `bin`, `binti`, kata berhubung, dan nama pendek ditangani sesuai spec; data tersimpan tidak berubah.
- [x] Modul menentukan apakah Pendaftar dapat dicetak satuan, dan membuat nama file yang aman dari Ruang OKB dan nama lengkap.
- [x] Penggambar menghasilkan PNG 1004 × 1299 piksel dengan isi dan urutan sesuai spec, tanpa data yang dikecualikan spec.
- [x] Detail Pendaftar menampilkan tombol cetak hanya untuk Terjadwal OKB dan Sudah OKB, meminta Ruang OKB diisi bila kosong, dan menampilkan pesan bila gambar gagal dibuat.
