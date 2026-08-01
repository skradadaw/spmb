# Admin Login Input Color Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make typed email and password text on `/admin/login` lime instead of white, including the caret and browser autofill state.

**Architecture:** Add one scoped `.admin-login-input` rule to the existing global stylesheet and attach it only to the two login inputs. Keep the shared `inputCls` unchanged so public forms and other admin forms retain their current appearance.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, Vitest 4, plain CSS.

## Global Constraints

- Only the email and password inputs on `/admin/login` may change.
- Typed text and caret use lime `#c8ee44` via the existing `--maglo-lime` token.
- Placeholder remains slate gray.
- Browser autofill keeps lime text and the dark `#1c1a2e` background.
- Do not modify the shared `inputCls` export.
- Do not add dependencies.

---

## File Structure

- Create `tests/admin-login-style.test.ts`: regression checks for scoped class usage and its CSS contract.
- Modify `src/app/admin/login/page.tsx`: replace `text-white` with the scoped class on exactly two inputs.
- Modify `src/app/globals.css`: define normal, caret, and WebKit autofill styling for the scoped class.

### Task 1: Scoped lime text styling for admin login inputs

**Files:**
- Create: `tests/admin-login-style.test.ts`
- Modify: `src/app/admin/login/page.tsx:32-50`
- Modify: `src/app/globals.css:20-31`

**Interfaces:**
- Consumes: existing CSS variables `--maglo-lime` and `--maglo-canvas-dark` from `src/app/globals.css`.
- Produces: CSS class `.admin-login-input`, used only by the email and password inputs.

- [ ] **Step 1: Write the failing regression tests**

Create `tests/admin-login-style.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const loginPage = readFileSync(resolve("src/app/admin/login/page.tsx"), "utf8");
const globalCss = readFileSync(resolve("src/app/globals.css"), "utf8");

describe("admin login input styling", () => {
  it("memakai class khusus tepat pada input email dan password", () => {
    const loginInputs = loginPage.match(/<input[\s\S]*?\/>/g) ?? [];

    expect(loginInputs).toHaveLength(2);
    for (const input of loginInputs) {
      expect(input).toContain("admin-login-input");
      expect(input).not.toContain("text-white");
    }
  });

  it("memberi warna lime pada teks, caret, dan autofill", () => {
    expect(globalCss).toMatch(
      /\.admin-login-input\s*\{[\s\S]*?color:\s*var\(--maglo-lime\);[\s\S]*?caret-color:\s*var\(--maglo-lime\);[\s\S]*?\}/,
    );
    expect(globalCss).toMatch(/\.admin-login-input:-webkit-autofill/);
    expect(globalCss).toMatch(/-webkit-text-fill-color:\s*var\(--maglo-lime\);/);
    expect(globalCss).toMatch(/var\(--maglo-canvas-dark\)\s+inset/);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- tests/admin-login-style.test.ts
```

Expected: FAIL because `admin-login-input` and its CSS rules do not exist.

- [ ] **Step 3: Add the minimal scoped CSS**

Add this after the `html.dark body` block in `src/app/globals.css`:

```css
.admin-login-input {
  color: var(--maglo-lime);
  caret-color: var(--maglo-lime);
}

.admin-login-input:-webkit-autofill,
.admin-login-input:-webkit-autofill:hover,
.admin-login-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--maglo-lime);
  -webkit-box-shadow: 0 0 0 1000px var(--maglo-canvas-dark) inset;
  caret-color: var(--maglo-lime);
}
```

- [ ] **Step 4: Apply the class to both login inputs**

In `src/app/admin/login/page.tsx`, change both input class strings from:

```tsx
className={`${inputCls} border-[#282541] bg-[#1c1a2e] text-white placeholder-slate-500 focus:border-[#c8ee44] focus:ring-[#c8ee44]/20`}
```

to:

```tsx
className={`${inputCls} admin-login-input border-[#282541] bg-[#1c1a2e] placeholder-slate-500 focus:border-[#c8ee44] focus:ring-[#c8ee44]/20`}
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
npm test -- tests/admin-login-style.test.ts
```

Expected: one test file passes with two passing tests.

- [ ] **Step 6: Run full verification**

Run:

```bash
npm test
npx eslint src/app/admin/login/page.tsx tests/admin-login-style.test.ts
npm run build
git diff --check
```

Expected: all tests pass, changed files have no ESLint errors, production build exits 0, and `git diff --check` reports no whitespace errors. If the repository-wide lint command is also run, report its existing unrelated errors separately rather than changing out-of-scope files.

- [ ] **Step 7: Commit the implementation**

```bash
git add src/app/admin/login/page.tsx src/app/globals.css tests/admin-login-style.test.ts
git commit -m "fix(admin): improve login input text contrast"
```
