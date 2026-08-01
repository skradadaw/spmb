import Link from "next/link";
import AdminIcon from "./AdminIcon";
import { adminCardCls } from "./styles";

const actions = [
  {
    href: "/admin/pendaftar",
    label: "Lihat Pendaftar",
    description: "Tinjau data dan status calon siswa.",
    icon: "users" as const,
  },
  {
    href: "/admin/pendaftar/export",
    label: "Export Excel",
    description: "Unduh rekap data pendaftaran.",
    icon: "download" as const,
  },
  {
    href: "/admin/konten",
    label: "Kelola Konten",
    description: "Perbarui informasi di situs publik.",
    icon: "content" as const,
  },
];

export function AdminQuickActions() {
  return (
    <section className={`${adminCardCls} p-5`} aria-labelledby="aksi-cepat-title">
      <h2 id="aksi-cepat-title" className="admin-display text-lg text-[#101820]">Aksi cepat</h2>
      <nav className="mt-4 space-y-2" aria-label="Aksi cepat dasbor">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex min-h-16 items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#F6F7F5] focus:outline-none focus:ring-4 focus:ring-[#00AA13]/15"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9F8EB] text-[#00880F]">
              <AdminIcon name={action.icon} className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[#101820]">{action.label}</span>
              <span className="mt-0.5 block text-xs text-[#667085]">{action.description}</span>
            </span>
            <AdminIcon name="arrow-right" className="h-4 w-4 shrink-0 text-[#667085] transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </nav>
    </section>
  );
}
