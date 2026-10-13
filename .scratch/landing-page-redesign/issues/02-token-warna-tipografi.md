# 02: Token warna dan tipografi landing page

**What to build:** Seluruh landing page, termasuk hero, memakai satu palet dan satu jenjang tipografi, sehingga bagian setelah hero terasa satu tema dengan hero. Ini prefactor visual: isi halaman belum berubah. Spec: `.scratch/landing-page-redesign/spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Palet landing page didefinisikan sekali sebagai token:
  - hijau tua `#064E1B` untuk pita dan footer;
  - hijau utama `#007A10` untuk tombol dan tautan, dengan warna hover-nya;
  - satu tint hijau muda;
  - amber sebagai satu-satunya warna aksen.
- [ ] Hero dan semua bagian yang ada memakai token tersebut. Warna hijau ad-hoc (`#075B1B`, `#008A12`, `#00AA13`, dan sejenisnya) dan warna biru langit tidak dipakai lagi di landing page.
- [ ] Footer berwarna hijau tua, bukan slate.
- [ ] Jenjang tipografi:
  - `font-black` hanya untuk judul bagian;
  - judul kartu memakai `font-bold`;
  - eyebrow kapital kecil, berwarna amber di latar gelap atau hijau di latar terang;
  - lebar paragraf sekitar 65 karakter.
- [ ] Struktur hero tidak berubah.
- [ ] Kontras teks memenuhi WCAG AA di latar terang dan gelap.
- [ ] Tes yang ada tetap lulus. Tampilan dicek manual di desktop dan HP.
