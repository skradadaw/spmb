# 08: Pemantauan pengumuman dan pesan WhatsApp

**What to build:** Admin dapat memantau hasil mana yang belum diumumkan, diingatkan sebelum mengubah keputusan yang sudah diumumkan, dan mengabari orang tua dengan pesan WhatsApp siap kirim. Lihat spec `.scratch/pengumuman-hasil-okb/spec.md` (user stories 40–42, 50).

Keputusan yang sudah disepakati:

- **Daftar Pendaftar** mendapat filter "Sudah diumumkan" / "Belum diumumkan".
- **Dashboard** menampilkan jumlah Pendaftar Diterima/Ditolak yang belum diumumkan, sebagai tugas yang mengarah ke daftar Pendaftar dengan filter tersebut.
- **Peringatan sebelum mengubah keputusan:** bila hasil seorang Pendaftar sudah diumumkan, mengubah Keputusan Penerimaan atau Kelas Penempatan menampilkan dialog bahwa orang tua akan langsung melihat perubahannya.
- **Pesan WhatsApp:** helper WhatsApp yang sudah ada mendapat template pesan berisi URL Cek Hasil OKB dan Nomor Pendaftaran anak. Tombol WhatsApp di detail Pendaftar memakai pesan ini.

**Blocked by:** 04 (Umumkan per Pendaftar)

**Status:** ready-for-agent

- [x] Filter sudah/belum diumumkan bekerja di daftar Pendaftar dan bisa digabung dengan filter yang sudah ada.
- [x] Dashboard menampilkan jumlah keputusan yang belum diumumkan dan menautkannya ke daftar yang tersaring.
- [x] Mengubah keputusan Pendaftar yang sudah diumumkan memunculkan dialog peringatan; membatalkan dialog tidak mengubah apa pun.
- [x] Tombol WhatsApp di detail Pendaftar membuka pesan berisi tautan Cek Hasil OKB dan Nomor Pendaftaran.
- [x] Tes daftar Pendaftar, dashboard, detail Pendaftar, dan helper WhatsApp mencakup perilaku di atas.
