import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const loginForm = readFileSync(resolve("src/components/admin/LoginForm.tsx"), "utf8");
const globalCss = readFileSync(resolve("src/app/globals.css"), "utf8");

describe("admin login input styling", () => {
  it("menandai formulir untuk cakupan autofill tanpa class input lama", () => {
    const loginInputs = loginForm.match(/<input[\s\S]*?\/>/g) ?? [];

    expect(loginInputs).toHaveLength(2);
    for (const input of loginInputs) {
      expect(input).not.toContain("text-white");
      expect(input).not.toContain("admin-login-input");
    }
    expect(loginForm.match(/admin-login-form/g)).toHaveLength(1);
  });

  it("memberi warna ink dan lapisan putih pada autofill", () => {
    expect(globalCss).toMatch(
      /\.admin-login-form input:-webkit-autofill,[\s\S]*?\.admin-login-form input:-webkit-autofill:hover\s*\{[\s\S]*?-webkit-text-fill-color:\s*#101820;[\s\S]*?-webkit-box-shadow:\s*0 0 0 1000px #FFFFFF inset;[\s\S]*?caret-color:\s*#101820;[\s\S]*?\}/,
    );
  });

  it("mempertahankan indikator fokus hijau pada autofill yang terfokus", () => {
    expect(globalCss).toMatch(
      /\.admin-login-form input:-webkit-autofill:focus\s*\{[\s\S]*?-webkit-box-shadow:\s*0 0 0 1000px #FFFFFF inset,\s*0 0 0 4px rgb\(0 170 19 \/ 0\.15\);[\s\S]*?\}/,
    );
  });
});
