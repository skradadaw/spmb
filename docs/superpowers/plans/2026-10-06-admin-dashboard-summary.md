# Admin Dashboard Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a protected, responsive `/admin` dashboard that shows live registration summaries and recent applicants using shadcn primitives.

**Architecture:** A server-only admin repository selects a minimal projection from Supabase and maps it into a dashboard-specific DTO. The `/admin` Server Component verifies the signed admin session before reading data, then renders focused shadcn-based presentation components; logout remains a separate authenticated Server Action.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui primitives, Lucide React, Supabase, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-10-06-admin-dashboard-summary-design.md`

## Global Constraints

- `/admin` must verify `getAdminSession()` before loading or rendering registration data.
- Supabase service-role access remains server-only; no service key or raw database row reaches a Client Component.
- The first release is read-only except for logout.
- Dashboard queries must not select NIK, parent details, addresses, phone numbers, or document paths.
- Main interface elements use shadcn `Button`, `Card`, `Badge`, `Table`, `Separator`, and `Alert` primitives.
- Use Plus Jakarta Sans, the existing green palette, Lucide icons, and the existing reduced-motion behavior.
- At 375 px there must be no horizontal page scrolling; recent registrations use mobile cards instead of forcing the table to scroll.

## Review Focus

- An empty `pendaftar` table returns zeros, empty distributions, and a clear empty state rather than failing.
- Unknown or null status/class/type values are counted under `Lainnya` without making totals inconsistent.
- An invalid or expired session redirects before the repository is called.
- A Supabase query error produces a safe dashboard error state and logs no secret or sensitive applicant data to the browser.
- Long applicant names and status labels wrap or truncate without breaking the desktop table or 375 px mobile cards.

---

### Task 1: Add the missing shadcn primitives

**Files:**
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/table.tsx`
- Create: `src/components/ui/separator.tsx`
- Test: `src/components/ui/__tests__/admin-primitives.test.tsx`

**Interfaces:**
- Consumes: existing `cn(...inputs: ClassValue[]): string` from `src/lib/utils.ts` and established shadcn conventions in `src/components/ui/button.tsx` and `card.tsx`.
- Produces: `Badge`, `badgeVariants`, `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`, and `Separator`.

- [ ] **Step 1: Write failing primitive behavior tests**

Add tests named `renders semantic table structure`, `applies the requested badge variant`, and `renders a decorative separator by default`. Assert real roles/elements and public classes/ARIA behavior, not implementation source text.

- [ ] **Step 2: Run the primitive tests and verify RED**

Run: `npm.cmd test -- --run src/components/ui/__tests__/admin-primitives.test.tsx`

Expected: FAIL because the three shadcn modules do not exist.

- [ ] **Step 3: Implement the three shadcn primitives**

Use React ref-compatible components and existing `cn`. Define badge variants `default`, `secondary`, `destructive`, `outline`, `success`, and `warning`. Keep table markup semantic; make the separator default to `role="separator"`, `aria-orientation="horizontal"`, and support vertical orientation.

- [ ] **Step 4: Run the primitive tests and existing primitive tests**

Run: `npm.cmd test -- --run src/components/ui/__tests__/admin-primitives.test.tsx src/components/ui/__tests__/primitives.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the primitive layer**

```bash
git add src/components/ui/badge.tsx src/components/ui/table.tsx src/components/ui/separator.tsx src/components/ui/__tests__/admin-primitives.test.tsx
git commit -m "feat(ui): add dashboard shadcn primitives"
```

### Task 2: Build the server-only dashboard summary repository

**Files:**
- Create: `src/features/admin/contracts.ts`
- Create: `src/features/admin/server/dashboardRepository.ts`
- Create: `src/features/admin/__tests__/dashboardRepository.test.ts`

**Interfaces:**
- Consumes: a Supabase-compatible client passed to `createAdminDashboardRepository(client)`; production callers use `getSupabaseAdmin()`.
- Produces: `AdminDashboardSummary`, `RecentApplicant`, `DistributionItem`, `AdminDashboardLoadError`, and `createAdminDashboardRepository(client).getSummary(): Promise<AdminDashboardSummary>`.

- [ ] **Step 1: Write failing repository tests for normal and empty data**

Use literal fixtures to assert totals for `Menunggu Verifikasi`, `Menunggu Unggahan`, completed registrations, class/type distributions, descending recent registrations, and a maximum of eight recent items. Assert an empty result returns all zero metrics and empty recent items.

- [ ] **Step 2: Run repository tests and verify RED**

Run: `npm.cmd test -- --run src/features/admin/__tests__/dashboardRepository.test.ts`

Expected: FAIL because the admin repository does not exist.

- [ ] **Step 3: Define the dashboard contracts**

Define `DistributionItem` as `{ label: string; count: number; percentage: number }`, `RecentApplicant` with only `{ id, namaLengkap, pilihanKelas, jenisPendaftaran, status, createdAt }`, and `AdminDashboardSummary` with the four metrics, two distributions, recent applicants, and `updatedAt`.

- [ ] **Step 4: Implement the minimal projection and aggregation**

Add `import 'server-only'`. Query only `id,nama_lengkap,pilihan_kelas,jenis_pendaftaran,status,created_at`; map null/unknown categories to `Lainnya`; compute percentages with a zero-safe denominator; sort recent records newest-first and take eight. Wrap query failures in `AdminDashboardLoadError` without including row data or credentials.

- [ ] **Step 5: Add tests for unknown/null categories and query errors**

Assert unknown/null values enter `Lainnya`, category counts still sum to total registrations, and Supabase errors reject with `AdminDashboardLoadError` carrying only the safe message `Ringkasan pendaftaran tidak dapat dimuat.`

- [ ] **Step 6: Run repository tests**

Run: `npm.cmd test -- --run src/features/admin/__tests__/dashboardRepository.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit the repository**

```bash
git add src/features/admin/contracts.ts src/features/admin/server/dashboardRepository.ts src/features/admin/__tests__/dashboardRepository.test.ts
git commit -m "feat(admin): add dashboard summary repository"
```

### Task 3: Add authenticated logout and route protection

**Files:**
- Create: `src/features/auth/logout-action.ts`
- Create: `src/features/auth/__tests__/logout-action.test.ts`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/__tests__/layout.test.tsx`
- Modify: `src/features/auth/index.ts`

**Interfaces:**
- Consumes: `getAdminSession(): Promise<boolean>` and `clearAdminSession(): Promise<void>` from `src/features/auth/session.ts`.
- Produces: `logoutAdminAction(): Promise<never>` and an admin layout that renders children only for a valid session.

- [ ] **Step 1: Write failing logout tests**

Mock the Next redirect boundary while keeping the real action behavior visible. Assert `logoutAdminAction()` calls `clearAdminSession()` once and redirects to `/login`.

- [ ] **Step 2: Run logout tests and verify RED**

Run: `npm.cmd test -- --run src/features/auth/__tests__/logout-action.test.ts`

Expected: FAIL because the logout action does not exist.

- [ ] **Step 3: Implement and export `logoutAdminAction`**

Create a dedicated `'use server'` module; clear the cookie, then call `redirect('/login')`. Export it explicitly from `src/features/auth/index.ts`.

- [ ] **Step 4: Run logout tests and verify GREEN**

Run: `npm.cmd test -- --run src/features/auth/__tests__/logout-action.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing admin layout tests**

Assert invalid and expired-session outcomes redirect to `/login`, valid sessions render children, and `getAdminSession()` is called for every render.

- [ ] **Step 6: Run layout tests and verify RED**

Run: `npm.cmd test -- --run src/app/admin/__tests__/layout.test.tsx`

Expected: FAIL because the protected admin layout does not exist.

- [ ] **Step 7: Implement the protected Server Component layout**

Implement `AdminLayout({ children }: { children: React.ReactNode }): Promise<React.ReactNode>`; await the session before returning children and redirect immediately when it is false.

- [ ] **Step 8: Run auth and layout tests**

Run: `npm.cmd test -- --run src/features/auth/__tests__/session.test.ts src/features/auth/__tests__/logout-action.test.ts src/app/admin/__tests__/layout.test.tsx`

Expected: PASS.

- [ ] **Step 9: Commit route security**

```bash
git add src/features/auth/logout-action.ts src/features/auth/__tests__/logout-action.test.ts src/features/auth/index.ts src/app/admin/layout.tsx src/app/admin/__tests__/layout.test.tsx
git commit -m "feat(admin): protect dashboard route and add logout"
```

### Task 4: Build the responsive shadcn dashboard presentation

**Files:**
- Create: `src/features/admin/components/AdminDashboard.tsx`
- Create: `src/features/admin/components/DashboardSidebar.tsx`
- Create: `src/features/admin/components/MetricCard.tsx`
- Create: `src/features/admin/components/DistributionCard.tsx`
- Create: `src/features/admin/components/RecentApplicants.tsx`
- Create: `src/features/admin/components/__tests__/AdminDashboard.test.tsx`
- Create: `src/features/admin/index.ts`

**Interfaces:**
- Consumes: `AdminDashboardSummary`, `DistributionItem`, and `RecentApplicant` from Task 2; `logoutAdminAction` from Task 3; shadcn primitives from Task 1.
- Produces: `AdminDashboard({ summary }: { summary: AdminDashboardSummary }): React.ReactNode` and its focused presentation components.

- [ ] **Step 1: Write failing dashboard component tests**

Assert the school identity, single active `Ringkasan` navigation item, four metric labels and literal values, class/type distributions, desktop table headers, eight-or-fewer recent records, semantic status badges, logout control, and the mobile card representation. Add a long-name fixture and assert its visible container has wrapping/truncation protection classes.

- [ ] **Step 2: Run component tests and verify RED**

Run: `npm.cmd test -- --run src/features/admin/components/__tests__/AdminDashboard.test.tsx`

Expected: FAIL because the dashboard components do not exist.

- [ ] **Step 3: Implement sidebar and metric cards with shadcn**

Use `Card` composition for metrics, `Button` for logout, `Separator` for sidebar divisions, Lucide icons with consistent sizes, and visible text labels. Sidebar is desktop-only; add a compact mobile identity header inside `AdminDashboard`.

- [ ] **Step 4: Implement distribution panels**

Use `Card` composition and accessible progress semantics (`role="progressbar"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and a visible numeric value). Do not use charts or animation libraries.

- [ ] **Step 5: Implement recent applicant desktop and mobile views**

Use the shadcn `Table` at `md` and above and `Card` rows below `md`. Map known statuses to `success`, `warning`, `secondary`, or `destructive` badge variants while retaining visible status text so color is not the only signal.

- [ ] **Step 6: Add and test the empty state**

When `recentApplicants` is empty, render one shared empty-state message: `Belum ada data pendaftar. Data akan muncul setelah formulir pendaftaran dikirim.` Assert it appears once and both desktop/mobile list structures are absent.

- [ ] **Step 7: Run dashboard component tests**

Run: `npm.cmd test -- --run src/features/admin/components/__tests__/AdminDashboard.test.tsx`

Expected: PASS with no accessibility-role collisions.

- [ ] **Step 8: Commit the presentation layer**

```bash
git add src/features/admin/components src/features/admin/index.ts
git commit -m "feat(admin): build responsive dashboard summary UI"
```

### Task 5: Wire live data into `/admin` and handle failures

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/__tests__/page.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `getSupabaseAdmin()`, `createAdminDashboardRepository(client).getSummary()`, `AdminDashboard`, `AdminDashboardLoadError`, and shadcn `Alert`.
- Produces: the live `/admin` page reached by the existing successful login redirect.

- [ ] **Step 1: Write failing page integration tests**

Assert a successful repository response renders `AdminDashboard` with live literal metrics; an empty summary renders the specified empty state; and `AdminDashboardLoadError` renders a safe alert without raw Supabase details.

- [ ] **Step 2: Run page tests and verify RED**

Run: `npm.cmd test -- --run src/app/admin/__tests__/page.test.tsx`

Expected: FAIL because `src/app/admin/page.tsx` does not exist.

- [ ] **Step 3: Implement the `/admin` Server Component**

Create the Supabase admin client, load the summary through the repository, and render `AdminDashboard`. Catch only the expected dashboard/configuration errors for the safe UI; log an error identifier server-side without serializing applicant data.

- [ ] **Step 4: Add dashboard-level background tokens**

Add semantic CSS variables for admin canvas, surface, border, muted text, and sidebar green to `globals.css`, then consume those tokens rather than adding unrelated per-component hex values.

- [ ] **Step 5: Run page and login redirect tests**

Run: `npm.cmd test -- --run src/app/admin/__tests__/page.test.tsx src/features/auth/components/__tests__/AdminLoginForm.test.tsx`

Expected: PASS and successful login still targets `/admin`.

- [ ] **Step 6: Commit the live route**

```bash
git add src/app/admin/page.tsx src/app/admin/__tests__/page.test.tsx src/app/globals.css
git commit -m "feat(admin): connect dashboard to registration data"
```

### Task 6: Verify the complete dashboard

**Files:**
- Modify only if a verification failure identifies a dashboard defect.

**Interfaces:**
- Consumes: all prior tasks.
- Produces: a verified production-ready dashboard implementation within the approved first-stage scope.

- [ ] **Step 1: Run the full automated test suite**

Run: `npm.cmd test -- --run`

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run static checks**

Run: `npm.cmd run lint`

Expected: exit code 0 with no ESLint errors.

Run: `npx.cmd tsc --noEmit`

Expected: exit code 0 with no TypeScript errors.

- [ ] **Step 3: Run the production build**

Run: `npm.cmd run build`

Expected: exit code 0 and the route list includes `/admin`.

- [ ] **Step 4: Perform responsive and accessibility review**

Verify at 375 px, 768 px, and desktop widths: no horizontal page overflow, keyboard focus remains visible, table switches to cards below `md`, all icon-only controls have accessible names, decorative icons are hidden, progress values have semantic labels, and reduced-motion disables non-essential transitions.

- [ ] **Step 5: Confirm the server/client security boundary**

Run the existing client-source-boundary tests and inspect the production client bundles for `SUPABASE_SERVICE_ROLE_KEY`, `service_role`, NIK field names, parent fields, document paths, and `ADMIN_SESSION_SECRET`.

Expected: no secrets or excluded sensitive fields occur in client output.

- [ ] **Step 6: Commit any verification-only fixes**

```bash
git add <only-files-changed-by-verification>
git commit -m "fix(admin): resolve dashboard verification findings"
```
