# 03: Tab Ruang OKB untuk mengelola daftar ruangan

**What to build:** Di `/admin/pengaturan/ruang-okb`, admin melihat daftar ruangan beserta jumlah Pendaftar yang memakainya, lalu menambah, mengganti nama, dan menghapus ruangan. Lihat [spec](../spec.md), user stories Daftar Ruang OKB.

**Blocked by:** 01, 02

**Status:** ready-for-agent

- [x] Daftar ruangan tampil dalam urutan alami beserta jumlah Pendaftar yang memakai setiap ruangan
- [x] Tambah ruangan cukup dengan nama. Nama kosong, lebih dari 30 karakter, atau dobel (tanpa membedakan huruf besar/kecil dan spasi) ditolak dengan pesan yang jelas
- [x] Ganti nama dengan aturan validasi yang sama, dan nama baru langsung tampil untuk semua Pendaftar di ruangan itu
- [x] Hapus ruangan yang tidak dipakai berhasil. Ruangan yang masih dipakai ditolak dengan pesan "Masih dipakai N Pendaftar"
- [x] Keadaan kosong dan keadaan gagal dimuat tampil dengan jelas
- [x] Semua aksi memeriksa sesi admin, dan pengguna tanpa sesi admin diarahkan ke halaman login
- [x] Setiap aksi memvalidasi ulang `/admin/pengaturan/ruang-okb`, `/admin/okb/name-tag`, `/admin/pendaftar`, dan `/admin/pendaftar/[id]`
- [x] Uji server action (tanpa sesi, validasi nama, nama dobel, hapus ruangan yang dipakai, jalur sukses) dan uji komponen tab
