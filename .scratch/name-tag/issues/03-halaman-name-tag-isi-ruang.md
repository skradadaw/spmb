# 03: Halaman Name Tag dan pengisian Ruang OKB sekaligus

**What to build:** Halaman admin baru "Name Tag" di menu samping. Admin memilih tanggal dan Gelombang OKB, melihat Pendaftar Terjadwal OKB pada kelompok itu, mencentang beberapa atau semua Pendaftar, lalu mengisi atau mengosongkan Ruang OKB mereka sekaligus, dengan saran dari nama yang sudah dipakai. Lihat spec `.scratch/name-tag/spec.md` (user stories 1-11).

Keputusan yang sudah disepakati ada di spec, bagian Aturan Ruang OKB dan Pemilihan Pendaftar. Tiket ini memakai action dari tiket 01. Tombol unduh dibuat di tiket 04.

**Blocked by:** 01 (Ruang OKB per Pendaftar)

**Status:** ready-for-agent

- [x] Menu samping admin dan penentuan menu aktif menyertakan Name Tag; halaman hanya untuk admin.
- [x] Pilihan tanggal dan Gelombang mencakup Jadwal OKB hari ini dan setelahnya.
- [x] Daftar hanya memuat Pendaftar Terjadwal OKB pada kelompok terpilih, urut nama, dan yang belum punya Ruang OKB mudah dikenali.
- [x] Admin dapat mencentang sebagian atau semua Pendaftar, mengisi satu nama ruangan, dan mengosongkannya.
- [x] Saran ruangan berasal dari Pendaftar Terjadwal OKB dengan tanggal hari ini atau setelahnya; nama baru tetap bisa diketik.
- [x] Bila status sebagian Pendaftar sudah berubah, admin melihat pesan dan daftar dimuat ulang.
