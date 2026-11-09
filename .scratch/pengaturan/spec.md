Status: ready-for-agent

# Spec: Menu Pengaturan

## Problem Statement

Pengaturan yang mengatur jalannya Open Booking belum punya tempat yang jelas. Kuota Kelas menjadi item sidebar tersendiri, dan setiap pengaturan baru akan menambah panjang sidebar.

Ruang OKB juga diketik bebas untuk setiap Pendaftar. Salah ketik seperti "Kelas 1A" dan "kelas 1 A" dianggap dua ruangan yang berbeda, sehingga pengelompokan Name Tag terpecah dan admin harus mengetik nama yang sama berulang kali.

## Solution

Sidebar dan menu mobile punya satu item **Pengaturan**, menggantikan item Kuota Kelas. Item itu membuka halaman dengan dua tab, dan setiap tab punya alamat sendiri:

| Tab | Alamat | Isi |
|---|---|---|
| **Kuota Kelas** (tab pembuka) | `/admin/pengaturan/kuota` | Halaman Kuota Kelas yang sudah ada |
| **Ruang OKB** | `/admin/pengaturan/ruang-okb` | Daftar ruangan, baru |

`/admin/pengaturan` mengarah ke tab Kuota Kelas. Alamat lama `/admin/kuota` dialihkan otomatis ke alamat baru.

Di **tab Ruang OKB**, admin menambah, mengganti nama, dan menghapus ruangan. Satu daftar berlaku untuk semua tanggal dan Gelombang OKB. Saat menetapkan Ruang OKB seorang Pendaftar, baik dari Detail Pendaftar maupun secara massal dari Name Tag, admin memilih dari daftar ini dan tidak lagi mengetik teks bebas.

## User Stories

### Navigasi

1. Sebagai admin, saya ingin satu item Pengaturan di sidebar, agar semua pengaturan Open Booking ada di satu tempat dan sidebar tetap ringkas.
2. Sebagai admin yang memakai HP, saya ingin item Pengaturan yang sama di menu mobile, agar navigasinya sama di semua perangkat.
3. Sebagai admin, saya ingin item Kuota Kelas tidak lagi muncul di sidebar, agar tidak ada dua jalan menuju halaman yang sama.
4. Sebagai admin, saya ingin item Pengaturan terlihat aktif pada kedua tab, agar saya tahu sedang berada di menu mana.
5. Sebagai admin, saya ingin menu Pengaturan terbuka di tab Kuota Kelas, agar perilakunya sama dengan menu OKB.
6. Sebagai admin, saya ingin setiap tab punya alamat sendiri, agar tab bisa dibuka langsung dan dimuat ulang.
7. Sebagai admin, saya ingin bookmark Kuota Kelas lama tetap berfungsi, agar pintasan saya tidak rusak.
8. Sebagai admin, saya ingin tautan dari kartu kuota di Ringkasan membuka tab Kuota Kelas, agar tidak melewati pengalihan.

### Daftar Ruang OKB

9. Sebagai admin, saya ingin menambah ruangan cukup dengan namanya, agar daftar cepat disiapkan.
10. Sebagai admin, saya ingin ditolak saat menambah ruangan yang namanya sudah ada, tanpa membedakan huruf besar/kecil dan spasi di awal atau akhir nama, agar daftar tidak dobel.
11. Sebagai admin, saya ingin nama ruangan dibatasi 30 karakter, agar tetap muat di Name Tag.
12. Sebagai admin, saya ingin ruangan diurutkan menurut nama dengan angka diurutkan sebagai angka ("Kelas 2" sebelum "Kelas 10"), agar mudah dicari.
13. Sebagai admin, saya ingin melihat berapa Pendaftar yang memakai setiap ruangan, agar tahu ruangan mana yang sedang dipakai.
14. Sebagai admin, saya ingin mengganti nama ruangan, agar salah ketik bisa dibetulkan.
15. Sebagai admin, saya ingin nama baru langsung berlaku untuk semua Pendaftar di ruangan itu, agar Name Tag yang dicetak sesudahnya memakai nama yang benar.
16. Sebagai admin, saya ingin ditolak saat mengganti nama menjadi nama ruangan lain yang sudah ada, agar daftar tidak dobel.
17. Sebagai admin, saya ingin menghapus ruangan yang tidak dipakai, agar daftar tetap rapi.
18. Sebagai admin, saya ingin penghapusan ruangan yang masih dipakai ditolak dengan pesan berapa Pendaftar yang memakainya, agar tidak ada Name Tag yang tercetak tanpa ruangan.

### Menetapkan Ruang OKB

19. Sebagai admin, saya ingin memilih Ruang OKB dari daftar di Detail Pendaftar, agar tidak salah ketik.
20. Sebagai admin, saya ingin memilih satu Ruang OKB dari daftar untuk banyak Pendaftar sekaligus di Name Tag, agar pembagian ruangan cepat.
21. Sebagai admin, saya ingin tetap bisa mengosongkan Ruang OKB seorang Pendaftar, seperti sekarang.
22. Sebagai admin, saya ingin melihat pesan "Belum ada ruangan. Tambahkan di Pengaturan" beserta tautannya bila daftar masih kosong, agar tahu langkah berikutnya.
23. Sebagai admin, saya ingin pengelompokan per ruangan di Name Tag mengikuti urutan ruangan yang sama, agar urutannya konsisten di semua halaman.
24. Sebagai admin, saya ingin Ruang OKB tetap dikosongkan otomatis ketika Jadwal OKB Pendaftar diubah atau dihapus, seperti sekarang.

### Data lama

25. Sebagai admin, saya ingin semua nama Ruang OKB yang sudah pernah diketik otomatis menjadi ruangan di daftar, dan Pendaftarnya tetap terhubung, agar tidak perlu mengisi ulang.
26. Sebagai admin, saya ingin nama lama yang hanya berbeda huruf besar/kecil atau spasi digabung menjadi satu ruangan, agar daftar langsung bersih.

## Implementation Decisions

### Navigasi dan alamat

- `AdminSection` mendapat `settings` menggantikan `capacity`. Item sidebar memakai label "Pengaturan" dan ikon pengaturan dari lucide.
- Tab memakai pola yang sama dengan `OkbTabs` di menu OKB, dengan layout bersama di `src/app/admin/pengaturan/`.
- Halaman `src/app/admin/kuota/page.tsx` dipindah ke `src/app/admin/pengaturan/kuota/page.tsx` tanpa mengubah isinya, kecuali kicker/judul bila perlu disesuaikan dengan tab.
- `/admin/pengaturan` mengarah ke `/admin/pengaturan/kuota`.
- `/admin/kuota` dialihkan lewat `redirects()` di `next.config.ts`, seperti pengalihan menu OKB.
- Semua `revalidatePath('/admin/kuota')` dan tautan ke `/admin/kuota` (termasuk `CapacityCard`) diganti ke alamat baru.

### Skema

- Tabel baru `ruang_okb` (`id UUID`, `nama TEXT NOT NULL`, `created_at`). `CHECK` menegakkan nama yang sudah dinormalkan (tanpa spasi di tepi atau berurutan) dengan panjang 1–30 karakter, dan indeks unik pada `lower(nama)` menegakkan keunikannya.
- `pendaftar` mendapat kolom `ruang_okb_id UUID REFERENCES ruang_okb(id) ON DELETE RESTRICT`. `RESTRICT` menjadi pengaman terakhir bila aksi hapus lolos dari pengecekan di aplikasi.
- Migrasi data: buat satu baris `ruang_okb` untuk setiap `lower(btrim(ruang_okb))` yang berbeda dari data lama, memakai salah satu ejaan aslinya sebagai nama. Lalu isi `pendaftar.ruang_okb_id` dan hapus kolom teks `pendaftar.ruang_okb`.
- Trigger `clear_ruang_okb_on_schedule_change` diubah agar mengosongkan `ruang_okb_id`.
- Tabel hanya diakses lewat service role, sama seperti tabel admin lainnya (RLS aktif tanpa policy untuk anon/authenticated).
- Ganti nama tidak perlu menyentuh `pendaftar` karena Pendaftar merujuk lewat `ruang_okb_id`.
- Fungsi `public.ruang_okb(public.pendaftar)` menjadi *computed column* PostgREST yang mengembalikan nama ruangan. Semua pembaca yang sudah memilih `ruang_okb` (Name Tag, Detail Pendaftar, Scan Kehadiran, ekspor) tetap berjalan tanpa diubah; penulisan lewat `ruang_okb_id`.

### Modul

- Modul domain murni untuk Ruang OKB: normalisasi nama (memakai `normalizeRuangOkb` yang sudah ada), kunci perbandingan (`lower` + trim), validasi panjang, dan pengurutan alami memakai `Intl.Collator('id', { numeric: true, sensitivity: 'base' })`. Pengurutan ini dipakai di Pengaturan, di pilihan Ruang OKB, dan di `nameTagGroups`.
- Repository `ruang_okb`: daftar ruangan beserta jumlah Pendaftar yang memakainya, tambah, ganti nama, dan hapus.
- Server action tambah, ganti nama, dan hapus ruangan, masing-masing dengan pengecekan sesi admin. Pelanggaran indeks unik dipetakan ke pesan "Nama ruangan sudah ada". Hapus menolak dengan "Masih dipakai N Pendaftar" bila ada Pendaftar yang merujuk ruangan itu, apa pun statusnya.
- `saveRuangOkbAction` menerima `ruangOkbId` (atau kosong untuk mengosongkan) menggantikan teks bebas, dan menolak id yang tidak ada di daftar.
- `RuangOkbField`, `RuangOkbForm`, dan `RuangOkbBulkForm` diganti dari input teks menjadi pilihan dari daftar, dengan opsi kosong untuk mengosongkan, dan menampilkan pesan beserta tautan ke Pengaturan bila daftar kosong.
- Form mencocokkan nama Ruang OKB tersimpan dengan daftar untuk menentukan pilihan awal; nama ruangan unik, jadi tidak perlu membaca `ruang_okb_id`.
- Bila daftar ruangan gagal dimuat, form menampilkan "Daftar Ruang OKB belum dapat dimuat. Muat ulang halaman.", bukan pesan daftar kosong.
- Form massal dikirim lewat `onSubmit` dan `startTransition`, bukan prop `action`: React mereset form setelah action, dan Radix Select ikut mengosongkan pilihannya, padahal pilihan ruangan harus tetap ada setelah gagal sebagian.

### Validasi ulang data

Aksi tambah, ganti nama, dan hapus ruangan memvalidasi ulang `/admin/pengaturan/ruang-okb`, `/admin/okb/name-tag`, `/admin/pendaftar`, dan `/admin/pendaftar/[id]`.

### Istilah

Definisi Ruang OKB di `CONTEXT.md` sudah diperbarui: Ruang OKB dipilih dari daftar yang disiapkan admin di Pengaturan. Teks antarmuka memakai "Ruang OKB" dan "ruangan", bukan "kelas" atau "lokasi".

## Testing Decisions

- Uji modul domain: normalisasi, kunci perbandingan dobel, batas 30 karakter, dan urutan alami ("Kelas 2" sebelum "Kelas 10", huruf besar/kecil tidak berpengaruh).
- Uji server action tambah, ganti nama, dan hapus: tanpa sesi, nama kosong atau terlalu panjang, nama dobel (termasuk beda huruf besar/kecil), hapus ruangan yang masih dipakai, dan jalur sukses beserta `revalidatePath`. Gunakan pola mock Supabase yang sama dengan `saveRuangOkbAction.test.ts`.
- Perbarui uji `saveRuangOkbAction` untuk masukan berupa id, termasuk id yang tidak dikenal.
- Uji komponen pilihan Ruang OKB (form tunggal dan massal): menampilkan ruangan dalam urutan alami, mengirim id yang dipilih, opsi mengosongkan, dan pesan ketika daftar kosong.
- Uji navigasi: item Pengaturan aktif pada kedua tab, item Kuota Kelas hilang, dan urutan tab.
- Uji `next.config.ts`: `/admin/kuota` dialihkan ke `/admin/pengaturan/kuota`.
- Perbarui uji yang merujuk `/admin/kuota` atau section `capacity`.

## Out of Scope

- Total kursi Siswa Baru (112), Tahun Pelajaran, dan jumlah Gelombang OKB sebagai pengaturan yang bisa diubah. Semuanya tetap ditulis di kode untuk sekarang.
- Memindahkan template Surat Penerimaan dari OKB → Pengumuman.
- Kapasitas atau keterangan lokasi ruangan, serta pembagian Pendaftar ke ruangan secara otomatis.
- Daftar ruangan yang berbeda per tanggal atau per Gelombang OKB.
- Mengurutkan ruangan secara manual (seret-lepas).

## Further Notes

Keputusan dari sesi grilling 2026-11-09: tahap pertama hanya Kuota Kelas dan Ruang OKB; satu daftar ruangan untuk semua hari OKB; ganti nama ikut ke semua Pendaftar; hapus ditolak selama masih dipakai; data teks lama dimigrasikan otomatis dengan penggabungan tanpa membedakan huruf besar/kecil.
