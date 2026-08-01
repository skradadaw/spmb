# Desain Warna Teks Input Login Admin

## Tujuan

Membedakan teks email dan password yang diketik dari teks putih lain pada halaman login admin, tanpa mengubah tampilan form lain di aplikasi.

## Cakupan

- Hanya input email dan password pada `/admin/login`.
- Tidak mengubah layout, label, placeholder, background, border, focus ring, maupun tombol login.
- Tidak mengubah `inputCls` bersama karena class tersebut digunakan oleh form publik dan admin lainnya.

## Desain Visual

- Teks yang diketik menggunakan lime `#c8ee44`, mengikuti warna aksen panel admin.
- Caret menggunakan lime `#c8ee44` agar konsisten dengan teks aktif.
- Placeholder tetap slate abu-abu yang sudah digunakan sekarang sehingga berbeda jelas dari nilai input.
- Tampilan autofill browser mempertahankan teks lime dan background gelap agar tidak kembali menjadi putih atau warna bawaan browser.

## Pendekatan Teknis

Tambahkan class CSS khusus pada kedua input login. Class ini mengatur `color`, `caret-color`, dan perilaku WebKit autofill. Aturan dibuat terlokalisasi melalui nama class khusus agar tidak memengaruhi input lain.

## Aksesibilitas

Warna lime `#c8ee44` digunakan di atas background `#1c1a2e`, memberikan kontras tinggi. Placeholder tetap memiliki warna berbeda sehingga pengguna dapat membedakan contoh isian dan nilai aktual.

## Pengujian

- Tes komponen memastikan kedua input login memakai class khusus.
- Tes memastikan class khusus mendefinisikan warna teks/caret lime dan penanganan autofill.
- Jalankan seluruh test suite, ESLint pada file yang diubah, serta production build.

## Kriteria Selesai

1. Email dan password yang diketik tampil lime, bukan putih.
2. Caret pada kedua input tampil lime.
3. Placeholder tetap abu-abu.
4. Autofill mempertahankan tampilan teks lime dan background gelap.
5. Form lain tidak mengalami perubahan styling.
