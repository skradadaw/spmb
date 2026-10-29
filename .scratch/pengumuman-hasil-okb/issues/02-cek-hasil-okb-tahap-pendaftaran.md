# 02: Halaman Cek Hasil OKB untuk tahap pendaftaran

**What to build:** Orang tua membuka halaman publik Cek Hasil OKB dari landing page, lalu memasukkan Nomor Pendaftaran dan tanggal lahir anak. Mereka melihat tahap pendaftaran anaknya saat ini, tanpa akun. Lihat spec `.scratch/pengumuman-hasil-okb/spec.md` (user stories 1–8, 13–16).

Keputusan yang sudah disepakati:

- **Layanan Cek Hasil OKB** menjadi seam pengujian. Masukannya Nomor Pendaftaran dan tanggal lahir; keluarannya tampilan untuk orang tua. Route unduhan di tiket 05 nanti memakai layanan yang sama.
- **Nomor Pendaftaran dinormalisasi:** huruf kecil dan spasi berlebih tetap dikenali.
- **Hasil tidak ditemukan selalu sama.** Nomor yang tidak dikenal, tanggal lahir yang tidak cocok, dan Pendaftar yang masih Menunggu Unggahan memberi satu pesan umum yang sama, tanpa menyebut mana yang salah.
- **Tampilan per tahap:**
  - Menunggu Verifikasi: Berkas sedang diverifikasi.
  - Terverifikasi: Berkas sudah terverifikasi, Jadwal OKB akan ditetapkan.
  - Terjadwal OKB: tanggal Jadwal OKB dan Gelombang OKB.
  - Sudah OKB, Diterima, Ditolak: "Hasil OKB belum diumumkan". Fitur pengumuman baru ada di tiket 04.
  - Dibatalkan: pendaftaran dibatalkan, hubungi sekolah, beserta kontak Humas SPMB.
- **Tidak ada data pribadi lain yang dikembalikan** selain nama anak dan data tahap di atas (tidak ada alamat, NIK, maupun data orang tua).
- **Percobaan gagal dicatat di database per IP**, bukan dengan pembatas di memori yang dipakai login admin. Setelah sejumlah kegagalan dalam satu jendela waktu, percobaan berikutnya ditolak dengan pesan penguncian sementara. Angkanya diatur di konfigurasi.
- **Halaman nyaman dipakai di HP**, memakai gaya halaman publik yang sudah ada.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Landing page memiliki tautan ke halaman Cek Hasil OKB.
- [x] Form menerima Nomor Pendaftaran dan tanggal lahir anak, dengan validasi isian kosong.
- [x] Setiap tahap di atas menampilkan pesan yang sesuai.
- [x] Nomor tidak dikenal, tanggal lahir salah, dan Menunggu Unggahan memberi pesan yang sama persis.
- [x] Setelah batas kegagalan tercapai, percobaan ditolak dengan pesan penguncian, termasuk ketika isiannya benar, sampai jendela waktu lewat.
- [x] Skema database menambah penyimpanan percobaan gagal; tes skema diperbarui.
- [x] Tes layanan Cek Hasil OKB dengan repository palsu mencakup setiap tahap, normalisasi nomor, hasil tidak cocok, penguncian, dan tidak adanya data pribadi lain.
