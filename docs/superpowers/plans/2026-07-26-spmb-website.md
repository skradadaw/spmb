# Rencana Implementasi Website SPMB SD Plus 3 Al-Muhajirin TA 2027/2028

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Website SPMB: landing page informatif, form pendaftaran wizard 3 langkah tanpa login, halaman bukti & cek status, serta panel admin (verifikasi, status penerimaan, export Excel, edit konten landing).

**Architecture:** Next.js App Router (TypeScript, Tailwind) di Vercel. Supabase menyediakan PostgreSQL (RLS tertutup, akses via service role di server), Storage bucket privat untuk dokumen, dan Auth untuk satu akun admin. Semua mutasi lewat server actions; publik tidak pernah menyentuh database langsung.

**Tech Stack:** Next.js 15+ (App Router), TypeScript, Tailwind CSS, `@supabase/supabase-js`, `@supabase/ssr`, Zod, ExcelJS, Vitest.

## Global Constraints

- Semua teks UI dan pesan error dalam **bahasa Indonesia**.
- **Mobile-first**: style dasar untuk layar HP; gunakan breakpoint `sm:`/`md:`/`lg:` hanya untuk memperluas ke layar besar.
- Warna utama: **emerald** Tailwind (`emerald-700` untuk tombol/aksen utama).
- Upload dokumen: hanya **JPG/PNG/PDF**, maksimal **2 MB** per file, divalidasi di server.
- Nomor pendaftaran: format **`SPMB-2728-0001`** — dibuat oleh database (generated column), bukan aplikasi.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Service role key **hanya** boleh dipakai di kode server, tidak pernah dikirim ke browser.
- Setiap server action admin **wajib** memeriksa sesi login sebelum mutasi.
- Data pribadi tidak boleh muncul di URL/query string.
- Node.js 20+, npm. Jalankan perintah dari root repo `/home/dani/Proyek/spmb`.

## Struktur File

```
supabase/schema.sql            # tabel, RLS, bucket, trigger
supabase/seed.sql              # konten landing default
src/lib/validation/pendaftar.ts  # skema Zod siswa/ortu
src/lib/files.ts               # aturan file upload
src/lib/status.ts              # konstanta & label status
src/lib/types.ts               # tipe Pendaftar, Dokumen, Konten
src/lib/supabase/admin.ts      # klien service-role (server only)
src/lib/supabase/server.ts     # klien SSR (auth admin, cookies)
src/lib/konten.ts              # baca konten landing
src/middleware.ts              # proteksi /admin/*
src/app/page.tsx               # landing
src/app/daftar/{page.tsx,actions.ts}
src/app/daftar/sukses/page.tsx
src/app/cek-status/{page.tsx,actions.ts}
src/app/admin/login/{page.tsx,actions.ts}
src/app/admin/(dasbor)/layout.tsx        # nav admin + logout
src/app/admin/(dasbor)/page.tsx          # dasbor ringkas
src/app/admin/(dasbor)/pendaftar/page.tsx
src/app/admin/(dasbor)/pendaftar/export/route.ts
src/app/admin/(dasbor)/pendaftar/[id]/{page.tsx,actions.ts}
src/app/admin/(dasbor)/konten/{page.tsx,actions.ts}
src/components/ui.tsx          # Field, inputCls, Badge
src/components/{Header,Footer}.tsx
src/components/daftar/{FormPendaftaran,StepSiswa,StepOrtu,StepDokumen}.tsx
src/components/admin/{StatusForm,ListEditor,KontakEditor}.tsx
tests/*.test.ts                # Vitest
```

---

### Task 1: Scaffold Proyek Next.js + Vitest

**Files:**
- Create: seluruh scaffold Next.js (via create-next-app), `vitest.config.ts`
- Modify: `package.json` (script test)

**Interfaces:**
- Produces: proyek Next.js berjalan (`npm run dev`), alias `@/*` → `src/*`, `npm test` menjalankan Vitest.

- [ ] **Step 1: Scaffold Next.js** (folder sudah berisi `docs/` dan `.git`, jadi scaffold di folder sementara lalu pindahkan)

```bash
cd /home/dani/Proyek/spmb
npx create-next-app@latest tmp-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cp -a tmp-app/. .
rm -rf tmp-app
npm install
```

- [ ] **Step 2: Install dependensi**

```bash
npm install @supabase/supabase-js @supabase/ssr zod exceljs
npm install -D vitest
```

- [ ] **Step 3: Buat `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: { environment: "node" },
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
```

- [ ] **Step 4: Tambah script test di `package.json`** — di objek `"scripts"` tambahkan:

```json
"test": "vitest run"
```

- [ ] **Step 5: Verifikasi**

Run: `npm run build`
Expected: build sukses tanpa error.

Run: `npm test`
Expected: keluar dengan pesan "No test files found" (belum ada test — itu normal).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js + Tailwind + Vitest"
```

---

### Task 2: Skema Database Supabase + Seed + Env

**Files:**
- Create: `supabase/schema.sql`, `supabase/seed.sql`, `.env.local.example`

**Interfaces:**
- Produces: tabel `pendaftar` (nomor otomatis `SPMB-2728-XXXX`, NIK unik), `dokumen`, `konten`; bucket privat `dokumen`; RLS tertutup kecuali `konten` boleh dibaca publik.

- [ ] **Step 1: Buat `supabase/schema.sql`**

```sql
-- Skema SPMB SD Plus 3 Al-Muhajirin TA 2027/2028
create table public.pendaftar (
  id uuid primary key default gen_random_uuid(),
  nomor_urut bigint generated always as identity,
  nomor_pendaftaran text generated always as
    ('SPMB-2728-' || lpad(nomor_urut::text, 4, '0')) stored,
  -- data calon siswa
  nama_lengkap text not null,
  nik text not null,
  tempat_lahir text not null,
  tanggal_lahir date not null,
  jenis_kelamin text not null check (jenis_kelamin in ('L', 'P')),
  alamat text not null,
  asal_tk text,
  -- data orang tua / wali
  nama_ayah text not null,
  pekerjaan_ayah text not null,
  pendidikan_ayah text not null,
  nama_ibu text not null,
  pekerjaan_ibu text not null,
  pendidikan_ibu text not null,
  nama_wali text,
  pekerjaan_wali text,
  no_whatsapp text not null,
  -- status
  status_verifikasi text not null default 'menunggu'
    check (status_verifikasi in ('menunggu', 'terverifikasi', 'perlu_perbaikan')),
  status_penerimaan text not null default 'menunggu'
    check (status_penerimaan in ('menunggu', 'diterima', 'tidak_diterima')),
  catatan_admin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pendaftar_nik_unik unique (nik),
  constraint pendaftar_nomor_unik unique (nomor_pendaftaran)
);

create table public.dokumen (
  id uuid primary key default gen_random_uuid(),
  pendaftar_id uuid not null references public.pendaftar (id) on delete cascade,
  jenis text not null check (jenis in ('kartu_keluarga', 'akta_kelahiran', 'pas_foto')),
  path_storage text not null,
  created_at timestamptz not null default now(),
  constraint dokumen_unik_per_jenis unique (pendaftar_id, jenis)
);

create table public.konten (
  key text primary key,
  isi jsonb not null,
  updated_at timestamptz not null default now()
);

-- updated_at otomatis
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger pendaftar_updated_at before update on public.pendaftar
  for each row execute function public.set_updated_at();
create trigger konten_updated_at before update on public.konten
  for each row execute function public.set_updated_at();

-- RLS: tutup semua akses publik; service role melewati RLS.
alter table public.pendaftar enable row level security;
alter table public.dokumen enable row level security;
alter table public.konten enable row level security;

-- konten boleh dibaca siapa saja (isinya memang untuk landing page)
create policy "konten dibaca publik" on public.konten
  for select to anon, authenticated using (true);

-- bucket privat untuk dokumen upload
insert into storage.buckets (id, name, public)
values ('dokumen', 'dokumen', false)
on conflict (id) do nothing;
```

- [ ] **Step 2: Buat `supabase/seed.sql`** (konten landing default; admin dapat mengubahnya nanti)

```sql
insert into public.konten (key, isi) values
('jadwal', '[
  {"tahapan": "Pendaftaran Gelombang 1", "tanggal": "1 Oktober – 31 Desember 2026"},
  {"tahapan": "Pendaftaran Gelombang 2", "tanggal": "1 Januari – 31 Maret 2027"},
  {"tahapan": "Pengumuman Hasil", "tanggal": "15 April 2027"},
  {"tahapan": "Daftar Ulang", "tanggal": "16 – 30 April 2027"}
]'::jsonb),
('syarat', '[
  {"teks": "Usia minimal 6 tahun pada 1 Juli 2027"},
  {"teks": "Fotokopi Kartu Keluarga"},
  {"teks": "Fotokopi Akta Kelahiran"},
  {"teks": "Pas foto terbaru"}
]'::jsonb),
('biaya', '[
  {"item": "Biaya Pendaftaran", "jumlah": "Rp 200.000"},
  {"item": "Uang Pangkal", "jumlah": "Hubungi panitia"},
  {"item": "SPP per Bulan", "jumlah": "Hubungi panitia"}
]'::jsonb),
('faq', '[
  {"tanya": "Apakah pendaftaran harus datang ke sekolah?", "jawab": "Tidak. Pendaftaran dilakukan online melalui website ini. Verifikasi berkas asli dilakukan saat daftar ulang."},
  {"tanya": "Bagaimana cara mengetahui hasil seleksi?", "jawab": "Gunakan menu Cek Status dengan nomor pendaftaran dan tanggal lahir anak."}
]'::jsonb),
('kontak', '{"whatsapp": "081234567890", "telepon": "0264-123456", "alamat": "Jl. Contoh No. 1, Purwakarta"}'::jsonb)
on conflict (key) do nothing;
```

- [ ] **Step 3: Buat `.env.local.example`**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi-anon-key
SUPABASE_SERVICE_ROLE_KEY=isi-service-role-key
```

- [ ] **Step 4: Setup Supabase (manual, satu kali)**

1. Buat proyek di https://supabase.com (free tier).
2. SQL Editor → jalankan isi `supabase/schema.sql`, lalu `supabase/seed.sql`. Expected: "Success. No rows returned".
3. Verifikasi nomor otomatis — jalankan di SQL Editor:
   ```sql
   insert into public.pendaftar (nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, nama_ayah, pekerjaan_ayah, pendidikan_ayah, nama_ibu, pekerjaan_ibu, pendidikan_ibu, no_whatsapp)
   values ('Tes', '1234567890123456', 'Purwakarta', '2021-01-01', 'L', 'Alamat tes', 'Ayah', 'Karyawan', 'S1', 'Ibu', 'IRT', 'SMA', '081234567890')
   returning nomor_pendaftaran;
   ```
   Expected: `SPMB-2728-0001`. Lalu hapus: `delete from public.pendaftar;`
4. Settings → API: salin URL, anon key, service role key ke file `.env.local` (copy dari `.env.local.example`).

- [ ] **Step 5: Pastikan `.env.local` di-gitignore**

Run: `grep -n "env" .gitignore`
Expected: ada pola yang mencakup `.env*` (default create-next-app). Jika tidak ada, tambahkan baris `.env*.local`.

- [ ] **Step 6: Commit**

```bash
git add supabase/ .env.local.example
git commit -m "feat: skema database, seed konten, contoh env"
```

---

### Task 3: Skema Validasi Zod (TDD)

**Files:**
- Create: `src/lib/validation/pendaftar.ts`
- Test: `tests/validation.test.ts`

**Interfaces:**
- Produces: `siswaSchema`, `ortuSchema`, `pendaftarSchema` (gabungan keduanya) dari `@/lib/validation/pendaftar`. Semua field string; `jenis_kelamin` enum `"L" | "P"`; `asal_tk`, `nama_wali`, `pekerjaan_wali` boleh kosong.

- [ ] **Step 1: Tulis test yang gagal** — `tests/validation.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { siswaSchema, ortuSchema, pendaftarSchema } from "@/lib/validation/pendaftar";

const siswaValid = {
  nama_lengkap: "Ahmad Fauzi",
  nik: "3214010101210001",
  tempat_lahir: "Purwakarta",
  tanggal_lahir: "2021-03-15",
  jenis_kelamin: "L",
  alamat: "Jl. Veteran No. 10, Purwakarta",
  asal_tk: "",
};

const ortuValid = {
  nama_ayah: "Budi Santoso",
  pekerjaan_ayah: "Karyawan Swasta",
  pendidikan_ayah: "S1",
  nama_ibu: "Siti Aminah",
  pekerjaan_ibu: "Ibu Rumah Tangga",
  pendidikan_ibu: "SMA/Sederajat",
  nama_wali: "",
  pekerjaan_wali: "",
  no_whatsapp: "081234567890",
};

describe("siswaSchema", () => {
  it("menerima data valid", () => {
    expect(siswaSchema.safeParse(siswaValid).success).toBe(true);
  });
  it("menolak NIK bukan 16 digit", () => {
    const r = siswaSchema.safeParse({ ...siswaValid, nik: "123" });
    expect(r.success).toBe(false);
  });
  it("menolak NIK berisi huruf", () => {
    expect(siswaSchema.safeParse({ ...siswaValid, nik: "32140101012100AB" }).success).toBe(false);
  });
  it("menolak tanggal lahir di masa depan", () => {
    expect(siswaSchema.safeParse({ ...siswaValid, tanggal_lahir: "2030-01-01" }).success).toBe(false);
  });
  it("menolak jenis kelamin selain L/P", () => {
    expect(siswaSchema.safeParse({ ...siswaValid, jenis_kelamin: "X" }).success).toBe(false);
  });
  it("menolak nama kosong", () => {
    expect(siswaSchema.safeParse({ ...siswaValid, nama_lengkap: "" }).success).toBe(false);
  });
});

describe("ortuSchema", () => {
  it("menerima data valid (wali kosong)", () => {
    expect(ortuSchema.safeParse(ortuValid).success).toBe(true);
  });
  it("menolak nomor WhatsApp tidak diawali 08", () => {
    expect(ortuSchema.safeParse({ ...ortuValid, no_whatsapp: "62812345678" }).success).toBe(false);
  });
  it("menolak nomor WhatsApp terlalu pendek", () => {
    expect(ortuSchema.safeParse({ ...ortuValid, no_whatsapp: "0812345" }).success).toBe(false);
  });
});

describe("pendaftarSchema", () => {
  it("menerima gabungan data valid", () => {
    expect(pendaftarSchema.safeParse({ ...siswaValid, ...ortuValid }).success).toBe(true);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npm test`
Expected: FAIL — module `@/lib/validation/pendaftar` tidak ditemukan.

- [ ] **Step 3: Implementasi** — `src/lib/validation/pendaftar.ts`

```ts
import { z } from "zod";

const wajib = (label: string, min = 2) =>
  z.string().trim().min(min, `${label} wajib diisi`);

const opsional = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""));

export const siswaSchema = z.object({
  nama_lengkap: wajib("Nama lengkap", 3),
  nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit angka"),
  tempat_lahir: wajib("Tempat lahir"),
  tanggal_lahir: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal lahir wajib diisi")
    .refine((v) => {
      const t = Date.parse(v);
      return !Number.isNaN(t) && t < Date.now();
    }, "Tanggal lahir tidak valid"),
  jenis_kelamin: z.enum(["L", "P"], { message: "Pilih jenis kelamin" }),
  alamat: wajib("Alamat", 10),
  asal_tk: opsional,
});

export const ortuSchema = z.object({
  nama_ayah: wajib("Nama ayah", 3),
  pekerjaan_ayah: wajib("Pekerjaan ayah"),
  pendidikan_ayah: wajib("Pendidikan ayah"),
  nama_ibu: wajib("Nama ibu", 3),
  pekerjaan_ibu: wajib("Pekerjaan ibu"),
  pendidikan_ibu: wajib("Pendidikan ibu"),
  nama_wali: opsional,
  pekerjaan_wali: opsional,
  no_whatsapp: z
    .string()
    .regex(/^08\d{8,11}$/, "Nomor WhatsApp tidak valid (contoh: 081234567890)"),
});

export const pendaftarSchema = siswaSchema.merge(ortuSchema);

export type DataSiswa = z.infer<typeof siswaSchema>;
export type DataOrtu = z.infer<typeof ortuSchema>;
export type DataPendaftar = z.infer<typeof pendaftarSchema>;

/** Ubah error Zod menjadi peta { namaField: pesan } untuk ditampilkan di form. */
export function petaError(error: z.ZodError): Record<string, string> {
  const peta: Record<string, string> = {};
  for (const issue of error.issues) {
    const k = String(issue.path[0] ?? "");
    if (k && !peta[k]) peta[k] = issue.message;
  }
  return peta;
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `npm test`
Expected: PASS semua (10 test).

- [ ] **Step 5: Commit**

```bash
git add src/lib/validation/pendaftar.ts tests/validation.test.ts
git commit -m "feat: skema validasi Zod data pendaftar"
```

---

### Task 4: Aturan File Upload (TDD)

**Files:**
- Create: `src/lib/files.ts`
- Test: `tests/files.test.ts`

**Interfaces:**
- Produces: `JENIS_DOKUMEN` (`["kartu_keluarga","akta_kelahiran","pas_foto"]`), `type JenisDokumen`, `LABEL_DOKUMEN`, `MAX_FILE_SIZE`, `ALLOWED_TYPES` (mime → ekstensi), `validasiDokumen(file: {type: string; size: number}): string | null` (null = valid, string = pesan error Indonesia).

- [ ] **Step 1: Tulis test yang gagal** — `tests/files.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { validasiDokumen, MAX_FILE_SIZE, JENIS_DOKUMEN, ALLOWED_TYPES } from "@/lib/files";

describe("validasiDokumen", () => {
  it("menerima JPG di bawah 2 MB", () => {
    expect(validasiDokumen({ type: "image/jpeg", size: 500_000 })).toBeNull();
  });
  it("menerima PNG dan PDF", () => {
    expect(validasiDokumen({ type: "image/png", size: 1000 })).toBeNull();
    expect(validasiDokumen({ type: "application/pdf", size: 1000 })).toBeNull();
  });
  it("menolak tipe lain", () => {
    expect(validasiDokumen({ type: "image/webp", size: 1000 })).toMatch(/JPG, PNG, atau PDF/);
  });
  it("menolak file lebih dari 2 MB", () => {
    expect(validasiDokumen({ type: "image/jpeg", size: MAX_FILE_SIZE + 1 })).toMatch(/2 MB/);
  });
  it("menolak file kosong", () => {
    expect(validasiDokumen({ type: "image/jpeg", size: 0 })).not.toBeNull();
  });
});

describe("konstanta", () => {
  it("tiga jenis dokumen", () => {
    expect(JENIS_DOKUMEN).toEqual(["kartu_keluarga", "akta_kelahiran", "pas_foto"]);
  });
  it("peta mime ke ekstensi", () => {
    expect(ALLOWED_TYPES["image/jpeg"]).toBe("jpg");
    expect(ALLOWED_TYPES["application/pdf"]).toBe("pdf");
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npm test`
Expected: FAIL — module `@/lib/files` tidak ditemukan.

- [ ] **Step 3: Implementasi** — `src/lib/files.ts`

```ts
export const JENIS_DOKUMEN = ["kartu_keluarga", "akta_kelahiran", "pas_foto"] as const;
export type JenisDokumen = (typeof JENIS_DOKUMEN)[number];

export const LABEL_DOKUMEN: Record<JenisDokumen, string> = {
  kartu_keluarga: "Kartu Keluarga",
  akta_kelahiran: "Akta Kelahiran",
  pas_foto: "Pas Foto",
};

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

export function validasiDokumen(file: { type: string; size: number }): string | null {
  if (!ALLOWED_TYPES[file.type]) return "Tipe file harus JPG, PNG, atau PDF";
  if (file.size === 0) return "File kosong atau gagal terbaca";
  if (file.size > MAX_FILE_SIZE) return "Ukuran file maksimal 2 MB";
  return null;
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `npm test`
Expected: PASS semua.

- [ ] **Step 5: Commit**

```bash
git add src/lib/files.ts tests/files.test.ts
git commit -m "feat: aturan validasi file dokumen upload"
```

---

### Task 5: Klien Supabase, Tipe Data & Label Status

**Files:**
- Create: `src/lib/supabase/admin.ts`, `src/lib/supabase/server.ts`, `src/lib/status.ts`, `src/lib/types.ts`

**Interfaces:**
- Produces:
  - `createAdminClient()` dari `@/lib/supabase/admin` — klien service-role, server only.
  - `createServerSupabase()` dari `@/lib/supabase/server` — klien SSR ber-cookie (async), untuk auth admin.
  - Dari `@/lib/status`: `STATUS_VERIFIKASI`, `STATUS_PENERIMAAN` (array as const), `type StatusVerifikasi`, `type StatusPenerimaan`, `LABEL_VERIFIKASI`, `LABEL_PENERIMAAN` (peta label Indonesia).
  - Dari `@/lib/types`: `Pendaftar`, `Dokumen`, `JadwalItem`, `SyaratItem`, `BiayaItem`, `FaqItem`, `Kontak`, `Konten`, `KontenKey`.

- [ ] **Step 1: Buat `src/lib/supabase/admin.ts`**

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Klien service-role: melewati RLS. HANYA untuk kode server. */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
```

Catatan: `server-only` perlu diinstall: `npm install server-only`

- [ ] **Step 2: Buat `src/lib/supabase/server.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Klien SSR dengan cookie sesi — dipakai untuk auth admin. */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // dipanggil dari Server Component: aman diabaikan (middleware yang menyegarkan sesi)
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Buat `src/lib/status.ts`**

```ts
export const STATUS_VERIFIKASI = ["menunggu", "terverifikasi", "perlu_perbaikan"] as const;
export const STATUS_PENERIMAAN = ["menunggu", "diterima", "tidak_diterima"] as const;

export type StatusVerifikasi = (typeof STATUS_VERIFIKASI)[number];
export type StatusPenerimaan = (typeof STATUS_PENERIMAAN)[number];

export const LABEL_VERIFIKASI: Record<StatusVerifikasi, string> = {
  menunggu: "Menunggu Verifikasi",
  terverifikasi: "Terverifikasi",
  perlu_perbaikan: "Perlu Perbaikan",
};

export const LABEL_PENERIMAAN: Record<StatusPenerimaan, string> = {
  menunggu: "Menunggu Pengumuman",
  diterima: "Diterima",
  tidak_diterima: "Tidak Diterima",
};
```

- [ ] **Step 4: Buat `src/lib/types.ts`**

```ts
import type { StatusPenerimaan, StatusVerifikasi } from "@/lib/status";
import type { JenisDokumen } from "@/lib/files";

export type Pendaftar = {
  id: string;
  nomor_urut: number;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  nik: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P";
  alamat: string;
  asal_tk: string | null;
  nama_ayah: string;
  pekerjaan_ayah: string;
  pendidikan_ayah: string;
  nama_ibu: string;
  pekerjaan_ibu: string;
  pendidikan_ibu: string;
  nama_wali: string | null;
  pekerjaan_wali: string | null;
  no_whatsapp: string;
  status_verifikasi: StatusVerifikasi;
  status_penerimaan: StatusPenerimaan;
  catatan_admin: string | null;
  created_at: string;
  updated_at: string;
};

export type Dokumen = {
  id: string;
  pendaftar_id: string;
  jenis: JenisDokumen;
  path_storage: string;
  created_at: string;
};

export type JadwalItem = { tahapan: string; tanggal: string };
export type SyaratItem = { teks: string };
export type BiayaItem = { item: string; jumlah: string };
export type FaqItem = { tanya: string; jawab: string };
export type Kontak = { whatsapp: string; telepon: string; alamat: string };

export type Konten = {
  jadwal: JadwalItem[];
  syarat: SyaratItem[];
  biaya: BiayaItem[];
  faq: FaqItem[];
  kontak: Kontak;
};

export type KontenKey = keyof Konten;
```

- [ ] **Step 5: Verifikasi typecheck**

Run: `npm install server-only && npx tsc --noEmit`
Expected: tanpa error.

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase/ src/lib/status.ts src/lib/types.ts package.json package-lock.json
git commit -m "feat: klien Supabase, tipe data, label status"
```

---

### Task 6: Server Action `submitPendaftaran` (TDD)

**Files:**
- Create: `src/app/daftar/actions.ts`
- Test: `tests/submit-pendaftaran.test.ts`

**Interfaces:**
- Consumes: `pendaftarSchema`, `petaError` (Task 3); `validasiDokumen`, `JENIS_DOKUMEN`, `ALLOWED_TYPES`, `LABEL_DOKUMEN` (Task 4); `createAdminClient` (Task 5).
- Produces: `submitPendaftaran(formData: FormData): Promise<SubmitResult>` dengan

  ```ts
  export type SubmitResult =
    | { ok: true; nomor_pendaftaran: string }
    | { ok: false; error: string; fieldErrors?: Record<string, string> };
  ```

  Field form: semua nama field skema Zod, plus file `dokumen_kartu_keluarga`, `dokumen_akta_kelahiran`, `dokumen_pas_foto`.

- [ ] **Step 1: Tulis test yang gagal** — `tests/submit-pendaftaran.test.ts`

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Fake klien Supabase yang bisa dikonfigurasi per test ---
type FakeOpts = {
  existingNik?: boolean;
  insertErrorCode?: string;
  uploadFailsAt?: number; // upload ke-N (1-based) gagal
};

const state: {
  opts: FakeOpts;
  deletedPendaftar: string[];
  removedPaths: string[];
  uploads: string[];
} = { opts: {}, deletedPendaftar: [], removedPaths: [], uploads: [] };

function fakeClient() {
  let uploadCount = 0;
  return {
    from(table: string) {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: state.opts.existingNik ? { id: "dup" } : null,
              error: null,
            }),
          }),
        }),
        insert: (_row: unknown) => {
          if (table === "dokumen") {
            return Promise.resolve({ error: null });
          }
          return {
            select: () => ({
              single: async () =>
                state.opts.insertErrorCode
                  ? { data: null, error: { code: state.opts.insertErrorCode } }
                  : {
                      data: { id: "p1", nomor_pendaftaran: "SPMB-2728-0001" },
                      error: null,
                    },
            }),
          };
        },
        delete: () => ({
          eq: async (_c: string, v: string) => {
            state.deletedPendaftar.push(v);
            return { error: null };
          },
        }),
      };
    },
    storage: {
      from: () => ({
        upload: async (path: string) => {
          uploadCount++;
          if (state.opts.uploadFailsAt === uploadCount) {
            return { error: { message: "gagal" } };
          }
          state.uploads.push(path);
          return { error: null };
        },
        remove: async (paths: string[]) => {
          state.removedPaths.push(...paths);
          return { error: null };
        },
      }),
    },
  };
}

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fakeClient() }));
vi.mock("server-only", () => ({}));

import { submitPendaftaran } from "@/app/daftar/actions";

function fileValid(nama: string) {
  return new File([new Uint8Array(1024)], nama, { type: "image/jpeg" });
}

function formValid(override: Record<string, string | File> = {}) {
  const fd = new FormData();
  const data: Record<string, string> = {
    nama_lengkap: "Ahmad Fauzi",
    nik: "3214010101210001",
    tempat_lahir: "Purwakarta",
    tanggal_lahir: "2021-03-15",
    jenis_kelamin: "L",
    alamat: "Jl. Veteran No. 10, Purwakarta",
    asal_tk: "TK Melati",
    nama_ayah: "Budi Santoso",
    pekerjaan_ayah: "Karyawan Swasta",
    pendidikan_ayah: "S1",
    nama_ibu: "Siti Aminah",
    pekerjaan_ibu: "Ibu Rumah Tangga",
    pendidikan_ibu: "SMA/Sederajat",
    nama_wali: "",
    pekerjaan_wali: "",
    no_whatsapp: "081234567890",
  };
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  fd.set("dokumen_kartu_keluarga", fileValid("kk.jpg"));
  fd.set("dokumen_akta_kelahiran", fileValid("akta.jpg"));
  fd.set("dokumen_pas_foto", fileValid("foto.jpg"));
  for (const [k, v] of Object.entries(override)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  state.opts = {};
  state.deletedPendaftar = [];
  state.removedPaths = [];
  state.uploads = [];
});

describe("submitPendaftaran", () => {
  it("sukses: mengembalikan nomor pendaftaran dan mengupload 3 dokumen", async () => {
    const r = await submitPendaftaran(formValid());
    expect(r).toEqual({ ok: true, nomor_pendaftaran: "SPMB-2728-0001" });
    expect(state.uploads).toHaveLength(3);
    expect(state.uploads[0]).toBe("p1/kartu_keluarga.jpg");
  });

  it("menolak data tidak valid dengan fieldErrors", async () => {
    const r = await submitPendaftaran(formValid({ nik: "123" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors?.nik).toMatch(/16 digit/);
  });

  it("menolak NIK yang sudah terdaftar", async () => {
    state.opts.existingNik = true;
    const r = await submitPendaftaran(formValid());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/sudah terdaftar/);
  });

  it("menolak jika ada dokumen yang hilang", async () => {
    const fd = formValid();
    fd.delete("dokumen_pas_foto");
    const r = await submitPendaftaran(fd);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Pas Foto/);
  });

  it("menolak dokumen dengan tipe salah", async () => {
    const salah = new File([new Uint8Array(10)], "kk.gif", { type: "image/gif" });
    const r = await submitPendaftaran(formValid({ dokumen_kartu_keluarga: salah }));
    expect(r.ok).toBe(false);
  });

  it("membersihkan data saat upload gagal (tidak ada data setengah jadi)", async () => {
    state.opts.uploadFailsAt = 2;
    const r = await submitPendaftaran(formValid());
    expect(r.ok).toBe(false);
    expect(state.deletedPendaftar).toContain("p1");
    expect(state.removedPaths).toContain("p1/kartu_keluarga.jpg");
  });

  it("menangani race NIK ganda dari constraint unik (kode 23505)", async () => {
    state.opts.insertErrorCode = "23505";
    const r = await submitPendaftaran(formValid());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/sudah terdaftar/);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npm test`
Expected: FAIL — module `@/app/daftar/actions` tidak ditemukan.

- [ ] **Step 3: Implementasi** — `src/app/daftar/actions.ts`

```ts
"use server";

import { pendaftarSchema, petaError } from "@/lib/validation/pendaftar";
import {
  ALLOWED_TYPES,
  JENIS_DOKUMEN,
  LABEL_DOKUMEN,
  validasiDokumen,
  type JenisDokumen,
} from "@/lib/files";
import { createAdminClient } from "@/lib/supabase/admin";

export type SubmitResult =
  | { ok: true; nomor_pendaftaran: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const PESAN_NIK_GANDA =
  "NIK sudah terdaftar. Gunakan menu Cek Status untuk melihat status pendaftaran Anda.";
const PESAN_GAGAL = "Terjadi kesalahan saat menyimpan. Silakan coba lagi.";

export async function submitPendaftaran(formData: FormData): Promise<SubmitResult> {
  // 1. Validasi data teks
  const raw: Record<string, string> = {};
  for (const key of Object.keys(pendaftarSchema.shape)) {
    raw[key] = String(formData.get(key) ?? "");
  }
  const parsed = pendaftarSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Data belum lengkap atau tidak valid. Periksa kembali isian Anda.",
      fieldErrors: petaError(parsed.error),
    };
  }
  const d = parsed.data;

  // 2. Validasi kelengkapan & aturan file
  const files = {} as Record<JenisDokumen, File>;
  for (const jenis of JENIS_DOKUMEN) {
    const f = formData.get(`dokumen_${jenis}`);
    if (!(f instanceof File) || f.size === 0) {
      return { ok: false, error: `Dokumen ${LABEL_DOKUMEN[jenis]} belum diunggah.` };
    }
    const err = validasiDokumen(f);
    if (err) {
      return { ok: false, error: `${LABEL_DOKUMEN[jenis]}: ${err}` };
    }
    files[jenis] = f;
  }

  const supabase = createAdminClient();

  // 3. Cek NIK ganda (cek dini agar pesan ramah; constraint unik tetap jadi jaring pengaman)
  const { data: sudahAda } = await supabase
    .from("pendaftar")
    .select("id")
    .eq("nik", d.nik)
    .maybeSingle();
  if (sudahAda) return { ok: false, error: PESAN_NIK_GANDA };

  // 4. Simpan pendaftar (nomor pendaftaran dibuat otomatis oleh database)
  const { data: pendaftar, error: insertError } = await supabase
    .from("pendaftar")
    .insert({
      nama_lengkap: d.nama_lengkap,
      nik: d.nik,
      tempat_lahir: d.tempat_lahir,
      tanggal_lahir: d.tanggal_lahir,
      jenis_kelamin: d.jenis_kelamin,
      alamat: d.alamat,
      asal_tk: d.asal_tk || null,
      nama_ayah: d.nama_ayah,
      pekerjaan_ayah: d.pekerjaan_ayah,
      pendidikan_ayah: d.pendidikan_ayah,
      nama_ibu: d.nama_ibu,
      pekerjaan_ibu: d.pekerjaan_ibu,
      pendidikan_ibu: d.pendidikan_ibu,
      nama_wali: d.nama_wali || null,
      pekerjaan_wali: d.pekerjaan_wali || null,
      no_whatsapp: d.no_whatsapp,
    })
    .select("id, nomor_pendaftaran")
    .single();

  if (insertError || !pendaftar) {
    if (insertError?.code === "23505") return { ok: false, error: PESAN_NIK_GANDA };
    return { ok: false, error: PESAN_GAGAL };
  }

  // 5. Upload dokumen; jika gagal, bersihkan semuanya (tidak boleh ada data setengah jadi)
  const terupload: string[] = [];
  for (const jenis of JENIS_DOKUMEN) {
    const file = files[jenis];
    const path = `${pendaftar.id}/${jenis}.${ALLOWED_TYPES[file.type]}`;
    const { error: uploadError } = await supabase.storage
      .from("dokumen")
      .upload(path, file, { contentType: file.type });
    if (uploadError) {
      await bersihkan(supabase, pendaftar.id, terupload);
      return { ok: false, error: PESAN_GAGAL };
    }
    terupload.push(path);

    const { error: dokumenError } = await supabase
      .from("dokumen")
      .insert({ pendaftar_id: pendaftar.id, jenis, path_storage: path });
    if (dokumenError) {
      await bersihkan(supabase, pendaftar.id, terupload);
      return { ok: false, error: PESAN_GAGAL };
    }
  }

  return { ok: true, nomor_pendaftaran: pendaftar.nomor_pendaftaran };
}

async function bersihkan(
  supabase: ReturnType<typeof createAdminClient>,
  pendaftarId: string,
  paths: string[]
) {
  if (paths.length > 0) await supabase.storage.from("dokumen").remove(paths);
  // baris dokumen ikut terhapus lewat on delete cascade
  await supabase.from("pendaftar").delete().eq("id", pendaftarId);
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `npm test`
Expected: PASS semua (7 test baru).

- [ ] **Step 5: Commit**

```bash
git add src/app/daftar/actions.ts tests/submit-pendaftaran.test.ts
git commit -m "feat: server action submit pendaftaran dengan rollback"
```

---

### Task 7: Server Action `cekStatus` (TDD)

**Files:**
- Create: `src/app/cek-status/actions.ts`
- Test: `tests/cek-status.test.ts`

**Interfaces:**
- Consumes: `createAdminClient` (Task 5), tipe status (Task 5).
- Produces: `cekStatus(input: { nomor: string; tanggal_lahir: string }): Promise<CekStatusResult>` dengan

  ```ts
  export type CekStatusResult =
    | {
        ok: true;
        nama_lengkap: string;
        status_verifikasi: StatusVerifikasi;
        status_penerimaan: StatusPenerimaan;
        catatan_admin: string | null;
      }
    | { ok: false; error: string };
  ```

- [ ] **Step 1: Tulis test yang gagal** — `tests/cek-status.test.ts`

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const state: { row: unknown } = { row: null };

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: state.row, error: null }),
          }),
        }),
      }),
    }),
  }),
}));
vi.mock("server-only", () => ({}));

import { cekStatus } from "@/app/cek-status/actions";

beforeEach(() => {
  state.row = null;
});

describe("cekStatus", () => {
  it("mengembalikan status jika nomor + tanggal lahir cocok", async () => {
    state.row = {
      nama_lengkap: "Ahmad Fauzi",
      status_verifikasi: "terverifikasi",
      status_penerimaan: "diterima",
      catatan_admin: null,
    };
    const r = await cekStatus({ nomor: "SPMB-2728-0001", tanggal_lahir: "2021-03-15" });
    expect(r).toEqual({ ok: true, ...state.row });
  });

  it("gagal jika tidak ada yang cocok", async () => {
    const r = await cekStatus({ nomor: "SPMB-2728-9999", tanggal_lahir: "2021-03-15" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/tidak ditemukan/i);
  });

  it("menolak format nomor yang salah tanpa menyentuh database", async () => {
    const r = await cekStatus({ nomor: "ABC-123", tanggal_lahir: "2021-03-15" });
    expect(r.ok).toBe(false);
  });

  it("menolak tanggal lahir kosong", async () => {
    const r = await cekStatus({ nomor: "SPMB-2728-0001", tanggal_lahir: "" });
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npm test`
Expected: FAIL — module `@/app/cek-status/actions` tidak ditemukan.

- [ ] **Step 3: Implementasi** — `src/app/cek-status/actions.ts`

```ts
"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StatusPenerimaan, StatusVerifikasi } from "@/lib/status";

export type CekStatusResult =
  | {
      ok: true;
      nama_lengkap: string;
      status_verifikasi: StatusVerifikasi;
      status_penerimaan: StatusPenerimaan;
      catatan_admin: string | null;
    }
  | { ok: false; error: string };

const cekSchema = z.object({
  nomor: z.string().trim().regex(/^SPMB-2728-\d{4}$/, "Format nomor: SPMB-2728-0001"),
  tanggal_lahir: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal lahir wajib diisi"),
});

const PESAN_TIDAK_KETEMU =
  "Data tidak ditemukan. Periksa kembali nomor pendaftaran dan tanggal lahir.";

export async function cekStatus(input: {
  nomor: string;
  tanggal_lahir: string;
}): Promise<CekStatusResult> {
  const parsed = cekSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? PESAN_TIDAK_KETEMU };
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("pendaftar")
    .select("nama_lengkap, status_verifikasi, status_penerimaan, catatan_admin")
    .eq("nomor_pendaftaran", parsed.data.nomor)
    .eq("tanggal_lahir", parsed.data.tanggal_lahir)
    .maybeSingle();

  if (!data) return { ok: false, error: PESAN_TIDAK_KETEMU };
  return { ok: true, ...data };
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `npm test`
Expected: PASS semua.

- [ ] **Step 5: Commit**

```bash
git add src/app/cek-status/actions.ts tests/cek-status.test.ts
git commit -m "feat: server action cek status pendaftaran"
```

---

### Task 8: Layout Global, Komponen UI & Landing Page

**Files:**
- Create: `src/lib/konten.ts`, `src/components/ui.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`
- Modify: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx` (ganti isi bawaan create-next-app)

**Interfaces:**
- Consumes: `createAdminClient` (Task 5), tipe `Konten` (Task 5).
- Produces:
  - `getKonten(): Promise<Konten>` dari `@/lib/konten` (fallback array kosong bila baris belum ada).
  - Dari `@/components/ui`: `Field({ label, error, children })`, `inputCls` (string kelas Tailwind untuk input), `Badge({ warna, children })` dengan `warna: "abu" | "hijau" | "kuning" | "merah"`.
  - Kelas CSS `no-print` (disembunyikan saat print).

- [ ] **Step 1: Buat `src/lib/konten.ts`**

```ts
import { createAdminClient } from "@/lib/supabase/admin";
import type { Konten } from "@/lib/types";

export async function getKonten(): Promise<Konten> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("konten").select("key, isi");
  const peta = Object.fromEntries((data ?? []).map((r) => [r.key, r.isi]));
  return {
    jadwal: peta.jadwal ?? [],
    syarat: peta.syarat ?? [],
    biaya: peta.biaya ?? [],
    faq: peta.faq ?? [],
    kontak: peta.kontak ?? { whatsapp: "", telepon: "", alamat: "" },
  };
}
```

- [ ] **Step 2: Buat `src/components/ui.tsx`**

```tsx
import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base " +
  "focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

const warnaBadge = {
  abu: "bg-gray-100 text-gray-700",
  hijau: "bg-emerald-100 text-emerald-800",
  kuning: "bg-amber-100 text-amber-800",
  merah: "bg-red-100 text-red-700",
} as const;

export function Badge({
  warna,
  children,
}: {
  warna: keyof typeof warnaBadge;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${warnaBadge[warna]}`}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Buat `src/components/Header.tsx` dan `src/components/Footer.tsx`**

`src/components/Header.tsx`:

```tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="no-print sticky top-0 z-10 border-b border-emerald-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="text-sm font-bold leading-tight text-emerald-800 sm:text-base">
          SPMB SD Plus 3 Al-Muhajirin
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/cek-status" className="text-emerald-700 hover:underline">
            Cek Status
          </Link>
          <Link
            href="/daftar"
            className="rounded-lg bg-emerald-700 px-3 py-1.5 font-medium text-white hover:bg-emerald-800"
          >
            Daftar
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

`src/components/Footer.tsx`:

```tsx
export default function Footer() {
  return (
    <footer className="no-print mt-12 border-t border-gray-100 py-6 text-center text-sm text-gray-500">
      © 2026 Panitia SPMB SD Plus 3 Al-Muhajirin — Tahun Ajaran 2027/2028
    </footer>
  );
}
```

- [ ] **Step 4: Ganti `src/app/layout.tsx`** (pertahankan import font bawaan create-next-app bila ada)

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "SPMB SD Plus 3 Al-Muhajirin — Tahun Ajaran 2027/2028",
  description:
    "Sistem Penerimaan Murid Baru SD Plus 3 Al-Muhajirin Tahun Ajaran 2027/2028. Daftar online dan cek status pendaftaran.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Header />
        <main className="mx-auto max-w-4xl px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Tambahkan style print di akhir `src/app/globals.css`**

```css
@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: white !important;
  }
}
```

- [ ] **Step 6: Ganti `src/app/page.tsx`** dengan landing page

```tsx
import Link from "next/link";
import { getKonten } from "@/lib/konten";

export const dynamic = "force-dynamic";

export default async function Home() {
  const konten = await getKonten();

  return (
    <div className="py-8">
      {/* Hero */}
      <section className="rounded-2xl bg-emerald-700 px-5 py-10 text-center text-white sm:py-14">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-200">
          Penerimaan Murid Baru
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-4xl">SD Plus 3 Al-Muhajirin</h1>
        <p className="mt-1 text-lg text-emerald-100">Tahun Ajaran 2027/2028</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/daftar"
            className="w-full rounded-xl bg-white px-6 py-3 text-base font-semibold text-emerald-800 hover:bg-emerald-50 sm:w-auto"
          >
            Daftar Sekarang
          </Link>
          <Link
            href="/cek-status"
            className="w-full rounded-xl border border-emerald-300 px-6 py-3 text-base font-medium text-white hover:bg-emerald-600 sm:w-auto"
          >
            Cek Status Pendaftaran
          </Link>
        </div>
      </section>

      {/* Jadwal & Alur */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-emerald-900">Jadwal & Alur Pendaftaran</h2>
        <ol className="mt-4 space-y-3">
          {konten.jadwal.map((j, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-medium">{j.tahapan}</p>
                <p className="text-sm text-gray-600">{j.tanggal}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Syarat */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-emerald-900">Syarat Pendaftaran</h2>
        <ul className="mt-4 space-y-2">
          {konten.syarat.map((s, i) => (
            <li key={i} className="flex items-start gap-2 rounded-xl bg-white p-4 shadow-sm">
              <span className="text-emerald-700">✓</span>
              <span>{s.teks}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Biaya */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-emerald-900">Biaya</h2>
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
          {konten.biaya.map((b, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 border-b border-gray-100 p-4 last:border-b-0"
            >
              <span>{b.item}</span>
              <span className="font-semibold text-emerald-800">{b.jumlah}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-emerald-900">Pertanyaan yang Sering Diajukan</h2>
        <div className="mt-4 space-y-3">
          {konten.faq.map((f, i) => (
            <details key={i} className="rounded-xl bg-white p-4 shadow-sm">
              <summary className="cursor-pointer font-medium">{f.tanya}</summary>
              <p className="mt-2 text-gray-700">{f.jawab}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Kontak */}
      <section className="mt-10 rounded-2xl bg-emerald-50 p-5">
        <h2 className="text-xl font-bold text-emerald-900">Kontak Panitia</h2>
        <div className="mt-3 space-y-1 text-gray-800">
          {konten.kontak.whatsapp && (
            <p>
              WhatsApp:{" "}
              <a
                href={`https://wa.me/62${konten.kontak.whatsapp.replace(/^0/, "")}`}
                className="font-medium text-emerald-700 underline"
              >
                {konten.kontak.whatsapp}
              </a>
            </p>
          )}
          {konten.kontak.telepon && <p>Telepon: {konten.kontak.telepon}</p>}
          {konten.kontak.alamat && <p>Alamat: {konten.kontak.alamat}</p>}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 7: Verifikasi manual**

Run: `npm run dev` lalu buka `http://localhost:3000` (uji juga lebar layar 375px via device toolbar browser).
Expected: hero hijau + jadwal/syarat/biaya/FAQ/kontak terisi dari seed; semua seksi tersusun vertikal rapi di layar HP; tombol "Daftar Sekarang" menonjol.

- [ ] **Step 8: Commit**

```bash
git add src/lib/konten.ts src/components/ src/app/layout.tsx src/app/globals.css src/app/page.tsx
git commit -m "feat: layout global, komponen UI, landing page"
```

---

### Task 9: Form Wizard `/daftar` + Halaman Bukti `/daftar/sukses`

**Files:**
- Create: `src/components/daftar/FormPendaftaran.tsx`, `src/components/daftar/StepSiswa.tsx`, `src/components/daftar/StepOrtu.tsx`, `src/components/daftar/StepDokumen.tsx`, `src/app/daftar/page.tsx`, `src/app/daftar/sukses/page.tsx`

**Interfaces:**
- Consumes: `siswaSchema`, `ortuSchema`, `petaError` (Task 3); `JENIS_DOKUMEN`, `LABEL_DOKUMEN`, `validasiDokumen` (Task 4); `submitPendaftaran` (Task 6); `Field`, `inputCls` (Task 8).
- Produces: bukti disimpan di `sessionStorage` key **`spmb_bukti`** dengan bentuk `{ nomor: string; siswa: Record<string,string>; ortu: Record<string,string> }` — dibaca halaman sukses.
- Kontrak props step: `{ data: Record<string, string>; errors: Record<string, string>; onChange: (name: string, value: string) => void }`.

- [ ] **Step 1: Buat `src/components/daftar/StepSiswa.tsx`**

```tsx
"use client";

import { Field, inputCls } from "@/components/ui";

type Props = {
  data: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
};

export default function StepSiswa({ data, errors, onChange }: Props) {
  return (
    <div>
      <Field label="Nama Lengkap Calon Siswa" error={errors.nama_lengkap}>
        <input
          className={inputCls}
          value={data.nama_lengkap}
          onChange={(e) => onChange("nama_lengkap", e.target.value)}
          placeholder="Sesuai akta kelahiran"
        />
      </Field>
      <Field label="NIK (16 digit, lihat Kartu Keluarga)" error={errors.nik}>
        <input
          className={inputCls}
          inputMode="numeric"
          maxLength={16}
          value={data.nik}
          onChange={(e) => onChange("nik", e.target.value.replace(/\D/g, ""))}
        />
      </Field>
      <Field label="Tempat Lahir" error={errors.tempat_lahir}>
        <input
          className={inputCls}
          value={data.tempat_lahir}
          onChange={(e) => onChange("tempat_lahir", e.target.value)}
        />
      </Field>
      <Field label="Tanggal Lahir" error={errors.tanggal_lahir}>
        <input
          type="date"
          className={inputCls}
          value={data.tanggal_lahir}
          onChange={(e) => onChange("tanggal_lahir", e.target.value)}
        />
      </Field>
      <Field label="Jenis Kelamin" error={errors.jenis_kelamin}>
        <select
          className={inputCls}
          value={data.jenis_kelamin}
          onChange={(e) => onChange("jenis_kelamin", e.target.value)}
        >
          <option value="">-- Pilih --</option>
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>
      </Field>
      <Field label="Alamat Lengkap" error={errors.alamat}>
        <textarea
          className={inputCls}
          rows={3}
          value={data.alamat}
          onChange={(e) => onChange("alamat", e.target.value)}
        />
      </Field>
      <Field label="Asal TK/RA (opsional)" error={errors.asal_tk}>
        <input
          className={inputCls}
          value={data.asal_tk}
          onChange={(e) => onChange("asal_tk", e.target.value)}
        />
      </Field>
    </div>
  );
}
```

- [ ] **Step 2: Buat `src/components/daftar/StepOrtu.tsx`**

```tsx
"use client";

import { Field, inputCls } from "@/components/ui";

const OPSI_PENDIDIKAN = ["SD/Sederajat", "SMP/Sederajat", "SMA/Sederajat", "Diploma", "S1", "S2/S3"];

type Props = {
  data: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
};

function PilihPendidikan({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">-- Pilih --</option>
      {OPSI_PENDIDIKAN.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  );
}

export default function StepOrtu({ data, errors, onChange }: Props) {
  return (
    <div>
      <h3 className="mb-3 font-semibold text-emerald-900">Data Ayah</h3>
      <Field label="Nama Ayah" error={errors.nama_ayah}>
        <input className={inputCls} value={data.nama_ayah} onChange={(e) => onChange("nama_ayah", e.target.value)} />
      </Field>
      <Field label="Pekerjaan Ayah" error={errors.pekerjaan_ayah}>
        <input className={inputCls} value={data.pekerjaan_ayah} onChange={(e) => onChange("pekerjaan_ayah", e.target.value)} />
      </Field>
      <Field label="Pendidikan Ayah" error={errors.pendidikan_ayah}>
        <PilihPendidikan value={data.pendidikan_ayah} onChange={(v) => onChange("pendidikan_ayah", v)} />
      </Field>

      <h3 className="mb-3 mt-6 font-semibold text-emerald-900">Data Ibu</h3>
      <Field label="Nama Ibu" error={errors.nama_ibu}>
        <input className={inputCls} value={data.nama_ibu} onChange={(e) => onChange("nama_ibu", e.target.value)} />
      </Field>
      <Field label="Pekerjaan Ibu" error={errors.pekerjaan_ibu}>
        <input className={inputCls} value={data.pekerjaan_ibu} onChange={(e) => onChange("pekerjaan_ibu", e.target.value)} />
      </Field>
      <Field label="Pendidikan Ibu" error={errors.pendidikan_ibu}>
        <PilihPendidikan value={data.pendidikan_ibu} onChange={(v) => onChange("pendidikan_ibu", v)} />
      </Field>

      <h3 className="mb-3 mt-6 font-semibold text-emerald-900">Wali (opsional, isi jika pengasuh utama bukan orang tua)</h3>
      <Field label="Nama Wali" error={errors.nama_wali}>
        <input className={inputCls} value={data.nama_wali} onChange={(e) => onChange("nama_wali", e.target.value)} />
      </Field>
      <Field label="Pekerjaan Wali" error={errors.pekerjaan_wali}>
        <input className={inputCls} value={data.pekerjaan_wali} onChange={(e) => onChange("pekerjaan_wali", e.target.value)} />
      </Field>

      <h3 className="mb-3 mt-6 font-semibold text-emerald-900">Kontak</h3>
      <Field label="Nomor WhatsApp Aktif" error={errors.no_whatsapp}>
        <input
          className={inputCls}
          inputMode="numeric"
          placeholder="081234567890"
          value={data.no_whatsapp}
          onChange={(e) => onChange("no_whatsapp", e.target.value.replace(/\D/g, ""))}
        />
      </Field>
    </div>
  );
}
```

- [ ] **Step 3: Buat `src/components/daftar/StepDokumen.tsx`**

```tsx
"use client";

import { JENIS_DOKUMEN, LABEL_DOKUMEN, validasiDokumen, type JenisDokumen } from "@/lib/files";
import { Field } from "@/components/ui";

type Props = {
  files: Partial<Record<JenisDokumen, File>>;
  errors: Record<string, string>;
  onChange: (jenis: JenisDokumen, file: File | undefined) => void;
};

export default function StepDokumen({ files, errors, onChange }: Props) {
  return (
    <div>
      <p className="mb-4 text-sm text-gray-600">
        Unggah foto/scan dokumen berikut. Format JPG, PNG, atau PDF, maksimal 2 MB per file.
        Dari HP, Anda bisa langsung memotret dokumen.
      </p>
      {JENIS_DOKUMEN.map((jenis) => {
        const file = files[jenis];
        const errValidasi = file ? validasiDokumen(file) : null;
        return (
          <Field key={jenis} label={LABEL_DOKUMEN[jenis]} error={errors[jenis] ?? errValidasi ?? undefined}>
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-700 file:px-4 file:py-2.5 file:font-medium file:text-white"
              onChange={(e) => onChange(jenis, e.target.files?.[0])}
            />
            {file && !errValidasi && (
              <p className="mt-1 text-sm text-emerald-700">
                ✓ {file.name} ({(file.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </Field>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Buat `src/components/daftar/FormPendaftaran.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { siswaSchema, ortuSchema, petaError } from "@/lib/validation/pendaftar";
import { JENIS_DOKUMEN, LABEL_DOKUMEN, validasiDokumen, type JenisDokumen } from "@/lib/files";
import { submitPendaftaran } from "@/app/daftar/actions";
import StepSiswa from "./StepSiswa";
import StepOrtu from "./StepOrtu";
import StepDokumen from "./StepDokumen";

const SISWA_KOSONG: Record<string, string> = {
  nama_lengkap: "", nik: "", tempat_lahir: "", tanggal_lahir: "",
  jenis_kelamin: "", alamat: "", asal_tk: "",
};
const ORTU_KOSONG: Record<string, string> = {
  nama_ayah: "", pekerjaan_ayah: "", pendidikan_ayah: "",
  nama_ibu: "", pekerjaan_ibu: "", pendidikan_ibu: "",
  nama_wali: "", pekerjaan_wali: "", no_whatsapp: "",
};
const JUDUL_STEP = ["Data Calon Siswa", "Data Orang Tua / Wali", "Upload Dokumen"];

export default function FormPendaftaran() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [siswa, setSiswa] = useState(SISWA_KOSONG);
  const [ortu, setOrtu] = useState(ORTU_KOSONG);
  const [files, setFiles] = useState<Partial<Record<JenisDokumen, File>>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function lanjut() {
    const schema = step === 0 ? siswaSchema : ortuSchema;
    const data = step === 0 ? siswa : ortu;
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      setErrors(petaError(parsed.error));
      return;
    }
    setErrors({});
    setStep(step + 1);
    window.scrollTo({ top: 0 });
  }

  function kembali() {
    setErrors({});
    setStep(step - 1);
    window.scrollTo({ top: 0 });
  }

  async function kirim() {
    const errFiles: Record<string, string> = {};
    for (const jenis of JENIS_DOKUMEN) {
      const f = files[jenis];
      if (!f) errFiles[jenis] = `${LABEL_DOKUMEN[jenis]} belum diunggah`;
      else {
        const e = validasiDokumen(f);
        if (e) errFiles[jenis] = e;
      }
    }
    if (Object.keys(errFiles).length > 0) {
      setErrors(errFiles);
      return;
    }

    setSubmitting(true);
    setServerError("");
    const fd = new FormData();
    for (const [k, v] of Object.entries({ ...siswa, ...ortu })) fd.set(k, v);
    for (const jenis of JENIS_DOKUMEN) fd.set(`dokumen_${jenis}`, files[jenis]!);

    const hasil = await submitPendaftaran(fd);
    if (hasil.ok) {
      sessionStorage.setItem(
        "spmb_bukti",
        JSON.stringify({ nomor: hasil.nomor_pendaftaran, siswa, ortu })
      );
      router.push("/daftar/sukses");
      return;
    }
    setSubmitting(false);
    setServerError(hasil.error);
    if (hasil.fieldErrors) {
      setErrors(hasil.fieldErrors);
      const fieldPertama = Object.keys(hasil.fieldErrors)[0];
      if (fieldPertama in SISWA_KOSONG) setStep(0);
      else if (fieldPertama in ORTU_KOSONG) setStep(1);
    }
  }

  return (
    <div className="py-6">
      {/* Indikator langkah */}
      <ol className="mb-6 flex items-center justify-center gap-2">
        {JUDUL_STEP.map((judul, i) => (
          <li key={judul} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                i <= step ? "bg-emerald-700 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </span>
            {i < JUDUL_STEP.length - 1 && <span className="h-px w-6 bg-gray-300" />}
          </li>
        ))}
      </ol>
      <h2 className="mb-4 text-center text-lg font-bold text-emerald-900">
        {JUDUL_STEP[step]}
      </h2>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        {step === 0 && (
          <StepSiswa data={siswa} errors={errors} onChange={(n, v) => setSiswa((s) => ({ ...s, [n]: v }))} />
        )}
        {step === 1 && (
          <StepOrtu data={ortu} errors={errors} onChange={(n, v) => setOrtu((o) => ({ ...o, [n]: v }))} />
        )}
        {step === 2 && (
          <StepDokumen
            files={files}
            errors={errors}
            onChange={(jenis, file) => setFiles((f) => ({ ...f, [jenis]: file }))}
          />
        )}

        {serverError && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>
        )}

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={kembali}
              disabled={submitting}
              className="w-1/3 rounded-xl border border-gray-300 py-3 font-medium text-gray-700"
            >
              Kembali
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              onClick={lanjut}
              className="flex-1 rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              Lanjut
            </button>
          ) : (
            <button
              type="button"
              onClick={kirim}
              disabled={submitting}
              className="flex-1 rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {submitting ? "Mengirim..." : "Kirim Pendaftaran"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Buat `src/app/daftar/page.tsx`**

```tsx
import FormPendaftaran from "@/components/daftar/FormPendaftaran";

export const metadata = { title: "Formulir Pendaftaran — SPMB SD Plus 3 Al-Muhajirin" };

export default function DaftarPage() {
  return <FormPendaftaran />;
}
```

- [ ] **Step 6: Buat `src/app/daftar/sukses/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Bukti = {
  nomor: string;
  siswa: Record<string, string>;
  ortu: Record<string, string>;
};

export default function SuksesPage() {
  const [bukti, setBukti] = useState<Bukti | null | undefined>(undefined);

  useEffect(() => {
    const raw = sessionStorage.getItem("spmb_bukti");
    setBukti(raw ? (JSON.parse(raw) as Bukti) : null);
  }, []);

  if (bukti === undefined) return null;

  if (bukti === null) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-700">Data bukti pendaftaran tidak ditemukan di perangkat ini.</p>
        <Link href="/cek-status" className="mt-3 inline-block font-medium text-emerald-700 underline">
          Gunakan halaman Cek Status
        </Link>
      </div>
    );
  }

  const baris: [string, string][] = [
    ["Nama Calon Siswa", bukti.siswa.nama_lengkap],
    ["NIK", bukti.siswa.nik],
    ["Tempat, Tanggal Lahir", `${bukti.siswa.tempat_lahir}, ${bukti.siswa.tanggal_lahir}`],
    ["Jenis Kelamin", bukti.siswa.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"],
    ["Nama Ayah", bukti.ortu.nama_ayah],
    ["Nama Ibu", bukti.ortu.nama_ibu],
    ["No. WhatsApp", bukti.ortu.no_whatsapp],
  ];

  return (
    <div className="py-8">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-center text-4xl">✅</p>
        <h1 className="mt-2 text-center text-xl font-bold text-emerald-900">
          Pendaftaran Berhasil
        </h1>
        <p className="mt-4 text-center text-sm text-gray-600">Nomor Pendaftaran Anda</p>
        <p className="text-center text-2xl font-bold tracking-wide text-emerald-700">
          {bukti.nomor}
        </p>
        <p className="mt-2 text-center text-sm text-red-600">
          Simpan nomor ini. Nomor dibutuhkan untuk mengecek status pendaftaran.
        </p>

        <table className="mt-6 w-full text-sm">
          <tbody>
            {baris.map(([label, nilai]) => (
              <tr key={label} className="border-b border-gray-100">
                <td className="py-2 pr-3 text-gray-500">{label}</td>
                <td className="py-2 font-medium">{nilai}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="no-print mt-6 flex flex-col gap-3">
          <button
            onClick={() => window.print()}
            className="rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800"
          >
            Cetak / Simpan PDF
          </button>
          <Link href="/" className="text-center text-sm text-emerald-700 underline">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Verifikasi manual**

Run: `npm run dev`, buka `http://localhost:3000/daftar` (uji di lebar 375px):
1. Klik "Lanjut" tanpa isi → error bahasa Indonesia muncul per field.
2. Isi step 1 valid → lanjut; isi step 2 valid → lanjut; unggah 3 file JPG kecil → "Kirim Pendaftaran".
3. Expected: berpindah ke `/daftar/sukses` menampilkan nomor `SPMB-2728-XXXX` + ringkasan; tombol cetak membuka dialog print tanpa header/tombol (kelas `no-print`).
4. Refresh halaman sukses → bukti tetap tampil (sessionStorage); buka `/daftar/sukses` di tab lain → pesan arahan ke Cek Status.
5. Daftar lagi dengan NIK sama → error "NIK sudah terdaftar...".
6. Cek Supabase Table Editor: baris `pendaftar` + 3 baris `dokumen` + 3 file di bucket.

- [ ] **Step 8: Commit**

```bash
git add src/components/daftar/ src/app/daftar/
git commit -m "feat: form pendaftaran wizard 3 langkah + halaman bukti"
```

---

### Task 10: Halaman Cek Status

**Files:**
- Create: `src/app/cek-status/page.tsx`

**Interfaces:**
- Consumes: `cekStatus`, `CekStatusResult` (Task 7); `LABEL_VERIFIKASI`, `LABEL_PENERIMAAN` (Task 5); `Field`, `inputCls`, `Badge` (Task 8).

- [ ] **Step 1: Buat `src/app/cek-status/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { cekStatus, type CekStatusResult } from "./actions";
import { LABEL_PENERIMAAN, LABEL_VERIFIKASI } from "@/lib/status";
import { Badge, Field, inputCls } from "@/components/ui";

const WARNA_VERIFIKASI = { menunggu: "abu", terverifikasi: "hijau", perlu_perbaikan: "kuning" } as const;
const WARNA_PENERIMAAN = { menunggu: "abu", diterima: "hijau", tidak_diterima: "merah" } as const;

export default function CekStatusPage() {
  const [nomor, setNomor] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [hasil, setHasil] = useState<CekStatusResult | null>(null);
  const [memuat, setMemuat] = useState(false);

  async function periksa(e: React.FormEvent) {
    e.preventDefault();
    setMemuat(true);
    setHasil(await cekStatus({ nomor: nomor.toUpperCase(), tanggal_lahir: tanggal }));
    setMemuat(false);
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-center text-xl font-bold text-emerald-900">Cek Status Pendaftaran</h1>
        <form onSubmit={periksa} className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <Field label="Nomor Pendaftaran">
            <input
              className={inputCls}
              placeholder="SPMB-2728-0001"
              value={nomor}
              onChange={(e) => setNomor(e.target.value)}
            />
          </Field>
          <Field label="Tanggal Lahir Calon Siswa">
            <input
              type="date"
              className={inputCls}
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </Field>
          <button
            type="submit"
            disabled={memuat}
            className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {memuat ? "Memeriksa..." : "Periksa Status"}
          </button>
        </form>

        {hasil && !hasil.ok && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{hasil.error}</p>
        )}

        {hasil && hasil.ok && (
          <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
            <p className="font-semibold">{hasil.nama_lengkap}</p>
            <div className="mt-3 space-y-2 text-sm">
              <p className="flex items-center justify-between">
                <span className="text-gray-500">Status Berkas</span>
                <Badge warna={WARNA_VERIFIKASI[hasil.status_verifikasi]}>
                  {LABEL_VERIFIKASI[hasil.status_verifikasi]}
                </Badge>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-500">Status Penerimaan</span>
                <Badge warna={WARNA_PENERIMAAN[hasil.status_penerimaan]}>
                  {LABEL_PENERIMAAN[hasil.status_penerimaan]}
                </Badge>
              </p>
              {hasil.catatan_admin && (
                <div className="mt-3 rounded-lg bg-amber-50 p-3 text-amber-800">
                  <p className="font-medium">Catatan panitia:</p>
                  <p>{hasil.catatan_admin}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verifikasi manual**

Run: `npm run dev`, buka `/cek-status`:
1. Nomor + tanggal lahir dari pendaftaran uji Task 9 → tampil nama + dua badge status.
2. Tanggal lahir salah → "Data tidak ditemukan...".
3. Format nomor salah (mis. `abc`) → pesan format.

- [ ] **Step 3: Commit**

```bash
git add src/app/cek-status/page.tsx
git commit -m "feat: halaman cek status pendaftaran"
```

---

### Task 11: Auth Admin — Middleware, Login, Logout

**Files:**
- Create: `src/middleware.ts`, `src/app/admin/login/page.tsx`, `src/app/admin/login/actions.ts`, `src/app/admin/(dasbor)/layout.tsx`

**Interfaces:**
- Consumes: `createServerSupabase` (Task 5).
- Produces:
  - Middleware: semua `/admin/*` (kecuali `/admin/login`) butuh sesi; login dalam keadaan bersesi diarahkan ke `/admin`.
  - `login(formData: FormData): Promise<{ error: string } | never>` (redirect saat sukses) dan `logout(): Promise<never>` dari `@/app/admin/login/actions`.
  - Layout route group `(dasbor)` dengan nav admin — URL tetap `/admin`, `/admin/pendaftar`, `/admin/konten`.

- [ ] **Step 1: Buat akun admin (manual, satu kali)**

Supabase Dashboard → Authentication → Users → "Add user" → email panitia + password kuat → centang "Auto Confirm User".

- [ ] **Step 2: Buat `src/middleware.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (pathname === "/admin/login" && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
```

- [ ] **Step 3: Buat `src/app/admin/login/actions.ts`**

```ts
"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export async function login(formData: FormData): Promise<{ error: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email atau password salah." };
  redirect("/admin");
}

export async function logout(): Promise<never> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
```

- [ ] **Step 4: Buat `src/app/admin/login/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { login } from "./actions";
import { Field, inputCls } from "@/components/ui";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [memuat, setMemuat] = useState(false);

  async function masuk(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMemuat(true);
    setError("");
    const hasil = await login(new FormData(e.currentTarget));
    // login() redirect saat sukses; sampai sini berarti gagal
    setMemuat(false);
    if (hasil?.error) setError(hasil.error);
  }

  return (
    <div className="py-16">
      <form onSubmit={masuk} className="mx-auto max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-center text-lg font-bold text-emerald-900">Login Panitia</h1>
        <Field label="Email">
          <input name="email" type="email" required className={inputCls} />
        </Field>
        <Field label="Password">
          <input name="password" type="password" required className={inputCls} />
        </Field>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={memuat}
          className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {memuat ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Buat `src/app/admin/(dasbor)/layout.tsx`**

```tsx
import Link from "next/link";
import { logout } from "@/app/admin/login/actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-6">
      <nav className="no-print mb-6 flex flex-wrap items-center gap-2 rounded-xl bg-white p-2 shadow-sm">
        <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-emerald-50">
          Dasbor
        </Link>
        <Link href="/admin/pendaftar" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-emerald-50">
          Pendaftar
        </Link>
        <Link href="/admin/konten" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-emerald-50">
          Konten
        </Link>
        <form action={logout} className="ml-auto">
          <button className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            Keluar
          </button>
        </form>
      </nav>
      {children}
    </div>
  );
}
```

- [ ] **Step 6: Verifikasi manual**

Run: `npm run dev`:
1. Buka `/admin` tanpa login → dialihkan ke `/admin/login`.
2. Login password salah → pesan error. Login benar → dialihkan ke `/admin` (404 sementara — halaman dasbor dibuat Task 12; yang penting redirect terjadi... **catatan**: buat placeholder agar tidak 404: `src/app/admin/(dasbor)/page.tsx` berisi `export default function AdminHome() { return <p>Dasbor</p>; }` — file ini akan diganti di Task 12).
3. Buka `/admin/login` saat sudah login → dialihkan ke `/admin`. Klik "Keluar" → kembali ke login.

- [ ] **Step 7: Commit**

```bash
git add src/middleware.ts src/app/admin/
git commit -m "feat: auth admin (middleware, login, logout, layout dasbor)"
```

---

### Task 12: Dasbor Admin + Tabel Pendaftar (Cari, Filter, Responsif)

**Files:**
- Create/Replace: `src/app/admin/(dasbor)/page.tsx`, `src/app/admin/(dasbor)/pendaftar/page.tsx`

**Interfaces:**
- Consumes: `createAdminClient` (Task 5), label & tipe status (Task 5), `Badge`, `inputCls` (Task 8).
- Produces: query param list pendaftar: `q` (nama/nomor), `verifikasi`, `penerimaan` — juga dipakai link export (Task 14) dan link detail `/admin/pendaftar/[id]` (Task 13).

- [ ] **Step 1: Ganti `src/app/admin/(dasbor)/page.tsx`** (dasbor ringkas)

```tsx
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = createAdminClient();
  const hitung = (filter?: { kolom: string; nilai: string }) => {
    let q = supabase.from("pendaftar").select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter.kolom, filter.nilai);
    return q;
  };
  const [total, belumVerifikasi, diterima] = await Promise.all([
    hitung(),
    hitung({ kolom: "status_verifikasi", nilai: "menunggu" }),
    hitung({ kolom: "status_penerimaan", nilai: "diterima" }),
  ]);

  const kartu = [
    { label: "Total Pendaftar", nilai: total.count ?? 0 },
    { label: "Menunggu Verifikasi", nilai: belumVerifikasi.count ?? 0 },
    { label: "Diterima", nilai: diterima.count ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-emerald-900">Dasbor SPMB 2027/2028</h1>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kartu.map((k) => (
          <div key={k.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{k.label}</p>
            <p className="mt-1 text-3xl font-bold text-emerald-800">{k.nilai}</p>
          </div>
        ))}
      </div>
      <Link
        href="/admin/pendaftar"
        className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
      >
        Kelola Pendaftar
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Buat `src/app/admin/(dasbor)/pendaftar/page.tsx`**

```tsx
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  LABEL_PENERIMAAN,
  LABEL_VERIFIKASI,
  STATUS_PENERIMAAN,
  STATUS_VERIFIKASI,
  type StatusPenerimaan,
  type StatusVerifikasi,
} from "@/lib/status";
import { Badge, inputCls } from "@/components/ui";

export const dynamic = "force-dynamic";

type Params = { q?: string; verifikasi?: string; penerimaan?: string };

const WARNA_VERIFIKASI = { menunggu: "abu", terverifikasi: "hijau", perlu_perbaikan: "kuning" } as const;
const WARNA_PENERIMAAN = { menunggu: "abu", diterima: "hijau", tidak_diterima: "merah" } as const;

export default async function PendaftarPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const { q, verifikasi, penerimaan } = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from("pendaftar")
    .select(
      "id, nomor_pendaftaran, nama_lengkap, no_whatsapp, status_verifikasi, status_penerimaan"
    )
    .order("nomor_urut", { ascending: true });
  if (q) query = query.or(`nama_lengkap.ilike.%${q}%,nomor_pendaftaran.ilike.%${q}%`);
  if (verifikasi) query = query.eq("status_verifikasi", verifikasi);
  if (penerimaan) query = query.eq("status_penerimaan", penerimaan);
  const { data: daftar } = await query;

  const paramExport = new URLSearchParams();
  if (q) paramExport.set("q", q);
  if (verifikasi) paramExport.set("verifikasi", verifikasi);
  if (penerimaan) paramExport.set("penerimaan", penerimaan);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-emerald-900">Pendaftar</h1>
        <a
          href={`/admin/pendaftar/export?${paramExport.toString()}`}
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Export Excel
        </a>
      </div>

      {/* Filter */}
      <form method="get" className="mt-4 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama / nomor..."
          className={inputCls}
        />
        <select name="verifikasi" defaultValue={verifikasi ?? ""} className={inputCls}>
          <option value="">Semua Verifikasi</option>
          {STATUS_VERIFIKASI.map((s) => (
            <option key={s} value={s}>{LABEL_VERIFIKASI[s]}</option>
          ))}
        </select>
        <select name="penerimaan" defaultValue={penerimaan ?? ""} className={inputCls}>
          <option value="">Semua Penerimaan</option>
          {STATUS_PENERIMAAN.map((s) => (
            <option key={s} value={s}>{LABEL_PENERIMAAN[s]}</option>
          ))}
        </select>
        <button className="rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800">
          Terapkan
        </button>
      </form>

      {/* Daftar: kartu di HP, tabel di layar besar */}
      <div className="mt-4 space-y-3 md:hidden">
        {(daftar ?? []).map((p) => (
          <Link
            key={p.id}
            href={`/admin/pendaftar/${p.id}`}
            className="block rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">{p.nama_lengkap}</p>
              <span className="text-xs text-gray-500">{p.nomor_pendaftaran}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge warna={WARNA_VERIFIKASI[p.status_verifikasi as StatusVerifikasi]}>
                {LABEL_VERIFIKASI[p.status_verifikasi as StatusVerifikasi]}
              </Badge>
              <Badge warna={WARNA_PENERIMAAN[p.status_penerimaan as StatusPenerimaan]}>
                {LABEL_PENERIMAAN[p.status_penerimaan as StatusPenerimaan]}
              </Badge>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 hidden overflow-hidden rounded-2xl bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="bg-emerald-50 text-left text-emerald-900">
            <tr>
              <th className="p-3">Nomor</th>
              <th className="p-3">Nama</th>
              <th className="p-3">WhatsApp</th>
              <th className="p-3">Verifikasi</th>
              <th className="p-3">Penerimaan</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(daftar ?? []).map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="p-3 font-mono text-xs">{p.nomor_pendaftaran}</td>
                <td className="p-3 font-medium">{p.nama_lengkap}</td>
                <td className="p-3">{p.no_whatsapp}</td>
                <td className="p-3">
                  <Badge warna={WARNA_VERIFIKASI[p.status_verifikasi as StatusVerifikasi]}>
                    {LABEL_VERIFIKASI[p.status_verifikasi as StatusVerifikasi]}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge warna={WARNA_PENERIMAAN[p.status_penerimaan as StatusPenerimaan]}>
                    {LABEL_PENERIMAAN[p.status_penerimaan as StatusPenerimaan]}
                  </Badge>
                </td>
                <td className="p-3">
                  <Link href={`/admin/pendaftar/${p.id}`} className="text-emerald-700 underline">
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(daftar ?? []).length === 0 && (
        <p className="mt-6 text-center text-gray-500">Tidak ada pendaftar yang cocok.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verifikasi manual**

Run: `npm run dev`, login admin:
1. `/admin` → tiga kartu angka sesuai data.
2. `/admin/pendaftar` → data pendaftaran uji muncul; cari sebagian nama → terfilter; filter status bekerja.
3. Lebar 375px → tampilan kartu; lebar ≥768px → tabel.

- [ ] **Step 4: Commit**

```bash
git add "src/app/admin/(dasbor)/page.tsx" "src/app/admin/(dasbor)/pendaftar/page.tsx"
git commit -m "feat: dasbor admin dan daftar pendaftar responsif"
```

---

### Task 13: Detail Pendaftar — Verifikasi, Status Penerimaan, Catatan

**Files:**
- Create: `src/app/admin/(dasbor)/pendaftar/[id]/page.tsx`, `src/app/admin/(dasbor)/pendaftar/[id]/actions.ts`, `src/components/admin/StatusForm.tsx`

**Interfaces:**
- Consumes: `createAdminClient`, `createServerSupabase` (Task 5), status & label (Task 5), tipe `Pendaftar`, `Dokumen` (Task 5), `LABEL_DOKUMEN` (Task 4), `Field`, `inputCls` (Task 8).
- Produces: `updateStatusPendaftar(id: string, data: { status_verifikasi: StatusVerifikasi; status_penerimaan: StatusPenerimaan; catatan_admin: string }): Promise<{ ok: boolean; error?: string }>`.

- [ ] **Step 1: Buat `src/app/admin/(dasbor)/pendaftar/[id]/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { STATUS_PENERIMAAN, STATUS_VERIFIKASI } from "@/lib/status";

const statusSchema = z.object({
  status_verifikasi: z.enum(STATUS_VERIFIKASI),
  status_penerimaan: z.enum(STATUS_PENERIMAAN),
  catatan_admin: z.string().trim().max(500, "Catatan maksimal 500 karakter"),
});

export async function updateStatusPendaftar(
  id: string,
  data: { status_verifikasi: string; status_penerimaan: string; catatan_admin: string }
): Promise<{ ok: boolean; error?: string }> {
  // server action = endpoint publik → wajib cek sesi admin
  const auth = await createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return { ok: false, error: "Sesi berakhir. Silakan login ulang." };

  const parsed = statusSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("pendaftar")
    .update({
      status_verifikasi: parsed.data.status_verifikasi,
      status_penerimaan: parsed.data.status_penerimaan,
      catatan_admin: parsed.data.catatan_admin || null,
    })
    .eq("id", id);

  if (error) return { ok: false, error: "Gagal menyimpan. Coba lagi." };
  revalidatePath(`/admin/pendaftar/${id}`);
  revalidatePath("/admin/pendaftar");
  return { ok: true };
}
```

- [ ] **Step 2: Buat `src/components/admin/StatusForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import {
  LABEL_PENERIMAAN,
  LABEL_VERIFIKASI,
  STATUS_PENERIMAAN,
  STATUS_VERIFIKASI,
} from "@/lib/status";
import { Field, inputCls } from "@/components/ui";
import { updateStatusPendaftar } from "@/app/admin/(dasbor)/pendaftar/[id]/actions";

type Props = {
  id: string;
  status_verifikasi: string;
  status_penerimaan: string;
  catatan_admin: string;
};

export default function StatusForm(awal: Props) {
  const [verifikasi, setVerifikasi] = useState(awal.status_verifikasi);
  const [penerimaan, setPenerimaan] = useState(awal.status_penerimaan);
  const [catatan, setCatatan] = useState(awal.catatan_admin);
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const [memuat, setMemuat] = useState(false);

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setMemuat(true);
    setPesan(null);
    const hasil = await updateStatusPendaftar(awal.id, {
      status_verifikasi: verifikasi,
      status_penerimaan: penerimaan,
      catatan_admin: catatan,
    });
    setMemuat(false);
    setPesan(
      hasil.ok
        ? { ok: true, teks: "Perubahan tersimpan." }
        : { ok: false, teks: hasil.error ?? "Gagal menyimpan." }
    );
  }

  return (
    <form onSubmit={simpan} className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-bold text-emerald-900">Ubah Status</h2>
      <Field label="Status Verifikasi Berkas">
        <select className={inputCls} value={verifikasi} onChange={(e) => setVerifikasi(e.target.value)}>
          {STATUS_VERIFIKASI.map((s) => (
            <option key={s} value={s}>{LABEL_VERIFIKASI[s]}</option>
          ))}
        </select>
      </Field>
      <Field label="Status Penerimaan">
        <select className={inputCls} value={penerimaan} onChange={(e) => setPenerimaan(e.target.value)}>
          {STATUS_PENERIMAAN.map((s) => (
            <option key={s} value={s}>{LABEL_PENERIMAAN[s]}</option>
          ))}
        </select>
      </Field>
      <Field label="Catatan untuk Pendaftar (tampil di halaman Cek Status)">
        <textarea
          className={inputCls}
          rows={3}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Contoh: Foto Kartu Keluarga buram, mohon hubungi panitia."
        />
      </Field>
      {pesan && (
        <p className={`mb-3 text-sm ${pesan.ok ? "text-emerald-700" : "text-red-600"}`}>
          {pesan.teks}
        </p>
      )}
      <button
        disabled={memuat}
        className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {memuat ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Buat `src/app/admin/(dasbor)/pendaftar/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { LABEL_DOKUMEN } from "@/lib/files";
import type { Dokumen, Pendaftar } from "@/lib/types";
import StatusForm from "@/components/admin/StatusForm";

export const dynamic = "force-dynamic";

export default async function DetailPendaftar({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: pendaftar } = await supabase
    .from("pendaftar")
    .select("*")
    .eq("id", id)
    .maybeSingle<Pendaftar>();
  if (!pendaftar) notFound();

  const { data: dokumen } = await supabase
    .from("dokumen")
    .select("*")
    .eq("pendaftar_id", id)
    .returns<Dokumen[]>();

  // signed URL berumur pendek untuk preview dokumen
  const dokumenDenganUrl = await Promise.all(
    (dokumen ?? []).map(async (d) => {
      const { data } = await supabase.storage
        .from("dokumen")
        .createSignedUrl(d.path_storage, 300);
      return { ...d, url: data?.signedUrl ?? null };
    })
  );

  const baris: [string, string][] = [
    ["Nomor Pendaftaran", pendaftar.nomor_pendaftaran],
    ["Nama Lengkap", pendaftar.nama_lengkap],
    ["NIK", pendaftar.nik],
    ["Tempat, Tanggal Lahir", `${pendaftar.tempat_lahir}, ${pendaftar.tanggal_lahir}`],
    ["Jenis Kelamin", pendaftar.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"],
    ["Alamat", pendaftar.alamat],
    ["Asal TK/RA", pendaftar.asal_tk ?? "-"],
    ["Ayah", `${pendaftar.nama_ayah} — ${pendaftar.pekerjaan_ayah} (${pendaftar.pendidikan_ayah})`],
    ["Ibu", `${pendaftar.nama_ibu} — ${pendaftar.pekerjaan_ibu} (${pendaftar.pendidikan_ibu})`],
    ["Wali", pendaftar.nama_wali ? `${pendaftar.nama_wali} — ${pendaftar.pekerjaan_wali ?? "-"}` : "-"],
    ["No. WhatsApp", pendaftar.no_whatsapp],
    ["Tanggal Daftar", new Date(pendaftar.created_at).toLocaleString("id-ID")],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-emerald-900">
        {pendaftar.nama_lengkap}{" "}
        <span className="font-mono text-sm text-gray-500">{pendaftar.nomor_pendaftaran}</span>
      </h1>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold text-emerald-900">Data Pendaftar</h2>
        <table className="w-full text-sm">
          <tbody>
            {baris.map(([label, nilai]) => (
              <tr key={label} className="border-b border-gray-100 last:border-b-0">
                <td className="w-40 py-2 pr-3 align-top text-gray-500">{label}</td>
                <td className="py-2 font-medium">{nilai}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold text-emerald-900">Dokumen</h2>
        <ul className="space-y-2">
          {dokumenDenganUrl.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 text-sm">
              <span>{LABEL_DOKUMEN[d.jenis]}</span>
              {d.url ? (
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  Lihat
                </a>
              ) : (
                <span className="text-red-600">Gagal memuat</span>
              )}
            </li>
          ))}
          {dokumenDenganUrl.length === 0 && (
            <li className="text-gray-500">Tidak ada dokumen.</li>
          )}
        </ul>
      </div>

      <StatusForm
        id={pendaftar.id}
        status_verifikasi={pendaftar.status_verifikasi}
        status_penerimaan={pendaftar.status_penerimaan}
        catatan_admin={pendaftar.catatan_admin ?? ""}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verifikasi manual**

Run: `npm run dev`, login admin, buka detail pendaftar uji:
1. Semua data + 3 dokumen tampil; "Lihat" membuka file di tab baru (signed URL).
2. Ubah verifikasi → "Terverifikasi", penerimaan → "Diterima", isi catatan → Simpan → "Perubahan tersimpan"; badge di daftar ikut berubah.
3. Cek `/cek-status` dengan nomor + tanggal lahir → status baru dan catatan tampil.

- [ ] **Step 5: Commit**

```bash
git add "src/app/admin/(dasbor)/pendaftar/[id]/" src/components/admin/StatusForm.tsx
git commit -m "feat: halaman detail pendaftar dengan verifikasi dan status"
```

---

### Task 14: Export Excel

**Files:**
- Create: `src/app/admin/(dasbor)/pendaftar/export/route.ts`

**Interfaces:**
- Consumes: `createAdminClient`, `createServerSupabase` (Task 5), label status (Task 5). Query param sama dengan Task 12: `q`, `verifikasi`, `penerimaan`.

- [ ] **Step 1: Buat `src/app/admin/(dasbor)/pendaftar/export/route.ts`**

```ts
import ExcelJS from "exceljs";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  LABEL_PENERIMAAN,
  LABEL_VERIFIKASI,
  type StatusPenerimaan,
  type StatusVerifikasi,
} from "@/lib/status";
import type { Pendaftar } from "@/lib/types";

export async function GET(request: Request) {
  const auth = await createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return new Response("Tidak diizinkan", { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const verifikasi = searchParams.get("verifikasi");
  const penerimaan = searchParams.get("penerimaan");

  const supabase = createAdminClient();
  let query = supabase.from("pendaftar").select("*").order("nomor_urut", { ascending: true });
  if (q) query = query.or(`nama_lengkap.ilike.%${q}%,nomor_pendaftaran.ilike.%${q}%`);
  if (verifikasi) query = query.eq("status_verifikasi", verifikasi);
  if (penerimaan) query = query.eq("status_penerimaan", penerimaan);
  const { data } = await query.returns<Pendaftar[]>();

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Pendaftar");
  ws.columns = [
    { header: "Nomor Pendaftaran", key: "nomor_pendaftaran", width: 18 },
    { header: "Nama Lengkap", key: "nama_lengkap", width: 25 },
    { header: "NIK", key: "nik", width: 20 },
    { header: "Tempat Lahir", key: "tempat_lahir", width: 15 },
    { header: "Tanggal Lahir", key: "tanggal_lahir", width: 14 },
    { header: "Jenis Kelamin", key: "jenis_kelamin", width: 13 },
    { header: "Alamat", key: "alamat", width: 35 },
    { header: "Asal TK/RA", key: "asal_tk", width: 18 },
    { header: "Nama Ayah", key: "nama_ayah", width: 22 },
    { header: "Pekerjaan Ayah", key: "pekerjaan_ayah", width: 18 },
    { header: "Pendidikan Ayah", key: "pendidikan_ayah", width: 15 },
    { header: "Nama Ibu", key: "nama_ibu", width: 22 },
    { header: "Pekerjaan Ibu", key: "pekerjaan_ibu", width: 18 },
    { header: "Pendidikan Ibu", key: "pendidikan_ibu", width: 15 },
    { header: "Nama Wali", key: "nama_wali", width: 22 },
    { header: "Pekerjaan Wali", key: "pekerjaan_wali", width: 18 },
    { header: "No. WhatsApp", key: "no_whatsapp", width: 15 },
    { header: "Status Verifikasi", key: "status_verifikasi", width: 18 },
    { header: "Status Penerimaan", key: "status_penerimaan", width: 18 },
    { header: "Catatan", key: "catatan_admin", width: 30 },
    { header: "Tanggal Daftar", key: "created_at", width: 20 },
  ];
  ws.getRow(1).font = { bold: true };

  for (const p of data ?? []) {
    ws.addRow({
      ...p,
      jenis_kelamin: p.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",
      asal_tk: p.asal_tk ?? "",
      nama_wali: p.nama_wali ?? "",
      pekerjaan_wali: p.pekerjaan_wali ?? "",
      status_verifikasi: LABEL_VERIFIKASI[p.status_verifikasi as StatusVerifikasi],
      status_penerimaan: LABEL_PENERIMAAN[p.status_penerimaan as StatusPenerimaan],
      catatan_admin: p.catatan_admin ?? "",
      created_at: new Date(p.created_at).toLocaleString("id-ID"),
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="pendaftar-spmb-2027-2028.xlsx"',
    },
  });
}
```

- [ ] **Step 2: Verifikasi manual**

Run: `npm run dev`, login admin, buka `/admin/pendaftar` → klik "Export Excel".
Expected: file `pendaftar-spmb-2027-2028.xlsx` terunduh; buka di LibreOffice/Excel — kolom lengkap, label status berbahasa Indonesia. Terapkan filter dulu lalu export → isi mengikuti filter. Akses `/admin/pendaftar/export` tanpa login (jendela incognito) → dialihkan/401.

- [ ] **Step 3: Commit**

```bash
git add "src/app/admin/(dasbor)/pendaftar/export/route.ts"
git commit -m "feat: export data pendaftar ke Excel"
```

---

### Task 15: Editor Konten Landing Page

**Files:**
- Create: `src/app/admin/(dasbor)/konten/page.tsx`, `src/app/admin/(dasbor)/konten/actions.ts`, `src/components/admin/ListEditor.tsx`, `src/components/admin/KontakEditor.tsx`

**Interfaces:**
- Consumes: `getKonten` (Task 8), `createAdminClient`, `createServerSupabase` (Task 5), tipe `Konten`, `KontenKey`, `Kontak` (Task 5), `Field`, `inputCls` (Task 8).
- Produces: `simpanKonten(key: KontenKey, isi: unknown): Promise<{ ok: boolean; error?: string }>`.

- [ ] **Step 1: Buat `src/app/admin/(dasbor)/konten/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import type { KontenKey } from "@/lib/types";

const teks = z.string().trim().min(1);

const skemaPerKey: Record<KontenKey, z.ZodTypeAny> = {
  jadwal: z.array(z.object({ tahapan: teks, tanggal: teks })),
  syarat: z.array(z.object({ teks })),
  biaya: z.array(z.object({ item: teks, jumlah: teks })),
  faq: z.array(z.object({ tanya: teks, jawab: teks })),
  kontak: z.object({
    whatsapp: z.string().trim(),
    telepon: z.string().trim(),
    alamat: z.string().trim(),
  }),
};

export async function simpanKonten(
  key: KontenKey,
  isi: unknown
): Promise<{ ok: boolean; error?: string }> {
  const auth = await createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return { ok: false, error: "Sesi berakhir. Silakan login ulang." };

  const skema = skemaPerKey[key];
  if (!skema) return { ok: false, error: "Jenis konten tidak dikenal." };
  const parsed = skema.safeParse(isi);
  if (!parsed.success) {
    return { ok: false, error: "Semua kolom wajib diisi sebelum disimpan." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("konten")
    .upsert({ key, isi: parsed.data }, { onConflict: "key" });
  if (error) return { ok: false, error: "Gagal menyimpan. Coba lagi." };

  revalidatePath("/");
  revalidatePath("/admin/konten");
  return { ok: true };
}
```

- [ ] **Step 2: Buat `src/components/admin/ListEditor.tsx`** (editor generik untuk jadwal/syarat/biaya/FAQ)

```tsx
"use client";

import { useState } from "react";
import { inputCls } from "@/components/ui";
import { simpanKonten } from "@/app/admin/(dasbor)/konten/actions";
import type { KontenKey } from "@/lib/types";

type FieldDef = { name: string; label: string; textarea?: boolean };

type Props = {
  judul: string;
  kontenKey: KontenKey;
  fields: FieldDef[];
  awal: Record<string, string>[];
};

export default function ListEditor({ judul, kontenKey, fields, awal }: Props) {
  const [baris, setBaris] = useState<Record<string, string>[]>(awal);
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const [memuat, setMemuat] = useState(false);

  function ubah(i: number, name: string, value: string) {
    setBaris((b) => b.map((row, j) => (j === i ? { ...row, [name]: value } : row)));
  }

  function tambah() {
    setBaris((b) => [...b, Object.fromEntries(fields.map((f) => [f.name, ""]))]);
  }

  function hapus(i: number) {
    setBaris((b) => b.filter((_, j) => j !== i));
  }

  async function simpan() {
    setMemuat(true);
    setPesan(null);
    const hasil = await simpanKonten(kontenKey, baris);
    setMemuat(false);
    setPesan(
      hasil.ok
        ? { ok: true, teks: "Tersimpan." }
        : { ok: false, teks: hasil.error ?? "Gagal menyimpan." }
    );
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-bold text-emerald-900">{judul}</h2>
      <div className="mt-3 space-y-3">
        {baris.map((row, i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-3">
            {fields.map((f) =>
              f.textarea ? (
                <textarea
                  key={f.name}
                  className={`${inputCls} mb-2`}
                  rows={2}
                  placeholder={f.label}
                  value={row[f.name] ?? ""}
                  onChange={(e) => ubah(i, f.name, e.target.value)}
                />
              ) : (
                <input
                  key={f.name}
                  className={`${inputCls} mb-2`}
                  placeholder={f.label}
                  value={row[f.name] ?? ""}
                  onChange={(e) => ubah(i, f.name, e.target.value)}
                />
              )
            )}
            <button type="button" onClick={() => hapus(i)} className="text-sm text-red-600">
              Hapus baris
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button type="button" onClick={tambah} className="text-sm font-medium text-emerald-700">
          + Tambah baris
        </button>
        <button
          type="button"
          onClick={simpan}
          disabled={memuat}
          className="ml-auto rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {memuat ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
      {pesan && (
        <p className={`mt-2 text-sm ${pesan.ok ? "text-emerald-700" : "text-red-600"}`}>
          {pesan.teks}
        </p>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Buat `src/components/admin/KontakEditor.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Field, inputCls } from "@/components/ui";
import { simpanKonten } from "@/app/admin/(dasbor)/konten/actions";
import type { Kontak } from "@/lib/types";

export default function KontakEditor({ awal }: { awal: Kontak }) {
  const [kontak, setKontak] = useState(awal);
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const [memuat, setMemuat] = useState(false);

  async function simpan() {
    setMemuat(true);
    setPesan(null);
    const hasil = await simpanKonten("kontak", kontak);
    setMemuat(false);
    setPesan(
      hasil.ok
        ? { ok: true, teks: "Tersimpan." }
        : { ok: false, teks: hasil.error ?? "Gagal menyimpan." }
    );
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 font-bold text-emerald-900">Kontak Panitia</h2>
      <Field label="Nomor WhatsApp">
        <input
          className={inputCls}
          value={kontak.whatsapp}
          onChange={(e) => setKontak({ ...kontak, whatsapp: e.target.value })}
        />
      </Field>
      <Field label="Telepon">
        <input
          className={inputCls}
          value={kontak.telepon}
          onChange={(e) => setKontak({ ...kontak, telepon: e.target.value })}
        />
      </Field>
      <Field label="Alamat">
        <textarea
          className={inputCls}
          rows={2}
          value={kontak.alamat}
          onChange={(e) => setKontak({ ...kontak, alamat: e.target.value })}
        />
      </Field>
      <button
        type="button"
        onClick={simpan}
        disabled={memuat}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {memuat ? "Menyimpan..." : "Simpan"}
      </button>
      {pesan && (
        <p className={`mt-2 text-sm ${pesan.ok ? "text-emerald-700" : "text-red-600"}`}>
          {pesan.teks}
        </p>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Buat `src/app/admin/(dasbor)/konten/page.tsx`**

```tsx
import { getKonten } from "@/lib/konten";
import ListEditor from "@/components/admin/ListEditor";
import KontakEditor from "@/components/admin/KontakEditor";

export const dynamic = "force-dynamic";

export default async function KontenPage() {
  const konten = await getKonten();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-emerald-900">Konten Landing Page</h1>
      <ListEditor
        judul="Jadwal & Alur Pendaftaran"
        kontenKey="jadwal"
        fields={[
          { name: "tahapan", label: "Tahapan (mis. Pendaftaran Gelombang 1)" },
          { name: "tanggal", label: "Tanggal (mis. 1 Oktober – 31 Desember 2026)" },
        ]}
        awal={konten.jadwal as unknown as Record<string, string>[]}
      />
      <ListEditor
        judul="Syarat Pendaftaran"
        kontenKey="syarat"
        fields={[{ name: "teks", label: "Syarat" }]}
        awal={konten.syarat as unknown as Record<string, string>[]}
      />
      <ListEditor
        judul="Biaya"
        kontenKey="biaya"
        fields={[
          { name: "item", label: "Item biaya" },
          { name: "jumlah", label: "Jumlah (mis. Rp 200.000)" },
        ]}
        awal={konten.biaya as unknown as Record<string, string>[]}
      />
      <ListEditor
        judul="FAQ"
        kontenKey="faq"
        fields={[
          { name: "tanya", label: "Pertanyaan" },
          { name: "jawab", label: "Jawaban", textarea: true },
        ]}
        awal={konten.faq as unknown as Record<string, string>[]}
      />
      <KontakEditor awal={konten.kontak} />
    </div>
  );
}
```

- [ ] **Step 5: Verifikasi manual**

Run: `npm run dev`, login admin, buka `/admin/konten`:
1. Semua seksi terisi data seed; ubah satu tahapan jadwal → Simpan → "Tersimpan".
2. Buka `/` → perubahan langsung tampil.
3. Tambah baris FAQ baru dan hapus satu baris biaya → Simpan → landing ikut berubah.
4. Kosongkan satu kolom lalu Simpan → error "Semua kolom wajib diisi...".

- [ ] **Step 6: Commit**

```bash
git add "src/app/admin/(dasbor)/konten/" src/components/admin/ListEditor.tsx src/components/admin/KontakEditor.tsx
git commit -m "feat: editor konten landing page untuk admin"
```

---

### Task 16: Verifikasi Menyeluruh, README & Persiapan Deploy

**Files:**
- Create: `README.md`

- [ ] **Step 1: Jalankan seluruh test & build**

Run: `npm test && npm run lint && npm run build`
Expected: semua test PASS, lint bersih, build sukses.

- [ ] **Step 2: Checklist manual lengkap** (`npm run dev`, uji di 375px dan desktop)

1. `/` — semua seksi tampil dari database.
2. `/daftar` — daftar siswa baru (NIK baru) sampai bukti; cetak bukti rapi.
3. `/cek-status` — status tampil benar.
4. Admin: login → dasbor angka benar → daftar (cari/filter) → detail (dokumen terbuka, ubah status + catatan) → cek status publik berubah → export Excel sesuai filter → edit konten → landing berubah → logout.
5. Keamanan cepat: `/admin/pendaftar` di incognito → redirect login; buka URL file storage tanpa signed URL → error akses.

- [ ] **Step 3: Buat `README.md`**

```markdown
# SPMB SD Plus 3 Al-Muhajirin — Tahun Ajaran 2027/2028

Website Sistem Penerimaan Murid Baru: landing page informasi, pendaftaran online
(tanpa akun), cek status, dan panel admin (verifikasi, penerimaan, export Excel,
edit konten).

Teknologi: Next.js (App Router) + Tailwind CSS + Supabase (PostgreSQL, Storage, Auth).

## Menjalankan Lokal

1. `npm install`
2. Salin `.env.local.example` → `.env.local`, isi dari Supabase (Settings → API).
3. Jalankan `supabase/schema.sql` lalu `supabase/seed.sql` di Supabase SQL Editor
   (sekali saja).
4. Buat akun admin: Supabase Dashboard → Authentication → Users → Add user
   (centang Auto Confirm).
5. `npm run dev` → http://localhost:3000. Panel admin: `/admin`.

## Test

`npm test`

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Vercel → New Project → import repo.
3. Tambahkan environment variables: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
4. Deploy. Uji ulang alur pendaftaran + admin di URL produksi.

Catatan free tier Supabase: proyek dijeda bila tidak ada aktivitas ±1 minggu —
buka dashboard Supabase untuk mengaktifkan kembali, atau upgrade saat masa
pendaftaran berlangsung.
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: README setup dan deployment"
```

---

## Ringkasan Urutan

1–2 fondasi (scaffold, database) → 3–7 logika inti ber-test (validasi, file, submit, cek status) → 8–10 halaman publik → 11–15 panel admin → 16 verifikasi menyeluruh + README.
