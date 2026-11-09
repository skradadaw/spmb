# 02: Ruang OKB dipilih dari daftar ruangan

**What to build:** Ruang OKB menjadi daftar ruangan yang tersimpan sendiri. Saat menetapkan Ruang OKB di Detail Pendaftar dan secara massal di Name Tag, admin memilih dari daftar dan tidak lagi mengetik teks bebas. Nama Ruang OKB lama dimigrasikan otomatis menjadi ruangan di daftar. Lihat [spec](../spec.md), bagian Skema dan Modul.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Tabel `ruang_okb` dengan nama 1–30 karakter yang unik tanpa membedakan huruf besar/kecil dan spasi di awal atau akhir, hanya diakses lewat service role
- [x] `pendaftar.ruang_okb_id` merujuk `ruang_okb` dengan `ON DELETE RESTRICT`
- [x] Migrasi membuat satu ruangan untuk setiap nama lama yang berbeda (digabung tanpa membedakan huruf besar/kecil dan spasi), menghubungkan Pendaftar ke ruangannya, lalu menghapus kolom teks `pendaftar.ruang_okb`
- [x] Trigger perubahan atau penghapusan Jadwal OKB mengosongkan `ruang_okb_id`
- [x] Modul domain: normalisasi nama, kunci perbandingan, validasi panjang, dan urutan alami ("Kelas 2" sebelum "Kelas 10")
- [x] `saveRuangOkbAction` menerima id ruangan atau kosong, dan menolak id yang tidak dikenal
- [x] Form tunggal dan massal menampilkan pilihan ruangan dalam urutan alami, dengan opsi mengosongkan
- [x] Bila daftar kosong, form menampilkan "Belum ada ruangan. Tambahkan di Pengaturan" dengan tautan ke `/admin/pengaturan/ruang-okb`
- [x] Name Tag, pengelompokan Name Tag, dan Detail Pendaftar menampilkan nama ruangan lewat daftar, dengan urutan alami
- [x] Uji modul domain, `saveRuangOkbAction`, dan komponen form diperbarui atau ditambah

## Comments

Tiket 02 dan 03 sebaiknya dirilis bersama. Setelah 02 saja, admin hanya bisa memilih ruangan hasil migrasi dan belum bisa menambah ruangan baru.
