# 04: Batalkan Kehadiran dari detail Pendaftar

**What to build:** Admin bisa mencabut catatan hadir seorang Pendaftar Sudah OKB, misalnya karena salah scan. Pendaftar kembali Terjadwal OKB dengan tanggal dan Gelombang OKB yang sama. Lihat istilah Batalkan Kehadiran di CONTEXT.md.

Keputusan yang sudah disepakati:

- Hanya bisa dari status Sudah OKB. Jika Keputusan Penerimaan (Diterima/Ditolak) sudah dicatat, tombol tidak muncul; jalur perbaikannya "Ubah Keputusan Penerimaan".
- Jika tanggal jadwalnya sudah lewat, Pendaftar otomatis tergolong Tidak Hadir OKB dan muncul di tugas Ringkasan "Tidak hadir OKB". Tidak ada langkah tambahan.
- Memakai dialog konfirmasi.
- Dikerjakan sebagai intent baru pada server action status Pendaftar yang sudah ada. Tiket 05 memakai intent yang sama dari halaman Scan.

**Blocked by:** 03 (Hapus Jadwal OKB). Keduanya mengubah panel Status & OKB, jadi dikerjakan berurutan.

**Status:** ready-for-agent

- [x] Panel Status & OKB pada Pendaftar Sudah OKB menampilkan tombol "Batalkan kehadiran". Tombol tidak tampil pada status lain.
- [x] Menekan tombol membuka dialog konfirmasi. Pembatalan dialog tidak mengubah apa pun.
- [x] Setelah dikonfirmasi: status menjadi Terjadwal OKB, tanggal dan Gelombang tetap, dan pesan sukses tampil.
- [x] Jika status di database sudah bukan Sudah OKB (misalnya keputusan baru saja dicatat), aksi tidak mengubah apa pun dan menampilkan pesan halaman usang.
- [x] Halaman detail dan daftar Pendaftar di-revalidate.
- [x] Tes server action dan detail Pendaftar mencakup perilaku di atas.
