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
