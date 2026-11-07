# 01: Ruang OKB per Pendaftar

**What to build:** Admin mengisi, mengubah, dan mengosongkan Ruang OKB seorang Pendaftar di halaman detailnya. Ruang OKB juga tampil di hasil Scan Kehadiran dan ekspor admin, dan otomatis kosong ketika Jadwal OKB diubah atau dihapus. Lihat istilah Ruang OKB di CONTEXT.md dan spec `.scratch/name-tag/spec.md` (user stories 10, 12-18, 43, 44).

Keputusan yang sudah disepakati ada di spec, bagian Skema, Aturan Ruang OKB, dan Kontrak action. Action dirancang menerima banyak Pendaftar sekaligus karena tiket 03 memakainya; tiket ini baru memanggilnya untuk satu Pendaftar. Aturan normalisasi nama ruangan ditaruh di modul Name Tag murni yang baru, karena tiket 02 melanjutkan modul itu.

**Blocked by:** tidak ada

**Status:** ready-for-agent

- [ ] Skema menambah kolom `ruang_okb` dan trigger pengosongan yang memakai `IS DISTINCT FROM`; tes skema diperbarui.
- [ ] Nama ruangan dinormalkan, maksimal 30 karakter, dan nilai kosong mengosongkan Ruang OKB.
- [ ] Action menolak sesi tidak valid, hanya mengubah Pendaftar Terjadwal OKB atau Sudah OKB, dan melaporkan jumlah yang berubah.
- [ ] Detail Pendaftar Terjadwal OKB dan Sudah OKB menampilkan dan dapat mengubah Ruang OKB; status lain tidak dapat mengubahnya.
- [ ] Hasil Scan Kehadiran menampilkan Ruang OKB, termasuk saat Pendaftar sudah tercatat hadir.
- [ ] Ekspor admin memuat Ruang OKB; data untuk orang tua tidak memuatnya.
