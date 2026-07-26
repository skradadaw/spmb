import Link from "next/link";
import { getKonten } from "@/lib/konten";

export const dynamic = "force-dynamic";

export default async function Home() {
  const konten = await getKonten();

  return (
    <div className="py-8">
      {/* Hero */}
      <section className="rounded-2xl bg-emerald-700 px-5 py-10 text-center text-white sm:py-14">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-200">
          Penerimaan Murid Baru
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-4xl">SD Plus 3 Al-Muhajirin</h1>
        <p className="mt-1 text-lg text-emerald-100">Tahun Ajaran 2027/2028</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/daftar"
            className="w-full rounded-xl bg-white px-6 py-3 text-base font-semibold text-emerald-800 hover:bg-emerald-50 sm:w-auto"
          >
            Daftar Sekarang
          </Link>
          <Link
            href="/cek-status"
            className="w-full rounded-xl border border-emerald-300 px-6 py-3 text-base font-medium text-white hover:bg-emerald-600 sm:w-auto"
          >
            Cek Status Pendaftaran
          </Link>
        </div>
      </section>

      {/* Jadwal & Alur */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-emerald-900">Jadwal & Alur Pendaftaran</h2>
        <ol className="mt-4 space-y-3">
          {konten.jadwal.map((j, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-medium">{j.tahapan}</p>
                <p className="text-sm text-gray-600">{j.tanggal}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Syarat */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-emerald-900">Syarat Pendaftaran</h2>
        <ul className="mt-4 space-y-2">
          {konten.syarat.map((s, i) => (
            <li key={i} className="flex items-start gap-2 rounded-xl bg-white p-4 shadow-sm">
              <span className="text-emerald-700">✓</span>
              <span>{s.teks}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Biaya */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-emerald-900">Biaya</h2>
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
          {konten.biaya.map((b, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 border-b border-gray-100 p-4 last:border-b-0"
            >
              <span>{b.item}</span>
              <span className="font-semibold text-emerald-800">{b.jumlah}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-emerald-900">Pertanyaan yang Sering Diajukan</h2>
        <div className="mt-4 space-y-3">
          {konten.faq.map((f, i) => (
            <details key={i} className="rounded-xl bg-white p-4 shadow-sm">
              <summary className="cursor-pointer font-medium">{f.tanya}</summary>
              <p className="mt-2 text-gray-700">{f.jawab}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Kontak */}
      <section className="mt-10 rounded-2xl bg-emerald-50 p-5">
        <h2 className="text-xl font-bold text-emerald-900">Kontak Panitia</h2>
        <div className="mt-3 space-y-1 text-gray-800">
          {konten.kontak.whatsapp && (
            <p>
              WhatsApp:{" "}
              <a
                href={`https://wa.me/62${konten.kontak.whatsapp.replace(/^0/, "")}`}
                className="font-medium text-emerald-700 underline"
              >
                {konten.kontak.whatsapp}
              </a>
            </p>
          )}
          {konten.kontak.telepon && <p>Telepon: {konten.kontak.telepon}</p>}
          {konten.kontak.alamat && <p>Alamat: {konten.kontak.alamat}</p>}
        </div>
      </section>
    </div>
  );
}
