# 01: Pilih Gelombang OKB saat menjadwalkan

**What to build:** Admin menetapkan Jadwal OKB dengan memilih tanggal dan Gelombang OKB (Gelombang 1, 2, atau 3), menggantikan isian sesi berupa teks bebas. Gelombang tampil di semua tempat yang selama ini menampilkan sesi. Lihat istilah Jadwal OKB dan Gelombang OKB di CONTEXT.md.

Keputusan yang sudah disepakati:

- Ada tepat tiga Gelombang OKB, tetap di kode, tidak dikelola lewat menu admin.
- Gelombang tidak menentukan tanggal. Tanggal tetap dipilih admin secara terpisah karena bisa berubah.
- Tanggal dan Gelombang wajib diisi bersama. Tidak ada Terjadwal OKB tanpa tanggal.
- Penyimpanan: kolom baru khusus Gelombang di tabel pendaftar, berupa angka 1–3 dengan batasan nilai di database. Database mewajibkan Pendaftar berstatus Terjadwal OKB punya tanggal dan Gelombang.
- Data lama: semua Pendaftar yang sudah punya tanggal Jadwal OKB (saat ini satu) di-backfill ke Gelombang 1. Setelah itu kolom sesi lama dihapus. Skrip skema harus tetap idempoten.
- Kartu "Jadwal OKB terdekat" di Ringkasan menghitung per tanggal lalu per Gelombang (contoh: `Gelombang 1: 12 · Gelombang 2: 3`), bukan per sesi.
- Jadwalkan ulang memakai form yang sama, sehingga Gelombang juga bisa diganti.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Form jadwal di detail Pendaftar berisi tanggal dan pilihan Gelombang 1/2/3, keduanya wajib. Isian teks sesi hilang.
- [x] Server action menolak Gelombang di luar 1–3 dan tanggal yang tidak valid, lalu menyimpan `Terjadwal OKB` beserta tanggal dan Gelombang. Status awal yang diterima tetap Terverifikasi atau Terjadwal OKB.
- [x] Detail Pendaftar menampilkan "Gelombang N" di bagian Jadwal OKB.
- [x] Hasil Scan Kehadiran yang ditolak karena beda tanggal menyebut tanggal dan Gelombang, bukan sesi.
- [x] Kartu "Jadwal OKB terdekat" menghitung per Gelombang dan urut Gelombang 1 → 3.
- [x] Ekspor Pendaftar memuat kolom Gelombang OKB menggantikan kolom sesi.
- [x] Skema: kolom Gelombang dengan batasan 1–3, backfill data lama ke Gelombang 1, kolom sesi dihapus, dan batasan "Terjadwal OKB wajib punya tanggal dan Gelombang". Semuanya dicakup oleh tes skema.
- [x] Tes server action, Ringkasan, dan detail Pendaftar diperbarui dan lulus.
