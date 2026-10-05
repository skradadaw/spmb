# Admin PIN Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun halaman login autentikasi khusus Admin/Panitia SPMB berbasis PIN tunggal dengan layout Split-Screen Showcase menggunakan komponen shadcn/ui.

**Architecture:** Menerapkan arsitektur *feature-driven* (`src/features/auth/`) dengan Thin App Router (`src/app/(public)/login/page.tsx`). Logika verifikasi PIN dan rate limiting berjalan di Server Action (`actions.ts`) tanpa mengekspos rahasia PIN ke client component. Komponen UI mematuhi batasan AST security boundary (`clientSourceBoundary.test.ts`).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Lucide React, Vitest 4, Testing Library.

**Spec:** [docs/superpowers/specs/2026-10-05-admin-pin-login-design.md](file:///c:/Users/Admin/Documents/Projek\spmb\docs\superpowers\specs\2026-10-05-admin-pin-login-design.md)

## Global Constraints

- Semua unit test Vitest (`npm run test:run`) harus tetap lulus 100%.
- AST security boundary (`clientSourceBoundary.test.ts`) tidak boleh dilanggar: tidak ada kode server atau service-role key yang diimpor ke client component.
- Rahasia `ADMIN_PIN` hanya boleh diakses di environment server (`server-only` / Server Action).
- Komponen UI harus accessible (WAI-ARIA compliant, touch target minimal 44px, label semantik).
- `npm run lint` dan `npm run build` harus menghasilkan 0 error.

## Review Focus

1. **Non-numeric & Empty PIN Input**: Memastikan input selain angka atau input kosong ditolak dengan pesan validasi ramah pengguna.
2. **Brute Force Rate Limiting**: Memastikan 5 percobaan PIN salah berturut-turut memicu penguncian sementara (rate limit).
3. **Toggle Eye Visibility**: Memastikan toggle icon mata mengubah tipe input antara `password` dan `text` secara reaktif.
4. **Client Boundary Isolation**: Memastikan `AdminLoginForm.tsx` tidak mengimpor modul server atau membocorkan PIN.
5. **Session Cookie Security**: Memastikan cookie `spmb_admin_session` diset dengan flag `httpOnly`, `sameSite: 'lax'`, dan durasi 24 jam.

---

## Tasks

### Task 1: Add Shadcn UI Component Primitives
**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/alert.tsx`
- Test: `src/components/ui/__tests__/primitives.test.tsx`

**Interfaces:**
- Produces:
  - `Button` (`variant`: default | destructive | outline | secondary | ghost | link, `size`: default | sm | lg | icon)
  - `Input` (HTMLInputElement props standard)
  - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
  - `Alert`, `AlertTitle`, `AlertDescription` (`variant`: default | destructive)

- [ ] **Step 1: Write the failing test**
Create `src/components/ui/__tests__/primitives.test.tsx` testing that `Button`, `Input`, `Card`, and `Alert` render correctly with appropriate class names and attributes.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run test:run src/components/ui/__tests__/primitives.test.tsx`
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement primitives**
Implement `src/components/ui/button.tsx`, `input.tsx`, `card.tsx`, and `alert.tsx` using `clsx` and `tailwind-merge` (`cn` helper from `@/lib/utils`).

- [ ] **Step 4: Run test to verify it passes**
Run: `npm run test:run src/components/ui/__tests__/primitives.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/components/ui/
git commit -m "feat(ui): add shadcn button, input, card, and alert primitives"
```

---

### Task 2: Implement Admin Session & Server Action with Rate Limiting
**Files:**
- Create: `src/features/auth/contracts.ts`
- Create: `src/features/auth/session.ts`
- Create: `src/features/auth/actions.ts`
- Test: `src/features/auth/__tests__/actions.test.ts`

**Interfaces:**
- Consumes: `process.env.ADMIN_PIN`, `next/headers` (`cookies`)
- Produces:
  - `verifyAdminPinAction(pin: string): Promise<VerifyPinResult>`
  - `getAdminSession(): Promise<boolean>`
  - `clearAdminSession(): Promise<void>`
  - Types: `VerifyPinResult = { success: true; redirectUrl: string } | { success: false; error: string; remainingAttempts?: number }`

- [ ] **Step 1: Write the failing test**
Create `src/features/auth/__tests__/actions.test.ts` covering:
- Correct PIN returns `{ success: true, redirectUrl: '/admin' }` and sets cookie.
- Incorrect PIN returns `{ success: false, error: 'PIN keamanan tidak valid' }`.
- Non-numeric or empty PIN returns `{ success: false, error: 'PIN harus berupa angka' }`.
- 5 consecutive failed attempts locks out and returns rate limit error.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run test:run src/features/auth/__tests__/actions.test.ts`
Expected: FAIL (actions not found)

- [ ] **Step 3: Implement contracts, session, and actions**
Implement:
- `src/features/auth/contracts.ts`: type definitions.
- `src/features/auth/session.ts`: cookie setter/getter with `httpOnly: true`, `sameSite: 'lax'`, `maxAge: 86400`.
- `src/features/auth/actions.ts`: Server Action with in-memory sliding window rate limiter (5 max attempts, 60s window).

- [ ] **Step 4: Run test to verify it passes**
Run: `npm run test:run src/features/auth/__tests__/actions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/features/auth/contracts.ts src/features/auth/session.ts src/features/auth/actions.ts src/features/auth/__tests__/
git commit -m "feat(auth): implement admin session and PIN verification server action with rate limit"
```

---

### Task 3: Implement Split-Screen Visual Component (`LoginHero`)
**Files:**
- Create: `src/features/auth/components/LoginHero.tsx`
- Test: `src/features/auth/components/__tests__/LoginHero.test.tsx`

**Interfaces:**
- Produces: `LoginHero(): JSX.Element`

- [ ] **Step 1: Write the failing test**
Create `src/features/auth/components/__tests__/LoginHero.test.tsx` verifying:
- Displays school name "SD Plus 3 Al-Muhajirin".
- Displays badge "Portal Khusus Panitia SPMB".
- Displays security guarantee icons (`ShieldCheck`, `LockKeyhole`) and advisory text.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run test:run src/features/auth/components/__tests__/LoginHero.test.tsx`
Expected: FAIL (LoginHero not found)

- [ ] **Step 3: Implement `LoginHero.tsx`**
Implement `src/features/auth/components/LoginHero.tsx` with gradient `from-[#00550B] via-[#007A10] to-[#00A315]`, glowing orbs, decorative badge, and security notice cards.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm run test:run src/features/auth/components/__tests__/LoginHero.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/features/auth/components/LoginHero.tsx src/features/auth/components/__tests__/LoginHero.test.tsx
git commit -m "feat(auth): add LoginHero visual component with emerald branding"
```

---

### Task 4: Implement Client Component `AdminLoginForm`
**Files:**
- Create: `src/features/auth/components/AdminLoginForm.tsx`
- Create: `src/features/auth/index.ts`
- Test: `src/features/auth/components/__tests__/AdminLoginForm.test.tsx`

**Interfaces:**
- Consumes: `verifyAdminPinAction` from `../actions`, `Button`, `Input`, `Card`, `Alert` from `@/components/ui/*`
- Produces: `AdminLoginForm(): JSX.Element` (Client component)
- Public Barrel (`src/features/auth/index.ts`): exports `AdminLoginForm`, `LoginHero`, `verifyAdminPinAction`, `getAdminSession`, `clearAdminSession`

- [ ] **Step 1: Write the failing test**
Create `src/features/auth/components/__tests__/AdminLoginForm.test.tsx` testing:
- Renders password-masked single PIN input by default.
- Toggles visibility on clicking eye icon (switches between password and text).
- Shows loading spinner and disables submit button when form is submitting.
- Displays alert message if verification action fails.
- Renders link back to home page (`/`).

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run test:run src/features/auth/components/__tests__/AdminLoginForm.test.tsx`
Expected: FAIL (component not found)

- [ ] **Step 3: Implement `AdminLoginForm.tsx` & Barrel `index.ts`**
Build `AdminLoginForm.tsx` using `useState`, `useTransition`, Lucide icons (`Eye`, `EyeOff`, `Loader2`), and shadcn components. Export through `src/features/auth/index.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm run test:run src/features/auth/components/__tests__/AdminLoginForm.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/features/auth/components/AdminLoginForm.tsx src/features/auth/index.ts src/features/auth/components/__tests__/AdminLoginForm.test.tsx
git commit -m "feat(auth): add AdminLoginForm with single PIN field and toggle visibility"
```

---

### Task 5: Implement `/login` Route Page & Verify Client Boundary
**Files:**
- Create: `src/app/(public)/login/page.tsx`
- Modify: `src/features/home/components/HomeHeader.tsx` (add link to login for panitia)
- Test: `src/app/(public)/login/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: `LoginHero`, `AdminLoginForm` from `@/features/auth`

- [ ] **Step 1: Write the failing test**
Create `src/app/(public)/login/__tests__/page.test.tsx` verifying `/login` page renders both `LoginHero` and `AdminLoginForm`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm run test:run src/app/\(public\)/login/__tests__/page.test.tsx`
Expected: FAIL (route page not found)

- [ ] **Step 3: Implement page and update header**
Implement `src/app/(public)/login/page.tsx` with split-screen layout (`min-h-screen flex flex-col lg:flex-row`). Add navigation link in `HomeHeader.tsx` so administrators can easily navigate to `/login`.

- [ ] **Step 4: Run test to verify it passes and verify client AST boundary**
Run: `npm run test:run`
Expected: All tests PASS (including `clientSourceBoundary.test.ts`).

- [ ] **Step 5: Build verification**
Run: `npm run build`
Expected: Build succeeds with 0 errors.

- [ ] **Step 6: Commit**
```bash
git add src/app/\(public\)/login/ src/features/home/components/HomeHeader.tsx
git commit -m "feat(auth): complete /login route page and header link integration"
```
