# 01: Menu Pengaturan dengan tab Kuota Kelas

**What to build:** Admin membuka item Pengaturan di sidebar atau menu mobile dan melihat tab Kuota Kelas di `/admin/pengaturan/kuota`, berisi halaman Kuota Kelas yang sudah ada. Item Kuota Kelas hilang dari sidebar, dan alamat lama dialihkan. Lihat [spec](../spec.md).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Item Pengaturan ada di sidebar dan menu mobile menggantikan Kuota Kelas, dan aktif pada semua alamat di bawah `/admin/pengaturan`
- [x] Halaman Pengaturan punya tab Kuota Kelas dan Ruang OKB (urutan ini), memakai pola yang sama dengan tab menu OKB. Tab Ruang OKB boleh menautkan ke halaman yang dibuat di tiket 03
- [x] `/admin/pengaturan` mengarah ke `/admin/pengaturan/kuota`
- [x] Halaman Kuota Kelas dipindah ke `/admin/pengaturan/kuota` tanpa mengubah perilakunya
- [x] `/admin/kuota` dialihkan ke `/admin/pengaturan/kuota` lewat `next.config.ts`
- [x] Tautan kartu kuota di Ringkasan dan semua `revalidatePath('/admin/kuota')` memakai alamat baru
- [x] Pengguna tanpa sesi admin diarahkan ke halaman login
- [x] Uji navigasi, pengalihan, dan uji yang merujuk `/admin/kuota` atau section `capacity` diperbarui
