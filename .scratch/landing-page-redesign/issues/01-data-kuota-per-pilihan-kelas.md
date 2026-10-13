# 01: Data kuota per Pilihan Kelas sampai ke landing page

**What to build:** Landing page menerima data kuota per Pilihan Kelas (Reguler, Bilingual, Tahfizh), bukan hanya jumlah total. Progres pendaftar di hero kini dihitung dari data tersebut. Ini prefactor: tampilan bagi orang tua tidak berubah sama sekali, tetapi data untuk status kuota per kelas sudah tersedia untuk tiket berikutnya. Spec: `.scratch/landing-page-redesign/spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Repository progres booking mengembalikan daftar kapasitas per Pilihan Kelas (Pilihan Kelas, kuota, terpakai) dari sumber yang sama seperti sekarang, tanpa query baru.
- [ ] Repository tetap melempar error aman yang sama bila data gagal dimuat.
- [ ] `LandingPage` menerima `classCapacities` (daftar kapasitas atau `null`) menggantikan `completedCount`.
- [ ] Progres di hero (x / 112) dihitung dari total kursi terpakai. Bila data `null`, hero menampilkan pesan "Progress sementara tidak tersedia" seperti sekarang.
- [ ] Halaman server meneruskan `null` saat gagal, dengan logging aman yang sama.
- [ ] Tes repository dan tes render `LandingPage` diperbarui dan lulus. Tidak ada perubahan visual.
