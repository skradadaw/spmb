# 05: Unduh Surat Penerimaan

**What to build:** Orang tua Pendaftar Diterima yang sudah diumumkan menekan "Unduh Surat Penerimaan" di halaman Cek Hasil OKB dan menerima PDF berisi nama anak dan Nomor VA. Admin bisa mengunduh surat yang sama dari detail Pendaftar. Lihat spec `.scratch/pengumuman-hasil-okb/spec.md` (user stories 10, 21, 22, 46, 49).

Keputusan yang sudah disepakati:

- **PDF dibuat saat diunduh** dari template aktif dengan Pembuat Surat Penerimaan dari tiket 03, sehingga template baru langsung berlaku. PDF tidak disimpan.
- **Unduhan orang tua diotorisasi ulang di setiap permintaan** memakai layanan Cek Hasil OKB (Nomor Pendaftaran + tanggal lahir). Surat hanya dilayani bila Pendaftar Diterima dan sudah diumumkan. Bila pendaftaran Dibatalkan, keputusan berubah menjadi Ditolak, atau pengumuman ditarik, unduhan ditolak.
- **Unduhan orang tua ikut dihitung oleh pembatas percobaan** dari tiket 02.
- **Unduhan admin** memerlukan sesi admin, tersedia untuk setiap Pendaftar Diterima yang punya Nomor VA, dan tidak harus sudah diumumkan.
- **Nama file memuat Nomor Pendaftaran dan nama anak**, misalnya `Surat-Penerimaan-OB-2027-001-Siti-Aminah.pdf`.

**Blocked by:** 03 (Template Surat Penerimaan), 04 (Umumkan per Pendaftar)

**Status:** ready-for-agent

- [x] Halaman Cek Hasil OKB untuk Pendaftar Diterima yang sudah diumumkan menampilkan tombol "Unduh Surat Penerimaan" yang menghasilkan PDF 2 halaman terisi.
- [x] Unduhan orang tua ditolak bila belum diumumkan, Ditolak, Dibatalkan, atau tanggal lahir tidak cocok.
- [x] Detail Pendaftar Diterima menampilkan tombol Unduh Surat Penerimaan untuk admin; unduhan ditolak tanpa sesi admin.
- [x] Nama file sesuai format di atas.
- [x] Tes mencakup otorisasi unduhan orang tua dan admin di setiap kombinasi status.
