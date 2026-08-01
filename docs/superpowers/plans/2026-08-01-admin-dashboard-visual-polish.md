# Admin Dashboard Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyempurnakan hierarki visual, tipografi, copy, dan responsivitas dashboard admin SPMB tanpa mengubah data maupun aturan bisnisnya.

**Architecture:** Pertahankan `AdminHome` sebagai Server Component yang mengambil data Supabase, lalu gunakan `AdminStatCard` dan `AdminQuickActions` sebagai komponen presentasi terfokus. Perubahan dilakukan melalui kontrak sumber Vitest terlebih dahulu, kemudian implementasi Tailwind pada tiga file dashboard yang sudah ada.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase, Vitest, ESLint.

## Global Constraints

- Arah visual adalah gaya operasional seimbang yang terinspirasi dari kedisiplinan warna hijau dan bahasa sederhana Gojek, tanpa menyalin identitas mereknya.
- Gunakan Kumbh Sans untuk judul dan angka utama; gunakan Inter untuk isi, label, tabel, dan tindakan.
- Warna utama tetap `#00AA13`, hijau gelap `#00880F`, teks utama `#101820`, kanvas `#F6F7F5`, putih `#FFFFFF`, dan teks sekunder `#667085`.
- Hijau menandai identitas, tindakan utama, dan status positif; amber hanya untuk data yang membutuhkan perhatian.
- Urutan mobile adalah header, statistik, tabel, lalu aksi cepat; hanya kontainer tabel yang boleh memiliki overflow horizontal.
- Query Supabase, aturan bisnis, tabel database, shell admin, sidebar, header global, halaman login, dan halaman admin lain tidak diubah.
- Error query harus tetap melempar `Gagal memuat data dasbor. Silakan coba lagi.`; jangan menggantinya dengan angka nol atau empty state palsu.
- Komponen Jalur Siswa tetap tidak digunakan dan tidak dibuat kembali.

---

## File Map

- `tests/admin-design-system.test.ts`: kontrak regresi untuk copy, hierarki tipografi, responsivitas, error query, dan target sentuh dashboard.
- `src/app/admin/(dasbor)/page.tsx`: struktur header ringkasan, susunan statistik, tabel pendaftar, empty state, dan grid responsif.
- `src/components/admin/AdminStatCard.tsx`: presentasi label, angka, ikon, helper, dan tone statistik.
- `src/components/admin/AdminQuickActions.tsx`: copy dan presentasi tiga tautan tindakan operasional.

Tidak ada file atau komponen baru yang diperlukan.

### Task 1: Header Ringkasan dan Kartu Statistik

**Files:**
- Modify: `tests/admin-design-system.test.ts:102-128`
- Modify: `src/app/admin/(dasbor)/page.tsx:37-48`
- Modify: `src/components/admin/AdminStatCard.tsx:1-48`

**Interfaces:**
- Consumes: data `total`, `waiting`, dan `accepted` bertipe `number` dari query yang sudah ada; props `AdminStatCard` yang sudah ada (`label`, `value`, `helper`, `icon`, `tone`).
- Produces: header halaman dengan judul `Ringkasan Pendaftaran`, deskripsi, badge tahun ajaran, serta tiga kartu statistik dengan skala visual baru. Signature `AdminStatCard` tidak berubah.

- [ ] **Step 1: Tambahkan kontrak yang gagal untuk header dan kartu statistik**

Di dalam `describe("admin dashboard")`, ganti tes copy dashboard pertama dengan tes berikut. Biarkan tes penanganan error yang ada tetap utuh.

```ts
it("shows an operational summary hierarchy with real SPMB metrics", () => {
  const page = read("src/app/admin/(dasbor)/page.tsx");
  const statCard = read("src/components/admin/AdminStatCard.tsx");
  const quickActions = read("src/components/admin/AdminQuickActions.tsx");
  const source = `${page}\n${statCard}\n${quickActions}`;

  for (const text of [
    "Ringkasan Pendaftaran",
    "Pantau data pendaftar dan berkas yang perlu diperiksa.",
    "Tahun ajaran 2027/2028",
    "Total Pendaftar",
    "Semua pendaftar yang masuk",
    "Menunggu Verifikasi",
    "Berkas belum diperiksa",
    "Diterima",
    "Siswa yang dinyatakan diterima",
  ]) {
    expect(source).toContain(text);
  }

  expect(page).toContain("sm:flex-row sm:items-end sm:justify-between");
  expect(page).toContain("md:grid-cols-3");
  expect(statCard).toContain("admin-display");
  expect(statCard).toContain("text-4xl");
  expect(statCard).toContain("sm:p-6");
  expect(source).not.toContain("EnrollmentJourney");
  expect(existsSync(resolve("src/components/admin/EnrollmentJourney.tsx"))).toBe(false);
  expect(source).not.toMatch(/Maglo|Wallet|Transaction|balance|spending|saved|Working Capital|Income|Expenses|VISA|\$\d/);
});
```

- [ ] **Step 2: Jalankan tes dan pastikan kontrak baru gagal**

Run:

```bash
npm test -- tests/admin-design-system.test.ts
```

Expected: FAIL pada copy `Ringkasan Pendaftaran` atau `Semua pendaftar yang masuk`, karena implementasi masih memakai copy lama.

- [ ] **Step 3: Implementasikan header ringkasan yang responsif**

Di `src/app/admin/(dasbor)/page.tsx`, ubah pembuka JSX setelah `return (` hingga sebelum grid statistik menjadi:

```tsx
return (
  <div className="space-y-7 sm:space-y-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="admin-display text-[28px] font-extrabold leading-[1.15] tracking-[-0.025em] text-[#101820] sm:text-[32px]">
          Ringkasan Pendaftaran
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#667085]">
          Pantau data pendaftar dan berkas yang perlu diperiksa.
        </p>
      </div>
      <span className="inline-flex w-fit items-center rounded-full bg-[#E9F8EB] px-3 py-2 text-xs font-semibold text-[#00880F]">
        Tahun ajaran 2027/2028
      </span>
    </header>

    <div className="grid gap-4 md:grid-cols-3">
```

Pertahankan penutup elemen yang sudah ada; jangan memindahkan atau mengubah kode query.

- [ ] **Step 4: Perbarui copy pemanggilan kartu statistik**

Ganti tiga pemanggilan `AdminStatCard` menjadi:

```tsx
<AdminStatCard
  label="Total Pendaftar"
  value={total}
  helper="Semua pendaftar yang masuk"
  icon="users"
  tone="neutral"
/>
<AdminStatCard
  label="Menunggu Verifikasi"
  value={waiting}
  helper="Berkas belum diperiksa"
  icon="clock"
  tone="warning"
/>
<AdminStatCard
  label="Diterima"
  value={accepted}
  helper="Siswa yang dinyatakan diterima"
  icon="check"
  tone="success"
/>
```

- [ ] **Step 5: Perkuat tipografi dan ritme `AdminStatCard`**

Pertahankan tipe props dan `toneClasses`, lalu ganti JSX `return` pada `AdminStatCard` dengan:

```tsx
return (
  <section className={`${adminCardCls} flex min-h-[176px] flex-col justify-between p-5 sm:p-6`}>
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-5 text-[#667085]">{label}</p>
        <p className="admin-display mt-3 text-4xl font-extrabold leading-none tracking-[-0.03em] text-[#101820] sm:text-[40px]">
          {value}
        </p>
      </div>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
        <AdminIcon name={icon} className="h-5 w-5" />
      </span>
    </div>
    <p className={`mt-5 text-[13px] font-medium leading-5 ${styles.helper}`}>{helper}</p>
  </section>
);
```

- [ ] **Step 6: Jalankan tes terfokus dan lint file Task 1**

Run:

```bash
npm test -- tests/admin-design-system.test.ts
npx eslint 'src/app/admin/(dasbor)/page.tsx' src/components/admin/AdminStatCard.tsx tests/admin-design-system.test.ts
```

Expected: seluruh tes pada `admin-design-system.test.ts` PASS dan ESLint selesai tanpa error.

- [ ] **Step 7: Commit checkpoint header dan statistik**

```bash
git add tests/admin-design-system.test.ts 'src/app/admin/(dasbor)/page.tsx' src/components/admin/AdminStatCard.tsx
git commit -m "style(admin): strengthen dashboard summary hierarchy"
```

### Task 2: Tabel Operasional dan Aksi Cepat

**Files:**
- Modify: `tests/admin-design-system.test.ts:102-145`
- Modify: `src/app/admin/(dasbor)/page.tsx:50-101`
- Modify: `src/components/admin/AdminQuickActions.tsx:1-51`

**Interfaces:**
- Consumes: `waitingApplicants` dari `AdminHome`, route detail `/admin/pendaftar/[id]`, filter `/admin/pendaftar?verifikasi=menunggu`, dan `adminCardCls`.
- Produces: tabel berjudul `Perlu diperiksa`, dua baris empty state yang baru, dan tiga action link dengan route yang tidak berubah.

- [ ] **Step 1: Tambahkan kontrak yang gagal untuk tabel dan aksi cepat**

Tambahkan tes berikut setelah tes hierarki statistik di dalam `describe("admin dashboard")`:

```ts
it("uses concise operational copy and responsive dashboard work areas", () => {
  const page = read("src/app/admin/(dasbor)/page.tsx");
  const quickActions = read("src/components/admin/AdminQuickActions.tsx");
  const source = `${page}\n${quickActions}`;

  for (const text of [
    "Perlu diperiksa",
    "Pendaftar terbaru yang masih menunggu verifikasi berkas.",
    "Belum ada berkas yang perlu diperiksa.",
    "Semua pendaftar sudah ditindaklanjuti.",
    "Data Pendaftar",
    "Lihat dan kelola data calon siswa.",
    "Unduh Data Excel",
    "Simpan rekap pendaftaran dalam Excel.",
    "Atur Informasi Publik",
    "Perbarui informasi pada halaman utama.",
  ]) {
    expect(source).toContain(text);
  }

  expect(page).toContain("lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]");
  expect(page).toContain('className="overflow-x-auto"');
  expect(page).toContain("admin-display text-xl");
  expect(quickActions).toContain("min-h-[68px]");
  expect(quickActions).toContain("admin-display text-xl");
});
```

Pada tes `fails explicitly when dashboard queries fail and keeps table actions touch-friendly`, ganti dua assertion route/kelas dengan regex yang tetap valid ketika formatter memisahkan atribut JSX ke baris baru:

```ts
expect(page).toMatch(/href="\/admin\/pendaftar\?verifikasi=menunggu"\s+className="inline-flex min-h-11/);
expect(page).toMatch(/href=\{`\/admin\/pendaftar\/\$\{applicant\.id\}`\}\s+className="inline-flex min-h-11/);
```

- [ ] **Step 2: Jalankan tes dan pastikan copy operasional baru gagal**

Run:

```bash
npm test -- tests/admin-design-system.test.ts
```

Expected: FAIL pada `Perlu diperiksa` atau `Data Pendaftar`, karena halaman masih memakai label lama.

- [ ] **Step 3: Perbarui heading tabel, baris, dan empty state**

Di `src/app/admin/(dasbor)/page.tsx`, pertahankan struktur section, query, mapping, route, dan format tanggal. Terapkan perubahan berikut:

```tsx
<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-5 sm:px-6">
  <div>
    <h2 id="pendaftar-menunggu-title" className="admin-display text-xl font-bold tracking-[-0.015em] text-[#101820]">
      Perlu diperiksa
    </h2>
    <p className="mt-1 text-sm leading-6 text-[#667085]">
      Pendaftar terbaru yang masih menunggu verifikasi berkas.
    </p>
  </div>
  <Link
    href="/admin/pendaftar?verifikasi=menunggu"
    className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-sm font-semibold text-[#00880F] hover:bg-[#E9F8EB] hover:underline focus:outline-none focus:ring-4 focus:ring-[#00AA13]/15"
  >
    Lihat semua
  </Link>
</div>
```

Ubah kelas baris data menjadi:

```tsx
<tr key={applicant.id} className="h-16 transition-colors hover:bg-[#F6F7F5]">
```

Ubah empty state menjadi:

```tsx
<div className="px-6 py-12 text-center">
  <p className="font-semibold text-[#101820]">Belum ada berkas yang perlu diperiksa.</p>
  <p className="mt-1 text-sm text-[#667085]">Semua pendaftar sudah ditindaklanjuti.</p>
</div>
```

- [ ] **Step 4: Perbarui copy dan ukuran tindakan cepat**

Di `src/components/admin/AdminQuickActions.tsx`, ganti array `actions` dengan:

```tsx
const actions = [
  {
    href: "/admin/pendaftar",
    label: "Data Pendaftar",
    description: "Lihat dan kelola data calon siswa.",
    icon: "users" as const,
  },
  {
    href: "/admin/pendaftar/export",
    label: "Unduh Data Excel",
    description: "Simpan rekap pendaftaran dalam Excel.",
    icon: "download" as const,
  },
  {
    href: "/admin/konten",
    label: "Atur Informasi Publik",
    description: "Perbarui informasi pada halaman utama.",
    icon: "content" as const,
  },
];
```

Ganti JSX komponen dengan:

```tsx
return (
  <section className={`${adminCardCls} p-5 sm:p-6`} aria-labelledby="aksi-cepat-title">
    <h2 id="aksi-cepat-title" className="admin-display text-xl font-bold tracking-[-0.015em] text-[#101820]">
      Aksi cepat
    </h2>
    <nav className="mt-4 space-y-2" aria-label="Aksi cepat dasbor">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group flex min-h-[68px] items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#F6F7F5] focus:outline-none focus:ring-4 focus:ring-[#00AA13]/15"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9F8EB] text-[#00880F]">
            <AdminIcon name={action.icon} className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold leading-5 text-[#101820]">{action.label}</span>
            <span className="mt-0.5 block text-[13px] leading-5 text-[#667085]">{action.description}</span>
          </span>
          <AdminIcon
            name="arrow-right"
            className="h-4 w-4 shrink-0 text-[#667085] transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      ))}
    </nav>
  </section>
);
```

- [ ] **Step 5: Jalankan pengujian terfokus dan pastikan kontrak lama tetap aman**

Run:

```bash
npm test -- tests/admin-design-system.test.ts
npx eslint 'src/app/admin/(dasbor)/page.tsx' src/components/admin/AdminStatCard.tsx src/components/admin/AdminQuickActions.tsx tests/admin-design-system.test.ts
```

Expected: seluruh tes pada file tersebut PASS; kontrak error Supabase, target sentuh `min-h-11`, route, dan ketiadaan `EnrollmentJourney` tetap PASS; ESLint tanpa error.

- [ ] **Step 6: Jalankan verifikasi proyek**

Run:

```bash
npm test
npm run build
```

Expected: seluruh suite Vitest PASS dan build produksi Next.js selesai dengan exit code 0.

- [ ] **Step 7: Periksa responsivitas secara manual**

Run:

```bash
npm run dev
```

Periksa `/admin` pada lebar sekitar 390px, 768px, dan 1440px:

- 390px: header dan badge bertumpuk; kartu, tabel, dan aksi cepat tampil satu kolom; halaman tidak overflow horizontal.
- 768px: tiga kartu statistik sejajar; tabel tetap berada di atas aksi cepat.
- 1440px: tabel dan aksi cepat membentuk rasio kira-kira 2:1.
- Pada semua ukuran: hanya isi tabel yang dapat digeser horizontal, focus ring tautan terlihat, dan tidak ada bagian Jalur Siswa.

Hentikan server development dengan `Ctrl+C` setelah pemeriksaan.

- [ ] **Step 8: Commit checkpoint tabel dan aksi cepat**

```bash
git add tests/admin-design-system.test.ts 'src/app/admin/(dasbor)/page.tsx' src/components/admin/AdminQuickActions.tsx
git commit -m "style(admin): refine dashboard operational content"
```
