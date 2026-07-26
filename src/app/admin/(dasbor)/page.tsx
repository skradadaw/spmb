import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const supabase = createAdminClient();
  const hitung = (filter?: { kolom: string; nilai: string }) => {
    let q = supabase.from("pendaftar").select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter.kolom, filter.nilai);
    return q;
  };
  const [total, belumVerifikasi, diterima] = await Promise.all([
    hitung(),
    hitung({ kolom: "status_verifikasi", nilai: "menunggu" }),
    hitung({ kolom: "status_penerimaan", nilai: "diterima" }),
  ]);

  const kartu = [
    { label: "Total Pendaftar", nilai: total.count ?? 0 },
    { label: "Menunggu Verifikasi", nilai: belumVerifikasi.count ?? 0 },
    { label: "Diterima", nilai: diterima.count ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-emerald-900">Dasbor SPMB 2027/2028</h1>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kartu.map((k) => (
          <div key={k.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{k.label}</p>
            <p className="mt-1 text-3xl font-bold text-emerald-800">{k.nilai}</p>
          </div>
        ))}
      </div>
      <Link
        href="/admin/pendaftar"
        className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
      >
        Kelola Pendaftar
      </Link>
    </div>
  );
}
