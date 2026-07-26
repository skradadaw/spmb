import Link from "next/link";
import { logout } from "@/app/admin/login/actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-6">
      <nav className="no-print mb-6 flex flex-wrap items-center gap-2 rounded-xl bg-white p-2 shadow-sm">
        <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-emerald-50">
          Dasbor
        </Link>
        <Link href="/admin/pendaftar" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-emerald-50">
          Pendaftar
        </Link>
        <Link href="/admin/konten" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-emerald-50">
          Konten
        </Link>
        <form action={logout} className="ml-auto">
          <button className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            Keluar
          </button>
        </form>
      </nav>
      {children}
    </div>
  );
}
