import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { LABEL_DOKUMEN } from "@/lib/files";
import type { Dokumen, Pendaftar } from "@/lib/types";
import StatusForm from "@/components/admin/StatusForm";

export const dynamic = "force-dynamic";

export default async function DetailPendaftar({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: pendaftar } = await supabase
    .from("pendaftar")
    .select("*")
    .eq("id", id)
    .maybeSingle<Pendaftar>();
  if (!pendaftar) notFound();

  const { data: dokumen } = await supabase
    .from("dokumen")
    .select("*")
    .eq("pendaftar_id", id)
    .returns<Dokumen[]>();

  // signed URL berumur pendek untuk preview dokumen
  const dokumenDenganUrl = await Promise.all(
    (dokumen ?? []).map(async (d) => {
      const { data } = await supabase.storage
        .from("dokumen")
        .createSignedUrl(d.path_storage, 300);
      return { ...d, url: data?.signedUrl ?? null };
    })
  );

  const baris: [string, string][] = [
    ["Nomor Pendaftaran", pendaftar.nomor_pendaftaran],
    ["Nama Lengkap", pendaftar.nama_lengkap],
    ["NIK", pendaftar.nik],
    ["Tempat, Tanggal Lahir", `${pendaftar.tempat_lahir}, ${pendaftar.tanggal_lahir}`],
    ["Jenis Kelamin", pendaftar.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"],
    ["Alamat", pendaftar.alamat],
    ["Asal TK/RA", pendaftar.asal_tk ?? "-"],
    ["Ayah", `${pendaftar.nama_ayah} — ${pendaftar.pekerjaan_ayah} (${pendaftar.pendidikan_ayah})`],
    ["Ibu", `${pendaftar.nama_ibu} — ${pendaftar.pekerjaan_ibu} (${pendaftar.pendidikan_ibu})`],
    ["Wali", pendaftar.nama_wali ? `${pendaftar.nama_wali} — ${pendaftar.pekerjaan_wali ?? "-"}` : "-"],
    ["No. WhatsApp", pendaftar.no_whatsapp],
    ["Tanggal Daftar", new Date(pendaftar.created_at).toLocaleString("id-ID")],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-emerald-900">
        {pendaftar.nama_lengkap}{" "}
        <span className="font-mono text-sm text-gray-500">{pendaftar.nomor_pendaftaran}</span>
      </h1>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold text-emerald-900">Data Pendaftar</h2>
        <table className="w-full text-sm">
          <tbody>
            {baris.map(([label, nilai]) => (
              <tr key={label} className="border-b border-gray-100 last:border-b-0">
                <td className="w-40 py-2 pr-3 align-top text-gray-500">{label}</td>
                <td className="py-2 font-medium">{nilai}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold text-emerald-900">Dokumen</h2>
        <ul className="space-y-2">
          {dokumenDenganUrl.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 text-sm">
              <span>{LABEL_DOKUMEN[d.jenis]}</span>
              {d.url ? (
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  Lihat
                </a>
              ) : (
                <span className="text-red-600">Gagal memuat</span>
              )}
            </li>
          ))}
          {dokumenDenganUrl.length === 0 && (
            <li className="text-gray-500">Tidak ada dokumen.</li>
          )}
        </ul>
      </div>

      <StatusForm
        id={pendaftar.id}
        status_verifikasi={pendaftar.status_verifikasi}
        status_penerimaan={pendaftar.status_penerimaan}
        catatan_admin={pendaftar.catatan_admin ?? ""}
      />
    </div>
  );
}
