# 04: Form Pengaturan Kuota Admin & Aksi Update Pendaftar

**What to build:**
Menyederhanakan antarmuka tab Pengaturan Kuota (`/admin/pengaturan/kuota`) menjadi satu input form kapasitas total Siswa Baru beserta server action penyimpanannya. Memperbarui server action pengubahan data pendaftar (`updateParticipantDataAction`) dan pengubahan status (`updateParticipantStatusAction`) agar memperbolehkan perubahan pilihan kelas tanpa hambatan kuota kelas tujuan, serta hanya memeriksa kuota total saat terjadi penambahan kursi Siswa Baru.

**Blocked by:** 01: Model Kapasitas & Transaksi Pendaftaran Basis Data

**Status:** ready-for-agent

- [ ] Halaman `/admin/pengaturan/kuota` menampilkan satu input form untuk Kapasitas Total Siswa Baru (nilai saat ini terisi otomatis).
- [ ] Server action penyimpanan kapasitas menolak input bernilai $\le 0$ atau input yang lebih kecil dari jumlah kursi Siswa Baru yang sedang terpakai.
- [ ] Server action penyimpanan kapasitas berhasil memperbarui nilai kapasitas total dan memicu revalidasi path cache terkait.
- [ ] Admin dapat mengubah Pilihan Kelas pendaftar Siswa Baru ke kelas mana pun tanpa dicegat validasi kuota kelas tujuan.
- [ ] Admin ditolak dengan pesan yang jelas saat mengubah Jenis Pendaftaran dari Pindahan ke Siswa Baru atau mereaktivasi status dari Ditolak/Dibatalkan ke Berproses/Diterima jika total kapasitas 112 sudah penuh.
- [ ] Mengubah pendaftar Siswa Baru menjadi Pindahan, Ditolak, atau Dibatalkan membebaskan 1 kursi untuk pendaftar lain.
- [ ] Seluruh unit test server action dan halaman pengaturan berjalan hijau.
