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
