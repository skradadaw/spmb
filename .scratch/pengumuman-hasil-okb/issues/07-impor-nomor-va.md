# 07: Impor Nomor VA massal

**What to build:** Di halaman Pengumuman, admin mengunggah file Excel atau CSV berisi Nomor Pendaftaran dan Nomor VA, melihat laporan per baris, lalu mengonfirmasi untuk menyimpan semua baris yang valid sekaligus. Lihat spec `.scratch/pengumuman-hasil-okb/spec.md` (user stories 27–29).

Keputusan yang sudah disepakati:

- **Berjalan dua langkah:** baca dan validasi file menjadi laporan, lalu simpan setelah dikonfirmasi admin.
- **Menerima CSV dan XLSX.** Pembaca XLSX memakai ulang pendekatan zip/deflate dari fitur ekspor bila memungkinkan.
- **Kolom dikenali dari judulnya**, "Nomor Pendaftaran" dan "Nomor VA", tanpa membedakan huruf besar/kecil.
- **Aturan Nomor VA sama dengan tiket 01:** 16 digit, unik, spasi dan tanda hubung dibuang.
- **Laporan mengelompokkan baris** menjadi: cocok, Nomor Pendaftaran tidak dikenal, VA tidak valid, VA ganda (di dalam file atau dengan Pendaftar lain), Pendaftar bukan Diterima, sudah punya VA yang berbeda, dan VA yang terkunci karena sudah diumumkan.
- **Hanya baris yang cocok yang disimpan**, dalam satu transaksi: semua tersimpan atau tidak sama sekali.
- **Baris yang sama persis dengan data tersimpan** dihitung sebagai tidak berubah.

**Blocked by:** 01 (Nomor VA di detail Pendaftar), 03 (Template Surat Penerimaan, untuk halaman Pengumuman)

**Status:** ready-for-agent

- [x] Halaman Pengumuman memiliki bagian Impor Nomor VA dengan unggahan file.
- [x] Setelah file dibaca, laporan per kelompok tampil tanpa ada data yang tersimpan.
- [x] Setelah konfirmasi, baris yang cocok tersimpan; bila penyimpanan gagal, tidak ada yang berubah.
- [x] File tanpa kolom yang dibutuhkan ditolak dengan pesan yang jelas.
- [x] Tes mencakup pembacaan CSV dan XLSX, setiap kelompok laporan, penyimpanan atomik, dan tanpa sesi admin.
