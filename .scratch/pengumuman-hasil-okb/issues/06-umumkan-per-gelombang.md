# 06: Umumkan dan tarik pengumuman per Gelombang

**What to build:** Di halaman Pengumuman, admin melihat ringkasan setiap Gelombang OKB, lalu mengumumkan atau menarik hasil satu Gelombang sekaligus. Lihat spec `.scratch/pengumuman-hasil-okb/spec.md` (user stories 33, 35–38).

Keputusan yang sudah disepakati:

- **Ringkasan per Gelombang** berisi jumlah Diterima, Ditolak, dan Sudah OKB (belum diputuskan), masing-masing sudah atau belum diumumkan.
- **Pendaftar yang masih Sudah OKB dilewati** saat mengumumkan, dan admin diberi tahu berapa yang dilewati.
- **Pengumuman satu Gelombang ditolak seluruhnya** bila ada Pendaftar Diterima di dalamnya yang belum punya Nomor VA. Admin melihat daftar nama dan Nomor Pendaftarannya. Pengumuman juga ditolak bila belum ada template aktif.
- **Memakai fungsi database dari tiket 04** dalam mode Gelombang, sehingga validasi dan perubahan terjadi dalam satu transaksi.
- **Dialog konfirmasi menyebut jumlah** Diterima dan Ditolak yang akan diumumkan atau ditarik.
- **Pendaftar Dibatalkan tidak ikut diumumkan.**

**Blocked by:** 04 (Umumkan per Pendaftar)

**Status:** ready-for-agent

- [x] Halaman Pengumuman menampilkan ringkasan untuk Gelombang 1, 2, dan 3.
- [x] Admin bisa mengumumkan satu Gelombang setelah konfirmasi; semua Pendaftar Diterima/Ditolak yang belum diumumkan di Gelombang itu menjadi diumumkan.
- [x] Bila ada Pendaftar Diterima tanpa Nomor VA, tidak ada satu pun yang diumumkan, dan nama-namanya ditampilkan.
- [x] Jumlah Pendaftar yang dilewati karena belum diputuskan ditampilkan setelah mengumumkan.
- [x] Admin bisa menarik pengumuman satu Gelombang setelah konfirmasi.
- [x] Tes server action mencakup umumkan, tarik, penolakan karena VA atau template, Pendaftar yang dilewati, dan tanpa sesi admin.
