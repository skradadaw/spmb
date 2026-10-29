# 01: Nomor VA di detail Pendaftar

**What to build:** Admin bisa mengisi, mengubah, dan mengosongkan Nomor VA seorang Pendaftar Diterima dari panel status di halaman detail Pendaftar. Daftar Pendaftar menandai Pendaftar Diterima yang Nomor VA-nya belum diisi, supaya admin tahu apa yang tersisa sebelum mengumumkan. Lihat istilah Nomor VA di CONTEXT.md dan spec `.scratch/pengumuman-hasil-okb/spec.md`.

Keputusan yang sudah disepakati:

- **Kolom baru** di tabel Pendaftar, boleh kosong. Database menjamin isinya unik antar-Pendaftar dan tepat 16 digit angka.
- **Nomor VA hanya untuk Pendaftar Diterima.** Isian tidak tampil untuk status lain. Nomor VA yang sudah tersimpan tetap ada bila keputusan berubah, sehingga tidak hilang ketika Panitia mengoreksi keputusan.
- **Spasi dan tanda hubung otomatis dibuang** sebelum validasi.
- **Larangan mengosongkan Nomor VA yang sudah diumumkan** belum berlaku di tiket ini, karena kolom pengumuman baru ada di tiket 04. Tiket 04 menambahkan aturan tersebut.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Skema database menambah kolom Nomor VA dengan constraint unik dan format 16 digit; tes skema diperbarui.
- [x] Panel status Pendaftar Diterima menampilkan isian Nomor VA beserta tombol simpan, dan bisa dikosongkan.
- [x] Nomor VA yang bukan 16 digit ditolak dengan pesan yang jelas.
- [x] Nomor VA yang sudah dipakai Pendaftar lain ditolak, dan pesannya menyebut nama serta Nomor Pendaftaran pemiliknya.
- [x] Nomor VA yang ditempel dengan spasi atau tanda hubung tersimpan sebagai 16 digit saja.
- [x] Aksi ditolak tanpa sesi admin, atau bila Pendaftar bukan Diterima.
- [x] Daftar Pendaftar menampilkan penanda "VA belum diisi" pada Pendaftar Diterima tanpa Nomor VA.
- [x] Halaman detail dan daftar Pendaftar di-revalidate setelah menyimpan.
- [x] Tes server action dan detail Pendaftar mencakup perilaku di atas.
