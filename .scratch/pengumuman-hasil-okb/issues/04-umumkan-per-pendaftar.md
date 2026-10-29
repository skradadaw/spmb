# 04: Umumkan dan tarik pengumuman per Pendaftar

**What to build:** Admin menekan "Umumkan" di detail seorang Pendaftar Diterima atau Ditolak. Sejak itu orang tua melihat hasilnya di halaman Cek Hasil OKB. Admin juga bisa menarik pengumuman, sehingga orang tua kembali melihat "Hasil OKB belum diumumkan". Lihat istilah Pengumuman Hasil OKB di CONTEXT.md dan spec `.scratch/pengumuman-hasil-okb/spec.md` (user stories 9, 11, 12, 14, 31, 32, 34, 35, 38, 39, 48).

Keputusan yang sudah disepakati:

- **Kolom waktu pengumuman** ditambahkan di tabel Pendaftar, boleh kosong; Pendaftar dianggap sudah diumumkan bila kolom ini terisi. Mengubah keputusan, membatalkan, atau memulihkan Pendaftar tidak mengosongkannya.
- **Mengumumkan dan menarik berjalan lewat fungsi database** yang hanya bisa dipanggil service role, seperti `decide_admission`. Fungsinya dirancang menerima satu Pendaftar atau satu Gelombang OKB; tiket ini baru memakai mode satu Pendaftar.
- **Hanya Pendaftar Diterima atau Ditolak yang bisa diumumkan.** Pengumuman ditolak bila Pendaftar Diterima belum punya Nomor VA, atau belum ada template aktif.
- **Aturan baru untuk Nomor VA:** tidak bisa dikosongkan atau diubah selama hasil Diterima Pendaftar itu sudah diumumkan. Ini melengkapi tiket 01.
- **Tampilan untuk orang tua** di halaman Cek Hasil OKB:
  - Diterima dan sudah diumumkan: ucapan selamat, Kelas Penempatan (atau Kelas Tujuan untuk Pindahan), dan Nomor VA yang bisa disalin.
  - Ditolak dan sudah diumumkan: pesan santun tanpa nilai atau alasan, beserta kontak Humas SPMB.
  - Dibatalkan: tetap tampil sebagai dibatalkan, baik sudah maupun belum diumumkan.
- **Teks di layar memakai "Diterima" / "Ditolak"**, bukan "lulus".
- **Tombol Unduh Surat Penerimaan** dibuat di tiket 05.

**Blocked by:** 01 (Nomor VA di detail Pendaftar), 02 (Halaman Cek Hasil OKB), 03 (Template Surat Penerimaan)

**Status:** ready-for-agent

- [x] Panel status Pendaftar Diterima/Ditolak menampilkan status pengumuman (belum diumumkan, atau diumumkan beserta waktunya) dan tombol "Umumkan" atau "Tarik pengumuman", masing-masing dengan dialog konfirmasi.
- [x] Mengumumkan Pendaftar Diterima tanpa Nomor VA ditolak dengan pesan yang jelas.
- [x] Mengumumkan ketika belum ada template aktif ditolak dengan pesan yang jelas.
- [x] Mengumumkan Pendaftar yang bukan Diterima/Ditolak ditolak.
- [x] Nomor VA Pendaftar Diterima yang sudah diumumkan tidak bisa dikosongkan atau diubah.
- [x] Halaman Cek Hasil OKB menampilkan hasil Diterima dan Ditolak hanya bila sudah diumumkan; bila ditarik, kembali ke "Hasil OKB belum diumumkan".
- [x] Skema database menambah kolom waktu pengumuman dan fungsi umumkan/tarik dengan izin service role saja; tes skema diperbarui.
- [x] Tes server action mencakup umumkan, tarik, semua penolakan, dan tanpa sesi admin. Tes layanan Cek Hasil OKB mencakup kombinasi sudah/belum diumumkan untuk Diterima, Ditolak, dan Dibatalkan.
