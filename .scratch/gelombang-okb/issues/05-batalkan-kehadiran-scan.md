# 05: Batalkan Kehadiran dari halaman Scan

**What to build:** Saat admin salah scan di hari OKB, ia bisa langsung membatalkan kehadiran dari halaman Scan Kehadiran tanpa membuka detail Pendaftar.

Keputusan yang sudah disepakati:

- Tombol "Batalkan" hanya tampil pada hasil scan terakhir yang berhasil ("Hadir tercatat"). Hasil yang ditolak tidak punya tombol ini.
- Memakai aksi Batalkan Kehadiran yang sama dengan tiket 04, sehingga aturannya identik (hanya dari Sudah OKB).
- Setelah dibatalkan, hasil scan menunjukkan bahwa kehadiran dibatalkan dan Pendaftar bisa di-scan ulang di hari yang sama.

**Blocked by:** 04 (Batalkan Kehadiran dari detail Pendaftar)

**Status:** ready-for-agent

- [ ] Hasil scan yang berhasil menampilkan tombol "Batalkan". Hasil yang ditolak tidak menampilkannya.
- [ ] Menekan "Batalkan" memanggil aksi Batalkan Kehadiran untuk Pendaftar tersebut, lalu menampilkan pesan bahwa kehadiran dibatalkan.
- [ ] Jika aksi gagal (misalnya status sudah berubah), pesan galatnya tampil dan hasil scan tidak berubah.
- [ ] Setelah dibatalkan, scan ulang Pendaftar yang sama di hari jadwalnya kembali mencatat hadir.
- [ ] Ada tes yang mencakup tombol dan alurnya.
