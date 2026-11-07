# 02: Pindahkan Name Tag ke menu OKB

**What to build:** Admin memakai Name Tag sebagai tab di `/admin/okb/name-tag`, dengan fitur yang tidak berubah. Alamat lama tetap berfungsi lewat pengalihan, dan tab Jadwal menautkan ke kelompok Name Tag yang tepat. Lihat [spec](../spec.md).

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Tab Name Tag ada di `/admin/okb/name-tag`, dan memilih tanggal atau Gelombang OKB tetap berada di tab itu
- [ ] `/admin/name-tag` dialihkan sementara ke alamat baru beserta parameternya
- [ ] Item Name Tag hilang dari sidebar dan menu mobile
- [ ] Tautan Name Tag di kartu Jadwal OKB terdekat mengarah ke alamat baru
- [ ] Tab Jadwal menautkan ke Name Tag per Gelombang OKB, kecuali bila semua Pendaftarnya sudah hadir
- [ ] Action Ruang OKB memvalidasi ulang alamat baru
