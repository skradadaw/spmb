import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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

describe("admin login", () => {
  it("uses a two-panel school identity and one Indonesian primary action", () => {
    const page = read("src/app/admin/login/page.tsx");
    const form = read("src/components/admin/LoginForm.tsx");
    expect(page).toContain("SD Plus 3 Al-Muhajirin");
    expect(page).toContain("Portal Penerimaan Siswa Baru");
    expect(page).toContain('src="/logo.webp"');
    expect(page).not.toContain("Jalur Pendaftaran Siswa");
    expect(page).toContain("rounded-[20px]");
    expect(page).not.toContain("rounded-[24px]");
    expect(form).toContain("Masuk ke Dasbor");
    expect(form).toContain("adminPrimaryButtonCls");
    expect(`${page}\n${form}`).not.toMatch(/Maglo|dark:|text-white placeholder/);
  });

  it("shows a clear notice when authentication is required", () => {
    expect(read("src/middleware.ts")).toContain('reason", "auth-required"');
    expect(read("src/app/admin/login/page.tsx")).toContain("Sesi Anda tidak aktif");
  });
});

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

  it("keeps the mobile drawer accessible and uses the admin display type", () => {
    const layout = read("src/app/admin/(dasbor)/layout.tsx");
    const sidebar = read("src/components/admin/AdminSidebar.tsx");
    const header = read("src/components/admin/AdminHeader.tsx");
    const icons = read("src/components/admin/AdminIcon.tsx");

    expect(layout).toContain("useRef");
    expect(layout).toContain("menuTriggerRef={menuTriggerRef}");
    expect(header).toContain("ref={menuTriggerRef}");
    expect(sidebar).toContain("closeButtonRef.current?.focus()");
    expect(sidebar).toContain('event.key === "Escape"');
    expect(sidebar).toContain('event.key !== "Tab"');
    expect(sidebar).toContain("focusableElements");
    expect(sidebar).toContain("menuTriggerRef.current?.focus()");
    expect(header).toContain('className="admin-display');
    expect(sidebar).toContain('className="admin-display');
    expect(sidebar).toContain('AdminIcon name="close"');
    expect(sidebar).toContain("min-h-11 min-w-11");
    expect(icons).toContain('"close"');
  });

  it("resets the mobile drawer at the desktop breakpoint and connects its trigger", () => {
    const layout = read("src/app/admin/(dasbor)/layout.tsx");
    const sidebar = read("src/components/admin/AdminSidebar.tsx");
    const header = read("src/components/admin/AdminHeader.tsx");

    expect(layout).toContain("mobileOpen={mobileOpen}");
    expect(header).toContain("mobileOpen: boolean");
    expect(header).toContain("aria-expanded={mobileOpen}");
    expect(header).toContain('aria-controls="admin-mobile-navigation"');
    expect(sidebar).toContain('id="admin-mobile-navigation"');
    expect(sidebar).toContain('window.matchMedia("(min-width: 768px)")');
    expect(sidebar).toContain("desktopMediaQuery.addEventListener");
    expect(sidebar).toContain("desktopMediaQuery.removeEventListener");
    expect(sidebar).toContain("setMobileOpen(false)");
  });
});

describe("admin dashboard", () => {
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
    expect(page).toContain("lg:grid-cols-3");
    expect(statCard).toContain("admin-display");
    expect(statCard).toContain("text-4xl");
    expect(statCard).toContain("sm:p-6");
    expect(source).not.toContain("EnrollmentJourney");
    expect(existsSync(resolve("src/components/admin/EnrollmentJourney.tsx"))).toBe(false);
    expect(source).not.toMatch(/Maglo|Wallet|Transaction|balance|spending|saved|Working Capital|Income|Expenses|VISA|\$\d/);
  });

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

  it("fails explicitly when dashboard queries fail and keeps table actions touch-friendly", () => {
    const page = read("src/app/admin/(dasbor)/page.tsx");

    expect(page).toContain("const countError = queryResults.find((result) => result.error)?.error;");
    expect(page).toContain("if (countError)");
    expect(page).toContain("if (waitingApplicantsResult.error)");
    expect(page).toContain('throw new Error("Gagal memuat data dasbor. Silakan coba lagi.");');
    expect(page).toMatch(/href="\/admin\/pendaftar\?verifikasi=menunggu"\s+className="inline-flex min-h-11/);
    expect(page).toMatch(/href=\{`\/admin\/pendaftar\/\$\{applicant\.id\}`\}\s+className="inline-flex min-h-11/);
  });
});

describe("admin applicant list", () => {
  it("uses the shared admin controls and meaningful responsive copy", () => {
    const source = read("src/app/admin/(dasbor)/pendaftar/page.tsx");
    for (const text of ["Pendaftar", "Cari nama atau nomor pendaftaran", "Terapkan Filter", "Hapus Filter", "Export Excel", "Lihat detail", "Tidak ada pendaftar yang sesuai"]) expect(source).toContain(text);
    expect(source).toContain("adminInputCls");
    expect(source).toContain("AdminBadge");
    expect(source).not.toMatch(/Maglo|dark:|📊|🔍|🔄|text-\[#c8ee44\]/);
  });

  it("keeps applicant status, export, and empty-state reset contracts explicit", () => {
    const source = read("src/app/admin/(dasbor)/pendaftar/page.tsx");

    for (const mapping of [
      'menunggu: "warning"',
      'terverifikasi: "success"',
      'perlu_perbaikan: "info"',
      'tidak_diterima: "danger"',
    ]) expect(source).toContain(mapping);
    for (const setter of [
      'paramExport.set("q", q);',
      'paramExport.set("verifikasi", verifikasi);',
      'paramExport.set("penerimaan", penerimaan);',
    ]) expect(source).toContain(setter);

    const emptyState = source.slice(source.indexOf("Tidak ada pendaftar yang sesuai"));
    expect(emptyState).toContain('href="/admin/pendaftar"');
  });

  it("uses the admin display type for the empty-state heading", () => {
    const source = read("src/app/admin/(dasbor)/pendaftar/page.tsx");
    expect(source).toMatch(/<h2 className="[^"]*admin-display[^"]*font-bold[^"]*">Tidak ada pendaftar yang sesuai<\/h2>/);
  });
});

describe("admin applicant detail", () => {
  it("uses the review workflow design system without emoji or dark-mode classes", () => {
    const page = read("src/app/admin/(dasbor)/pendaftar/[id]/page.tsx");
    const form = read("src/components/admin/StatusForm.tsx");
    const source = `${page}\n${form}`;

    for (const text of [
      "Data Calon Siswa",
      "Orang Tua dan Wali",
      "Dokumen Pendaftaran",
      "Keputusan Panitia",
      "Simpan perubahan",
      "sticky",
      "AdminBadge",
    ]) {
      expect(source).toContain(text);
    }

    expect(source).not.toMatch(/dark:|[\u{1F300}-\u{1FAFF}]/u);
  });
});

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

  it("guards each editor control and save lifecycle while content is saving", () => {
    const listEditor = read("src/components/admin/ListEditor.tsx");
    const kontakEditor = read("src/components/admin/KontakEditor.tsx");

    for (const source of [listEditor, kontakEditor]) {
      expect(source).toMatch(/try\s*\{[\s\S]*await simpanKonten[\s\S]*\}\s*catch\s*\{[\s\S]*\}\s*finally\s*\{[\s\S]*setMemuat\(false\)/);
    }

    expect(listEditor).toMatch(/<input(?:(?!\/>)[\s\S])*disabled=\{memuat\}/);
    expect(listEditor).toMatch(/<textarea(?:(?!\/>)[\s\S])*disabled=\{memuat\}/);
    expect(listEditor).toMatch(/<button(?:(?!<\/button>)[\s\S])*onClick=\{\(\) => hapus\(i\)\}(?:(?!<\/button>)[\s\S])*disabled=\{memuat\}/);
    expect(listEditor).toMatch(/<button(?:(?!<\/button>)[\s\S])*onClick=\{tambah\}(?:(?!<\/button>)[\s\S])*disabled=\{memuat\}/);

    expect(kontakEditor).toMatch(/<input(?:(?!\/>)[\s\S])*disabled=\{memuat\}/);
    expect(kontakEditor).toMatch(/<textarea(?:(?!\/>)[\s\S])*disabled=\{memuat\}/);
  });
});

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
