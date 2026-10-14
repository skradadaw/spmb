# 03: Hapus Jadwal OKB

**What to build:** Admin bisa mencabut Jadwal OKB seorang Pendaftar Terjadwal OKB, termasuk yang Tidak Hadir OKB. Pendaftar kembali Terverifikasi tanpa tanggal maupun Gelombang OKB, lalu muncul lagi di tugas Ringkasan "Perlu dijadwalkan OKB". Lihat istilah Hapus Jadwal OKB di CONTEXT.md.

Keputusan yang sudah disepakati:

- Hanya bisa dari status Terjadwal OKB.
- Berbeda dari Dibatalkan: Pendaftar tetap berproses dan kursinya tetap terpakai. Kuota tidak tersentuh.
- Memakai dialog konfirmasi, seperti tombol Batalkan pendaftar.
- Dikerjakan sebagai intent baru pada server action status Pendaftar yang sudah ada.

**Blocked by:** 01 (Pilih Gelombang OKB saat menjadwalkan)

**Status:** ready-for-agent

- [ ] Panel Status & OKB pada Pendaftar Terjadwal OKB menampilkan tombol "Hapus jadwal" di samping "Tandai hadir OKB" dan "Jadwalkan ulang".
- [ ] Menekan tombol membuka dialog konfirmasi. Pembatalan dialog tidak mengubah apa pun.
- [ ] Setelah dikonfirmasi: status menjadi Terverifikasi, tanggal dan Gelombang dikosongkan, dan pesan sukses tampil.
- [ ] Jika status di database sudah bukan Terjadwal OKB, aksi tidak mengubah apa pun dan menampilkan pesan halaman usang.
- [ ] Halaman detail dan daftar Pendaftar di-revalidate.
- [ ] Batasan database "Terjadwal OKB wajib punya tanggal dan Gelombang" tidak terlanggar oleh aksi ini.
- [ ] Tes server action dan detail Pendaftar mencakup perilaku di atas.
