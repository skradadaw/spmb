import Link from "next/link";

export default function Header() {
  return (
    <header className="no-print sticky top-0 z-10 border-b border-emerald-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="text-sm font-bold leading-tight text-emerald-800 sm:text-base">
          SPMB SD Plus 3 Al-Muhajirin
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/cek-status" className="text-emerald-700 hover:underline">
            Cek Status
          </Link>
          <Link
            href="/daftar"
            className="rounded-lg bg-emerald-700 px-3 py-1.5 font-medium text-white hover:bg-emerald-800"
          >
            Daftar
          </Link>
        </nav>
      </div>
    </header>
  );
}
