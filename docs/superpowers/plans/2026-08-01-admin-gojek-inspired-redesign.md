# Admin SPMB Gojek-Inspired Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/admin/login` and the complete authenticated admin area into one consistent, light-mode SPMB operations interface inspired by Gojek's green color discipline.

**Architecture:** Introduce an admin-scoped token layer and admin-only UI primitives so public pages remain unchanged. Migrate the login, shell, and each admin page onto those primitives in independently reviewable tasks, replacing the finance-template components with real SPMB data and the “Jalur Siswa” progress model.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, Supabase, Vitest 4, plain CSS.

## Global Constraints

- Scope is limited to `/admin/login`, `/admin`, `/admin/pendaftar`, `/admin/pendaftar/[id]`, `/admin/pendaftar/export`, `/admin/konten`, and the authenticated admin shell.
- Public landing, registration, success, and status-check pages must not change.
- Use light mode only; remove theme-toggle usage and all `dark:` classes from admin UI files.
- Use `#00AA13` for primary actions, `#00880F` for hover/pressed, `#101820` for ink, `#F6F7F5` for canvas, `#FFFFFF` for surfaces, and `#667085` for muted content.
- Use Kumbh Sans 700–900 for display/headings, Inter 400–600 for body/UI, and system monospace only for registration numbers.
- All visible admin copy must use Bahasa Indonesia.
- Remove “Maglo”, finance terms, fake dollar values, fake chart data, credit-card visuals, and decorative emoji from the admin area.
- Dashboard metrics must come from existing Supabase SPMB data; do not add or change database schema or business rules.
- Use one SVG icon family, visible keyboard focus, minimum practical touch targets near 44px, responsive desktop/mobile layouts, and `prefers-reduced-motion` support.
- Cards use 20px radius; buttons and inputs use 12px radius; inputs are at least 48px high.
- Preserve unrelated uncommitted hydration work in `src/app/layout.tsx` and `tests/layout.test.tsx`; never stage it with redesign commits.

---

## File Structure

- Create `src/components/admin/styles.ts`: shared admin-only class contracts.
- Create `src/components/admin/AdminUI.tsx`: field, badge, card, and feedback primitives.
- Create `src/components/admin/AdminIcon.tsx`: consistent inline SVG icon family.
- Create `src/components/admin/LoginForm.tsx`: client-side login form state.
- Create `src/components/admin/EnrollmentJourney.tsx`: real SPMB stage visualization.
- Create `src/components/admin/AdminStatCard.tsx`: dashboard metrics.
- Create `src/components/admin/AdminQuickActions.tsx`: real admin shortcuts.
- Create `src/lib/admin/status-confirmation.ts`: pure risky-status confirmation rule.
- Create `src/app/admin/(dasbor)/loading.tsx`: stable admin skeleton.
- Create `src/app/admin/(dasbor)/error.tsx`: actionable admin error boundary.
- Create and extend `tests/admin-design-system.test.ts`: source/UI contracts.
- Create `tests/status-confirmation.test.ts`: behavior test for risky status changes.
- Modify all admin pages and components listed in the tasks below.
- Delete finance-template-only components after their replacements are wired.

---

### Task 1: Admin-scoped tokens, primitives, and SVG icons

**Files:**
- Create: `src/components/admin/styles.ts`
- Create: `src/components/admin/AdminUI.tsx`
- Create: `src/components/admin/AdminIcon.tsx`
- Create: `tests/admin-design-system.test.ts`
- Modify: `src/app/globals.css:1-52`

**Interfaces:**
- Produces `adminCardCls`, `adminInputCls`, `adminPrimaryButtonCls`, `adminSecondaryButtonCls`, and `adminDangerButtonCls` string exports.
- Produces `AdminField`, `AdminBadge`, `AdminCard`, and `AdminFeedback` React components.
- Produces `AdminIcon({ name, className?, decorative? })` and `AdminIconName`.
- Later tasks consume these APIs; public `src/components/ui.tsx` remains unchanged.

- [ ] **Step 1: Write failing token and primitive contract tests**

Create `tests/admin-design-system.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(path), "utf8");

describe("admin design system", () => {
  it("defines the approved scoped tokens", () => {
    const css = read("src/app/globals.css");
    for (const value of ["#00AA13", "#00880F", "#101820", "#F6F7F5", "#FFFFFF", "#667085"]) {
      expect(css.toUpperCase()).toContain(value);
    }
    expect(css).toContain(".admin-scope");
    expect(css).toContain("--font-admin-body");
  });

  it("exposes admin-only form, card, button, badge, and icon primitives", () => {
    const styles = read("src/components/admin/styles.ts");
    const ui = read("src/components/admin/AdminUI.tsx");
    const icons = read("src/components/admin/AdminIcon.tsx");
    for (const name of ["adminCardCls", "adminInputCls", "adminPrimaryButtonCls", "adminSecondaryButtonCls", "adminDangerButtonCls"]) {
      expect(styles).toContain(`export const ${name}`);
    }
    for (const name of ["AdminField", "AdminBadge", "AdminCard", "AdminFeedback"]) {
      expect(ui).toContain(`export function ${name}`);
    }
    expect(icons).toContain("export type AdminIconName");
    expect(icons).toContain("export default function AdminIcon");
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- tests/admin-design-system.test.ts`

Expected: FAIL because the scoped tokens and three admin primitive files do not exist.

- [ ] **Step 3: Add the scoped CSS token layer**

Update the font import in `src/app/globals.css` to request Inter alongside Kumbh Sans, then add:

```css
.admin-scope {
  --admin-primary: #00AA13;
  --admin-primary-hover: #00880F;
  --admin-ink: #101820;
  --admin-canvas: #F6F7F5;
  --admin-surface: #FFFFFF;
  --admin-muted: #667085;
  --font-admin-display: var(--font-kumbh);
  --font-admin-body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--admin-ink);
  font-family: var(--font-admin-body);
}

.admin-display {
  font-family: var(--font-admin-display);
}

@media (prefers-reduced-motion: reduce) {
  .admin-scope *,
  .admin-scope *::before,
  .admin-scope *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

Do not change the existing global `body` palette; public pages are out of scope.

- [ ] **Step 4: Add exact reusable style contracts**

Create `src/components/admin/styles.ts`:

```ts
export const adminCardCls =
  "rounded-[20px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,32,0.04)]";

export const adminInputCls =
  "min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#101820] placeholder:text-[#667085] focus:border-[#00AA13] focus:outline-none focus:ring-4 focus:ring-[#00AA13]/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

export const adminPrimaryButtonCls =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#00AA13] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00880F] focus:outline-none focus:ring-4 focus:ring-[#00AA13]/20 disabled:cursor-not-allowed disabled:opacity-60";

export const adminSecondaryButtonCls =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-[#101820] transition-colors hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#00AA13]/15";

export const adminDangerButtonCls =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-500/15 disabled:opacity-60";
```

- [ ] **Step 5: Add the admin UI primitives**

Create `src/components/admin/AdminUI.tsx` with this public API:

```tsx
import type { ReactNode } from "react";
import { adminCardCls } from "./styles";

export function AdminField({ id, label, error, hint, children }: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-[#101820]">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-[#667085]">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-700" role="alert">{error}</p>}
    </div>
  );
}

const badgeTone = {
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  danger: "border-red-200 bg-red-50 text-red-800",
} as const;

export function AdminBadge({ tone, children }: { tone: keyof typeof badgeTone; children: ReactNode }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeTone[tone]}`}>{children}</span>;
}

export function AdminCard({ className = "", children }: { className?: string; children: ReactNode }) {
  return <section className={`${adminCardCls} ${className}`}>{children}</section>;
}

export function AdminFeedback({ ok, children }: { ok: boolean; children: ReactNode }) {
  return <div role="status" className={`rounded-xl border p-3 text-sm font-medium ${ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>{children}</div>;
}
```

- [ ] **Step 6: Add a single SVG icon family**

Create `src/components/admin/AdminIcon.tsx`:

```tsx
export type AdminIconName =
  | "dashboard" | "users" | "content" | "logout" | "menu"
  | "download" | "arrow-right" | "search" | "file"
  | "student" | "check" | "clock" | "warning" | "plus" | "trash";

const paths: Record<AdminIconName, string> = {
  dashboard: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 5.13a4 4 0 0 1 0 7.75",
  content: "M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h5",
  logout: "M10 17l5-5-5-5 M15 12H3 M21 19V5a2 2 0 0 0-2-2h-6",
  menu: "M4 7h16 M4 12h16 M4 17h16",
  download: "M12 3v12 M7 10l5 5 5-5 M4 21h16",
  "arrow-right": "M5 12h14 M14 7l5 5-5 5",
  search: "M21 21l-4.35-4.35 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  file: "M6 2h8l4 4v16H6z M14 2v6h6",
  student: "M3 9l9-5 9 5-9 5z M7 12v4c3 2 7 2 10 0v-4 M21 10v6",
  check: "M20 6 9 17l-5-5",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 6v6l4 2",
  warning: "M12 3 2 21h20z M12 9v4 M12 17h.01",
  plus: "M12 5v14 M5 12h14",
  trash: "M3 6h18 M8 6V4h8v2 M19 6l-1 15H6L5 6 M10 11v5 M14 11v5",
};

export default function AdminIcon({
  name,
  className = "h-5 w-5",
  decorative = true,
}: {
  name: AdminIconName;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={decorative}
      aria-label={decorative ? undefined : name}
      role={decorative ? undefined : "img"}
    >
      <path d={paths[name]} />
    </svg>
  );
}
```

Do not use emoji or external icon dependencies.

- [ ] **Step 7: Verify GREEN and commit**

Run:

```bash
npm test -- tests/admin-design-system.test.ts
npx eslint src/components/admin/styles.ts src/components/admin/AdminUI.tsx src/components/admin/AdminIcon.tsx tests/admin-design-system.test.ts
```

Expected: 2/2 focused tests pass and scoped ESLint exits 0.

Commit:

```bash
git add src/app/globals.css src/components/admin/styles.ts src/components/admin/AdminUI.tsx src/components/admin/AdminIcon.tsx tests/admin-design-system.test.ts
git commit -m "feat(admin): add scoped design system"
```

---

### Task 2: Responsive admin login and auth-required notice

**Files:**
- Create: `src/components/admin/LoginForm.tsx`
- Modify: `src/app/admin/login/page.tsx`
- Modify: `src/middleware.ts`
- Modify: `tests/admin-design-system.test.ts`
- Modify: `tests/admin-login-style.test.ts`

**Interfaces:**
- Consumes `AdminField`, `AdminFeedback`, `AdminIcon`, `adminInputCls`, and `adminPrimaryButtonCls` from Task 1.
- `LoginForm({ notice?: string })` owns `useActionState`; the page remains a server component and maps `searchParams.reason` to copy.

- [ ] **Step 1: Add failing login contract tests**

Append:

```ts
describe("admin login", () => {
  it("uses a two-panel school identity and one Indonesian primary action", () => {
    const page = read("src/app/admin/login/page.tsx");
    const form = read("src/components/admin/LoginForm.tsx");
    expect(page).toContain("SD Plus 3 Al-Muhajirin");
    expect(page).toContain("Jalur Pendaftaran Siswa");
    expect(form).toContain("Masuk ke Dasbor");
    expect(form).toContain("adminPrimaryButtonCls");
    expect(`${page}\n${form}`).not.toMatch(/Maglo|dark:|text-white placeholder/);
  });

  it("shows a clear notice when authentication is required", () => {
    expect(read("src/middleware.ts")).toContain('reason", "auth-required"');
    expect(read("src/app/admin/login/page.tsx")).toContain("Sesi Anda tidak aktif");
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- tests/admin-design-system.test.ts`

Expected: FAIL because `LoginForm.tsx` and the redesigned copy do not exist.

- [ ] **Step 3: Split the client form from the server page**

Move `useActionState(login, null)` into `LoginForm.tsx`. Use `id="admin-email"`, `id="admin-password"`, matching `htmlFor` through `AdminField`, `autoComplete="email"`, `autoComplete="current-password"`, and this button copy:

```tsx
<button disabled={isPending} className={`${adminPrimaryButtonCls} w-full`}>
  {isPending ? "Memeriksa akun…" : "Masuk ke Dasbor"}
</button>
```

Render `AdminFeedback` for `notice` and the existing server-action error. Put `admin-login-form` on the form, remove `admin-login-input` from both controls, and replace the old dark/lime autofill rules in `globals.css` with:

```css
.admin-login-form input:-webkit-autofill,
.admin-login-form input:-webkit-autofill:hover {
  -webkit-text-fill-color: #101820;
  -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset;
  caret-color: #101820;
}

.admin-login-form input:-webkit-autofill:focus {
  -webkit-text-fill-color: #101820;
  -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset, 0 0 0 4px rgb(0 170 19 / 0.15);
  caret-color: #101820;
}
```

Update `tests/admin-login-style.test.ts` so it expects `admin-login-form` once, rejects `admin-login-input`, and asserts the white inset, ink text, and green focus shadow above. This migrates the existing regression rather than leaving it incompatible with the approved light-mode design.

- [ ] **Step 4: Replace the page with the approved responsive structure**

Make `page.tsx` an async server component accepting `searchParams: Promise<{ reason?: string }>`. Map `auth-required` to `Sesi Anda tidak aktif. Silakan masuk untuk melanjutkan.`. Use root class `admin-scope min-h-screen bg-[#F6F7F5]` and a two-column card at `lg:grid-cols-2`; the left green panel contains school identity, year `2027/2028`, and four route nodes labelled `Daftar`, `Verifikasi`, `Seleksi`, `Diterima`. Hide the detailed route labels below `lg` but retain a compact green header.

- [ ] **Step 5: Add the middleware reason**

Before redirecting an unauthenticated `/admin/*` request, create the login URL and set the reason:

```ts
const loginUrl = new URL("/admin/login", request.url);
loginUrl.searchParams.set("reason", "auth-required");
return NextResponse.redirect(loginUrl);
```

- [ ] **Step 6: Verify and commit**

Run:

```bash
npm test -- tests/admin-design-system.test.ts tests/admin-login-style.test.ts
npx eslint src/app/admin/login/page.tsx src/components/admin/LoginForm.tsx src/middleware.ts tests/admin-login-style.test.ts
```

Expected: login contracts pass and scoped ESLint exits 0.

Commit:

```bash
git add src/app/admin/login/page.tsx src/components/admin/LoginForm.tsx src/app/globals.css src/middleware.ts tests/admin-design-system.test.ts tests/admin-login-style.test.ts
git commit -m "feat(admin): redesign login experience"
```

---

### Task 3: Light-only admin shell, Indonesian navigation, and mobile drawer

**Files:**
- Modify: `src/app/admin/(dasbor)/layout.tsx`
- Modify: `src/components/admin/AdminSidebar.tsx`
- Modify: `src/components/admin/AdminHeader.tsx`
- Delete: `src/components/admin/ThemeToggle.tsx`
- Modify: `tests/admin-design-system.test.ts`

**Interfaces:**
- Consumes Task 1 tokens, SVG icons, and button styles.
- Produces a consistent `.admin-scope` wrapper for every authenticated admin route.

- [ ] **Step 1: Add failing shell contracts**

Append:

```ts
describe("authenticated admin shell", () => {
  it("uses Indonesian school navigation without finance-template or dark-mode UI", () => {
    const files = [
      "src/app/admin/(dasbor)/layout.tsx",
      "src/components/admin/AdminSidebar.tsx",
      "src/components/admin/AdminHeader.tsx",
    ];
    const source = files.map(read).join("\n");
    for (const text of ["Dasbor", "Pendaftar", "Kelola Konten", "Panitia SPMB"]) expect(source).toContain(text);
    expect(source).toContain("admin-scope");
    expect(source).not.toMatch(/Maglo|Transactions|Settings|ThemeToggle|dark:|Mahfuzul Nabil/);
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- tests/admin-design-system.test.ts`

Expected: FAIL on English/Maglo/dark-mode content.

- [ ] **Step 3: Rebuild the authenticated layout**

Use:

```tsx
<div className="admin-scope flex min-h-screen bg-[#F6F7F5] text-[#101820]">
  <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
  <div className="min-w-0 flex-1">
    <AdminHeader setMobileOpen={setMobileOpen} />
    <main className="mx-auto w-full max-w-[1280px] p-4 sm:p-6 lg:p-8">{children}</main>
  </div>
</div>
```

- [ ] **Step 4: Rebuild sidebar and header**

Sidebar navigation is exactly `Dasbor`, `Pendaftar`, `Kelola Konten`; use `AdminIcon` names `dashboard`, `users`, and `content`. Brand copy is `SPMB SD Plus 3` and `Tahun Ajaran 2027/2028`. Use a white desktop sidebar 260px wide, green active state, accessible mobile close button, backdrop, and bottom `Keluar` action.

Header path titles are exactly `Dasbor`, `Daftar Pendaftar`, `Detail Pendaftar`, `Export Data`, and `Kelola Konten`. Keep only menu button and a `Panitia SPMB` profile pill. Remove nonfunctional search, notification, personal name, and theme toggle.

- [ ] **Step 5: Remove dark-mode component and verify**

Delete `ThemeToggle.tsx`, then run:

```bash
npm test -- tests/admin-design-system.test.ts
npx eslint 'src/app/admin/(dasbor)/layout.tsx' src/components/admin/AdminSidebar.tsx src/components/admin/AdminHeader.tsx
```

Expected: shell contract passes and scoped ESLint exits 0.

Commit:

```bash
git add 'src/app/admin/(dasbor)/layout.tsx' src/components/admin/AdminSidebar.tsx src/components/admin/AdminHeader.tsx src/components/admin/ThemeToggle.tsx tests/admin-design-system.test.ts
git commit -m "feat(admin): unify authenticated shell"
```

---

### Task 4: Real SPMB dashboard and Jalur Siswa

**Files:**
- Create: `src/components/admin/EnrollmentJourney.tsx`
- Create: `src/components/admin/AdminStatCard.tsx`
- Create: `src/components/admin/AdminQuickActions.tsx`
- Modify: `src/app/admin/(dasbor)/page.tsx`
- Delete: `src/components/admin/ApplicantChart.tsx`
- Delete: `src/components/admin/MagloHeaderCards.tsx`
- Delete: `src/components/admin/MagloStatCard.tsx`
- Delete: `src/components/admin/QuickActionDeck.tsx`
- Modify: `tests/admin-design-system.test.ts`

**Interfaces:**
- `EnrollmentJourney({ total, terverifikasi, diputuskan, diterima })` renders four real stage counts.
- `AdminStatCard({ label, value, helper, icon, tone })` renders one real metric.
- `AdminQuickActions()` renders three real links.

- [ ] **Step 1: Add failing dashboard contracts**

Append:

```ts
describe("admin dashboard", () => {
  it("shows only real SPMB metrics and actions", () => {
    const files = [
      "src/app/admin/(dasbor)/page.tsx",
      "src/components/admin/EnrollmentJourney.tsx",
      "src/components/admin/AdminStatCard.tsx",
      "src/components/admin/AdminQuickActions.tsx",
    ];
    const source = files.map(read).join("\n");
    for (const text of ["Total Pendaftar", "Menunggu Verifikasi", "Diterima", "Jalur Siswa", "Perlu Ditindaklanjuti", "Export Excel", "Kelola Konten"]) expect(source).toContain(text);
    expect(source).not.toMatch(/Maglo|Wallet|Transaction|balance|spending|saved|Working Capital|Income|Expenses|VISA|\$\d/);
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- tests/admin-design-system.test.ts`

Expected: FAIL because new dashboard components do not exist and finance copy remains.

- [ ] **Step 3: Query real stage counts**

In the server page, run parallel head-count queries for total, `status_verifikasi = terverifikasi`, `status_penerimaan != menunggu`, `status_penerimaan = diterima`, and `status_verifikasi = menunggu`. Continue fetching the five latest waiting applicants. Never multiply counts or format them as currency.

- [ ] **Step 4: Implement the dashboard components**

`EnrollmentJourney` renders four connected nodes labelled `Daftar`, `Verifikasi`, `Seleksi`, `Diterima`, with each numeric prop displayed and the line using `#00AA13`. `AdminStatCard` uses `AdminIconName` and semantic tone classes. `AdminQuickActions` links to `/admin/pendaftar`, `/admin/pendaftar/export`, and `/admin/konten` with visible Indonesian labels.

Compose the page as:

```tsx
<div className="space-y-8">
  <header><p className="text-sm text-[#667085]">Ringkasan penerimaan murid baru tahun ajaran 2027/2028.</p></header>
  <div className="grid gap-4 md:grid-cols-3">{/* three AdminStatCard instances */}</div>
  <EnrollmentJourney total={total} terverifikasi={verified} diputuskan={decided} diterima={accepted} />
  <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">{/* latest waiting table + actions */}</div>
</div>
```

The recent table columns are `Nama`, `Nomor Pendaftaran`, `Asal TK/RA`, `Tanggal`, and `Aksi`.

- [ ] **Step 5: Delete template-only components, verify, and commit**

Delete the four replaced finance-template files, then run:

```bash
npm test -- tests/admin-design-system.test.ts
npx eslint 'src/app/admin/(dasbor)/page.tsx' src/components/admin/EnrollmentJourney.tsx src/components/admin/AdminStatCard.tsx src/components/admin/AdminQuickActions.tsx
```

Expected: dashboard contract passes and scoped ESLint exits 0.

Commit only the page, new components, deleted components, and test:

```bash
git add 'src/app/admin/(dasbor)/page.tsx' \
  src/components/admin/EnrollmentJourney.tsx \
  src/components/admin/AdminStatCard.tsx \
  src/components/admin/AdminQuickActions.tsx \
  src/components/admin/ApplicantChart.tsx \
  src/components/admin/MagloHeaderCards.tsx \
  src/components/admin/MagloStatCard.tsx \
  src/components/admin/QuickActionDeck.tsx \
  tests/admin-design-system.test.ts
git commit -m "feat(admin): replace finance dashboard with SPMB overview"
```

---

### Task 5: Responsive applicant list, filters, and empty state

**Files:**
- Modify: `src/app/admin/(dasbor)/pendaftar/page.tsx`
- Modify: `tests/admin-design-system.test.ts`

**Interfaces:**
- Consumes admin primitives and icons.
- Keeps the existing `q`, `verifikasi`, and `penerimaan` URL parameter contract and export URL behavior.

- [ ] **Step 1: Add failing applicant-list contracts**

Append:

```ts
describe("admin applicant list", () => {
  it("uses the shared admin controls and meaningful responsive copy", () => {
    const source = read("src/app/admin/(dasbor)/pendaftar/page.tsx");
    for (const text of ["Pendaftar", "Cari nama atau nomor pendaftaran", "Terapkan Filter", "Hapus Filter", "Export Excel", "Lihat detail", "Tidak ada pendaftar yang sesuai"]) expect(source).toContain(text);
    expect(source).toContain("adminInputCls");
    expect(source).toContain("AdminBadge");
    expect(source).not.toMatch(/Maglo|dark:|📊|🔍|🔄|text-\[#c8ee44\]/);
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- tests/admin-design-system.test.ts`

Expected: FAIL on old copy, emoji, and shared public primitives.

- [ ] **Step 3: Migrate the page**

Use `AdminCard`, `AdminBadge`, `AdminIcon`, `adminInputCls`, `adminPrimaryButtonCls`, and `adminSecondaryButtonCls`. Map verification tones as `menunggu → warning`, `terverifikasi → success`, `perlu_perbaikan → info`; map acceptance as `menunggu → warning`, `diterima → success`, `tidak_diterima → danger`.

Keep the desktop table and mobile cards. Use a light gray table header, approximately 56px rows, monospace registration numbers, visible `Lihat detail`, labelled filter controls, and an empty state with a `search` SVG icon plus actionable reset guidance.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- tests/admin-design-system.test.ts
npx eslint 'src/app/admin/(dasbor)/pendaftar/page.tsx'
```

Expected: applicant-list contract passes and scoped ESLint exits 0.

Commit:

```bash
git add 'src/app/admin/(dasbor)/pendaftar/page.tsx' tests/admin-design-system.test.ts
git commit -m "feat(admin): standardize applicant list UI"
```

---

### Task 6: Applicant detail, sticky decision panel, and risky-status confirmation

**Files:**
- Create: `src/lib/admin/status-confirmation.ts`
- Create: `tests/status-confirmation.test.ts`
- Modify: `src/app/admin/(dasbor)/pendaftar/[id]/page.tsx`
- Modify: `src/components/admin/StatusForm.tsx`
- Modify: `tests/admin-design-system.test.ts`

**Interfaces:**
- Produces `needsStatusConfirmation(previous: string, next: string): boolean`.
- Keeps the existing `updateStatusPendaftar(id, payload)` server-action contract.

- [ ] **Step 1: Write the failing behavior test**

Create:

```ts
import { describe, expect, it } from "vitest";
import { needsStatusConfirmation } from "@/lib/admin/status-confirmation";

describe("needsStatusConfirmation", () => {
  it("requires confirmation only when changing to tidak_diterima", () => {
    expect(needsStatusConfirmation("menunggu", "tidak_diterima")).toBe(true);
    expect(needsStatusConfirmation("diterima", "tidak_diterima")).toBe(true);
    expect(needsStatusConfirmation("tidak_diterima", "tidak_diterima")).toBe(false);
    expect(needsStatusConfirmation("menunggu", "diterima")).toBe(false);
  });
});
```

Append a UI contract that requires `Data Calon Siswa`, `Orang Tua dan Wali`, `Dokumen Pendaftaran`, `Keputusan Panitia`, `Simpan perubahan`, `sticky`, `AdminBadge`, and no emoji/dark classes.

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- tests/status-confirmation.test.ts tests/admin-design-system.test.ts
```

Expected: FAIL because the helper and redesigned copy do not exist.

- [ ] **Step 3: Implement the pure confirmation rule**

Create:

```ts
export function needsStatusConfirmation(previous: string, next: string): boolean {
  return previous !== "tidak_diterima" && next === "tidak_diterima";
}
```

Track the last persisted value separately:

```tsx
const [savedPenerimaan, setSavedPenerimaan] = useState(awal.status_penerimaan);
```

In `StatusForm.simpan`, before setting loading, call the helper and stop when this confirmation returns false:

```ts
if (
  needsStatusConfirmation(savedPenerimaan, penerimaan) &&
  !window.confirm("Tetapkan calon siswa sebagai tidak diterima?")
) return;
```

After `hasil.ok`, call `setSavedPenerimaan(penerimaan)` so saving only a later note edit does not ask for the same confirmation again.

- [ ] **Step 4: Migrate detail and form UI**

Use a `lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]` layout. Put student, parent, and document cards in the main column. Put `StatusForm` inside `lg:sticky lg:top-28` and title it `Keputusan Panitia`. Replace emoji headings with `AdminIcon`; use `AdminBadge`, `AdminField`, `AdminFeedback`, `adminInputCls`, and `adminPrimaryButtonCls`. Give every select/textarea an id. Success copy is `Perubahan pendaftar berhasil disimpan.`.

- [ ] **Step 5: Verify and commit**

Run:

```bash
npm test -- tests/status-confirmation.test.ts tests/admin-design-system.test.ts
npx eslint 'src/app/admin/(dasbor)/pendaftar/[id]/page.tsx' src/components/admin/StatusForm.tsx src/lib/admin/status-confirmation.ts
```

Expected: confirmation test and UI contracts pass; scoped ESLint exits 0.

Commit:

```bash
git add 'src/app/admin/(dasbor)/pendaftar/[id]/page.tsx' src/components/admin/StatusForm.tsx src/lib/admin/status-confirmation.ts tests/status-confirmation.test.ts tests/admin-design-system.test.ts
git commit -m "feat(admin): redesign applicant review workflow"
```

---

### Task 7: Consistent content editors with unsaved indicators

**Files:**
- Modify: `src/app/admin/(dasbor)/konten/page.tsx`
- Modify: `src/components/admin/ListEditor.tsx`
- Modify: `src/components/admin/KontakEditor.tsx`
- Modify: `tests/admin-design-system.test.ts`

**Interfaces:**
- `ListEditor` keeps `judul`, `kontenKey`, `fields`, and `awal`; replace `icon?: string` with `icon: AdminIconName`.
- Existing `simpanKonten(key, value)` action remains unchanged.

- [ ] **Step 1: Add failing editor contracts**

Append:

```ts
describe("admin content editors", () => {
  it("uses shared controls, SVG icons, section-specific feedback, and dirty state", () => {
    const source = [
      "src/app/admin/(dasbor)/konten/page.tsx",
      "src/components/admin/ListEditor.tsx",
      "src/components/admin/KontakEditor.tsx",
    ].map(read).join("\n");
    for (const text of ["Kelola Konten", "Perubahan belum disimpan", "berhasil disimpan", "adminInputCls", "AdminIcon", "AdminFeedback"]) expect(source).toContain(text);
    expect(source).not.toMatch(/dark:|📅|📋|💰|❓|📞|📝|✅/);
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- tests/admin-design-system.test.ts`

Expected: FAIL because editors still use emoji, public input styles, and generic feedback.

- [ ] **Step 3: Add dirty-state behavior**

In each client editor, add `const [dirty, setDirty] = useState(false)`. Set it true in every change/add/delete handler and false only after a successful save. Render:

```tsx
{dirty && <span className="text-xs font-semibold text-amber-700">Perubahan belum disimpan</span>}
```

For list success use `${judul} berhasil disimpan.`; for contact use `Kontak panitia berhasil disimpan.`. Render results through `AdminFeedback`.

- [ ] **Step 4: Migrate visual structure**

Page title becomes `Kelola Konten` with a concise explanation. Pass SVG icon names rather than emoji. Editors use `AdminCard`, `AdminIcon`, `AdminField`, `adminInputCls`, secondary add buttons, danger delete buttons, and primary save buttons. Every input/textarea receives a stable id derived from `kontenKey`, row index, and field name.

- [ ] **Step 5: Verify and commit**

Run:

```bash
npm test -- tests/admin-design-system.test.ts
npx eslint 'src/app/admin/(dasbor)/konten/page.tsx' src/components/admin/ListEditor.tsx src/components/admin/KontakEditor.tsx
```

Expected: editor contract passes and scoped ESLint exits 0.

Commit:

```bash
git add 'src/app/admin/(dasbor)/konten/page.tsx' src/components/admin/ListEditor.tsx src/components/admin/KontakEditor.tsx tests/admin-design-system.test.ts
git commit -m "feat(admin): standardize content editors"
```

---

### Task 8: Loading/error states, full admin audit, and production verification

**Files:**
- Create: `src/app/admin/(dasbor)/loading.tsx`
- Create: `src/app/admin/(dasbor)/error.tsx`
- Modify: `tests/admin-design-system.test.ts`
- Modify: `README.md` only if admin UI documentation currently mentions Maglo or dark mode.

**Interfaces:**
- `loading.tsx` is a server-compatible skeleton.
- `error.tsx` is a client error boundary receiving `{ error: Error & { digest?: string }; reset(): void }`.

- [ ] **Step 1: Add failing whole-area audit tests**

Append:

```ts
import { existsSync, readdirSync, statSync } from "node:fs";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = `${dir}/${name}`;
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe("admin area audit", () => {
  it("has loading and recoverable error states", () => {
    expect(existsSync(resolve("src/app/admin/(dasbor)/loading.tsx"))).toBe(true);
    const error = read("src/app/admin/(dasbor)/error.tsx");
    expect(error).toContain("Tidak dapat memuat halaman");
    expect(error).toContain("Coba lagi");
    expect(error).toContain("reset()");
  });

  it("contains no finance-template, dark-mode, fake-money, or decorative emoji residue", () => {
    const files = [...walk("src/app/admin"), ...walk("src/components/admin")]
      .filter((path) => /\.(ts|tsx|css)$/.test(path));
    const source = files.map(read).join("\n");
    expect(source).not.toMatch(/Maglo|Working Capital|Transactions?|Wallet|VISA|Total balance|Total spending|Total saved|Scheduled Transfers|dark:|maglo-theme|\$\d/);
    expect(source).not.toMatch(/[📊🔍🔄👧📁⚙️📅📋💰❓📞📝✅🎉💼⏳]/u);
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- tests/admin-design-system.test.ts`

Expected: FAIL because loading/error files do not exist or audit residue remains.

- [ ] **Step 3: Add stable loading and actionable error UI**

`loading.tsx` returns an `.admin-scope` set of three pulsing metric blocks, one wide journey block, and two content blocks using `animate-pulse` plus `aria-label="Memuat halaman admin"`.

`error.tsx` starts with `"use client"`, logs the received error in `useEffect`, and renders `AdminCard`, `AdminIcon name="warning"`, heading `Tidak dapat memuat halaman`, recovery guidance, and a primary `Coba lagi` button calling `reset()`.

- [ ] **Step 4: Resolve only audit failures inside admin scope**

Run the focused test, inspect each reported match, and remove only admin-scope residue. Do not edit public pages. Do not delete the existing `.admin-login-input` autofill rules unless the login task has replaced them safely and its tests remain green.

- [ ] **Step 5: Run full verification**

Run:

```bash
npm test
npx eslint src/app/admin src/components/admin src/lib/admin tests/admin-design-system.test.ts tests/status-confirmation.test.ts
npm run build
git diff --check
git status --short
```

Expected:

- All Vitest files pass with zero failed tests.
- Scoped admin ESLint exits 0.
- Production build exits 0; the existing middleware deprecation warning may remain but must be reported.
- `git diff --check` has no output.
- `git status --short` shows only known unrelated hydration work plus intentional redesign files before commit.

- [ ] **Step 6: Commit final system states**

```bash
git add 'src/app/admin/(dasbor)/loading.tsx' 'src/app/admin/(dasbor)/error.tsx' tests/admin-design-system.test.ts README.md
git commit -m "feat(admin): add resilient UI states"
```

If `README.md` did not require a change, omit it from `git add`.

---

## Final Manual Review Checklist

- `/admin/login`: desktop two-panel and compact mobile layout.
- `/admin`: real metrics, Jalur Siswa, recent work, and real quick actions.
- `/admin/pendaftar`: filters, mobile cards, desktop table, empty state, export link.
- `/admin/pendaftar/[id]`: documents, sticky decision panel, rejection confirmation.
- `/admin/konten`: dirty indicators, per-section success/error feedback.
- Sidebar drawer, logout, keyboard navigation, focus visibility, 44px touch targets.
- Viewports: 375px, 768px, 1280px, and 1440px.
- Long names, long addresses, no data, failed data, and pending submissions.
- No visible Gojek logo/name, Maglo identity, finance terminology, fake values, emoji icons, or dark mode.
