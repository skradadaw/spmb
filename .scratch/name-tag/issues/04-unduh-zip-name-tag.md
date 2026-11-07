# 04: Unduh ZIP Name Tag

**What to build:** Di halaman Name Tag, admin mengunduh satu ZIP berisi PNG semua Pendaftar pada kelompok terpilih yang sudah punya Ruang OKB, dan melihat jumlah kartu serta jumlah Pendaftar tanpa ruangan sebelum mengunduh. Kartu Jadwal OKB terdekat diberi tautan ke halaman ini. Lihat spec `.scratch/name-tag/spec.md` (user stories 2, 19-26, 30, 31).

Keputusan yang sudah disepakati ada di spec, bagian Pemilihan Pendaftar dan Nama file. ZIP mencakup semua Pendaftar yang memenuhi syarat, bukan hanya yang dicentang. Tiket ini menambah satu dependensi ZIP ringan yang berjalan di browser.

**Blocked by:** 02 (Cetak satu Name Tag), 03 (Halaman Name Tag)

**Status:** ready-for-agent

- [x] Modul Name Tag murni memilih Pendaftar yang masuk ZIP, menghitung yang tanpa Ruang OKB, dan membuat nama file unik dengan akhiran seperti `(2)` dalam urutan yang stabil.
- [x] ZIP berisi satu PNG per Pendaftar yang memenuhi syarat, dan nama ZIP memuat tanggal dan Gelombang OKB.
- [x] Halaman menampilkan jumlah kartu dan jumlah Pendaftar tanpa Ruang OKB, dan menonaktifkan unduhan bila tidak ada kartu.
- [x] Kegagalan membuat gambar atau ZIP menampilkan pesan yang jelas.
- [x] Kartu Jadwal OKB terdekat menautkan ke halaman Name Tag.
