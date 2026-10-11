# Data Peserta Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan modul read-only Data Peserta untuk admin berupa daftar, pencarian/filter/pagination, detail peserta, dan akses dokumen privat tanpa fitur verifikasi pembayaran.

**Architecture:** Memakai route App Router baru di bawah `/admin/pendaftar`, repository `server-only` dengan select kolom eksplisit, contracts terpisah, dan komponen presentasi feature-based. Setiap route/detail/document endpoint memeriksa sesi admin secara mandiri. Layout mengikuti `DashboardSidebar`, `AdminDashboard`, komponen shadcn yang sudah ada, serta CSS variables/token yang sudah tersedia; tidak menambah dependency atau design system baru.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Supabase, Server Actions/server route handlers bila diperlukan, Tailwind CSS 4, shadcn/Radix primitives, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-10-admin-data-peserta-design.md`

## Global Constraints

- Tidak ada fitur verifikasi pembayaran, mutasi peserta, edit, hapus, perubahan status, export, atau migrasi database.
- Bukti pembayaran hanya ditampilkan sebagai lampiran biasa; tidak ada status pembayaran baru.
- Daftar memakai pagination 20 peserta per halaman, pencarian nama, filter kelas/jenis/status, urutan `created_at DESC` lalu `id`.
- Query memilih kolom eksplisit dan tidak membocorkan `submission_secret_hash`, `submission_id`, token, atau secret server.
- Dokumen hanya memakai allowlist `DOCUMENT_DEFINITIONS`, path dari row database, bucket privat, signed URL TTL 60 detik, tanpa menerima path storage bebas dari client.
- Semua entry point data sensitif memeriksa sesi admin secara mandiri dan respons tidak menggunakan shared/public cache.
- UI harus mengikuti style menu/sidebar admin yang sudah ada, menggunakan primitive shadcn dan CSS variables/token yang sudah ada.
- Pertahankan perubahan pengguna pada `src/features/home/__tests__/page.test.tsx`.

## Review Focus

- Query/filter dengan wildcard, input terlalu panjang, halaman invalid, dan halaman di luar rentang harus aman dan stabil — dites pada repository/query parser Task 1.
- Sesi admin invalid pada list, detail, dan dokumen tidak boleh memperoleh data — dites pada Task 2/4.
- ID valid tetapi tidak ditemukan, UUID invalid, dokumen kosong, dan path storage invalid harus menghasilkan respons aman — dites pada Task 3/4.
- Signed URL harus hanya dibuat dari path row peserta dan berlaku 60 detik — dites pada Task 4.
- Layout mobile 375px, menu aktif, empty/error/loading state, dan navigasi kembali tidak boleh overflow atau membocorkan PII — dites pada Task 5.

---

### Task 1: Contracts, query parameters, dan repository Data Peserta

**Files:**
- Create: `src/features/admin/participants/contracts.ts`
- Create: `src/features/admin/participants/query.ts`
- Create: `src/features/admin/participants/server/participantsRepository.ts`
- Test: `src/features/admin/participants/__tests__/query.test.ts`
- Test: `src/features/admin/participants/__tests__/participantsRepository.test.ts`

**Interfaces:**
- Produce `ParticipantListQuery`: `{ search: string; classFilter: string | null; typeFilter: string | null; statusFilter: string | null; page: number }`.
- Produce `ParticipantListItem`: `id`, `namaLengkap`, `pilihanKelas`, `jenisPendaftaran`, `status`, `createdAt`.
- Produce `ParticipantListResult`: `items`, `page`, `pageSize`, `total`, `totalPages`.
- Produce `ParticipantDetail`: grouped explicit fields for identity, registration, address, parents, status/date, and document paths; never expose secret/session fields.
- Implement `parseParticipantListQuery(searchParams: URLSearchParams): ParticipantListQuery` with page size 20, trimmed/bounded search, allowlisted class/type values, safe status value, invalid page normalization, and reset semantics handled by links/forms.
- Implement `createParticipantsRepository(client)` with `list(query)` and `getById(id)`, using explicit select lists, stable ordering, count, and server-only boundary.

**Steps:**
- [ ] Write failing tests for query normalization, allowed filters, page bounds, explicit selected columns, ordering, pagination, null mapping, and detail mapping.
- [ ] Run the focused Vitest tests and confirm they fail for the missing contracts/parser/repository.
- [ ] Implement contracts, parser, and repository using the existing admin repository patterns and Supabase client typing.
- [ ] Run focused tests and confirm PASS.
- [ ] Run `npm run lint` for the changed files or full lint if the project script does not support file selection.

### Task 2: Server-side list route and admin navigation

**Files:**
- Create: `src/app/admin/pendaftar/page.tsx`
- Create: `src/features/admin/participants/components/ParticipantList.tsx`
- Create: `src/features/admin/participants/components/ParticipantFilters.tsx`
- Modify: `src/features/admin/components/DashboardSidebar.tsx`
- Modify: `src/features/admin/components/AdminDashboard.tsx` or `src/features/admin/components/RecentApplicants.tsx`
- Test: `src/features/admin/participants/__tests__/ParticipantList.test.tsx`
- Test: `src/features/admin/participants/__tests__/ParticipantFilters.test.tsx`

**Interfaces:**
- Page reads `searchParams`, checks `getAdminSession()` itself, creates the existing Supabase admin client/repository, and renders list state; invalid data errors use a safe Alert rather than raw errors.
- `ParticipantFilters` renders labeled search/filter controls using existing `Input`, `Select`, `Button`, `Card`, and `Badge` primitives; submit links preserve valid filters and reset `page=1`.
- `ParticipantList` receives `ParticipantListResult` and renders desktop Table plus mobile cards, with a detail link preserving safe list query context.

**Steps:**
- [ ] Write failing component tests for empty state, rows, status badges, mobile representation, filter labels, reset behavior, and detail link.
- [ ] Run focused tests and confirm failure.
- [ ] Implement server page and list/filter components using the current admin sidebar spacing, green active style, `--admin-*`/brand variables, Plus Jakarta Sans, existing radius/shadow patterns, and no new CSS variables.
- [ ] Add `Data Peserta` navigation item to desktop sidebar and the existing mobile admin header/navigation style; ensure active state is route-aware without breaking Ringkasan.
- [ ] Link recent applicants to the new detail route without exposing internal secrets.
- [ ] Run focused tests, `npm run lint`, and `npx tsc --noEmit`.

### Task 3: Participant detail page

**Files:**
- Create: `src/app/admin/pendaftar/[id]/page.tsx`
- Create: `src/features/admin/participants/components/ParticipantDetail.tsx`
- Create: `src/features/admin/participants/components/ParticipantFieldGroup.tsx`
- Test: `src/features/admin/participants/__tests__/ParticipantDetail.test.tsx`

**Interfaces:**
- Dynamic page validates UUID, checks admin session independently, calls repository `getById(id)`, and uses safe not-found/error handling.
- `ParticipantDetail` renders grouped cards for identity, registration, school/achievement, optional Direktorat 2 fields, address, father, mother, and documents.
- Empty values render `Belum diisi`; status uses the same badge semantics as the dashboard; no payment-verification control is rendered.
- Back link returns to `/admin/pendaftar` with validated query context only.

**Steps:**
- [ ] Write failing tests for grouped fields, null values, invalid/not-found states, status rendering, document availability, and absence of payment-verification controls.
- [ ] Run focused tests and confirm failure.
- [ ] Implement detail page/components with existing Card, Badge, Separator, Button, Alert, and Lucide icon styles.
- [ ] Run focused tests and `npx tsc --noEmit`.

### Task 4: Authenticated private document access

**Files:**
- Create: `src/app/admin/pendaftar/[id]/dokumen/[documentId]/route.ts`
- Create: `src/features/admin/participants/server/participantDocumentService.ts`
- Test: `src/features/admin/participants/__tests__/participantDocumentService.test.ts`
- Test: `src/app/admin/pendaftar/[id]/dokumen/[documentId]/route.test.ts`

**Interfaces:**
- Implement `getParticipantDocument(id: string, documentId: RegistrationDocumentId, repository, storage)`; accept only document IDs from `DOCUMENT_DEFINITIONS`.
- Route checks admin session, validates UUID/document allowlist, obtains path from the participant row, verifies path belongs to the private bucket/path policy, creates a signed URL with 60-second expiry, and redirects or returns a safe error response.
- Client never submits an arbitrary storage path; signed URL is not logged or cached.

**Steps:**
- [ ] Write failing tests for unauthorized access, invalid UUID/document ID, missing document, invalid path, correct row-derived path, exact 60-second TTL, and storage failure.
- [ ] Run focused tests and confirm failure.
- [ ] Implement service and route using the existing Supabase admin/storage patterns.
- [ ] Update detail document links to target the authenticated route with `target="_blank"` and `rel="noopener noreferrer"`.
- [ ] Run focused tests, `npm run lint`, and `npx tsc --noEmit`.

### Task 5: Integration, visual states, and verification

**Files:**
- Modify: any participant files required by integration fixes only.
- Test: `src/app/admin/pendaftar/__tests__/page.test.tsx`
- Test: `src/app/admin/pendaftar/[id]/__tests__/page.test.tsx`

**Steps:**
- [ ] Add route-level tests for session redirect, list query integration, detail not-found, and safe error rendering.
- [ ] Run `npm run test:run` and fix only regressions caused by this feature; do not overwrite unrelated local test changes.
- [ ] Run `npm run lint`.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npm run build` (which uses `next build --webpack`) and resolve feature regressions only.
- [ ] If a browser/visual environment is available, verify desktop and 375px mobile layouts with synthetic data: sidebar active state, list filters, cards, detail groups, and no horizontal overflow.
- [ ] Review `git diff` and `git status --short`; confirm the existing modified home test remains intact and no secrets/generated artifacts are included.

## Commit Boundaries

- Commit Task 1 as `feat(admin): add participant repository contracts`.
- Commit Task 2 as `feat(admin): add participant list and navigation`.
- Commit Task 3 as `feat(admin): add participant detail view`.
- Commit Task 4 as `feat(admin): add private participant document access`.
- Commit Task 5 as `test(admin): verify participant management flow`.

Do not commit until the user explicitly requests commits or the selected execution workflow requires it.
