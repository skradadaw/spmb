import { getKonten } from "@/lib/konten";
import ListEditor from "@/components/admin/ListEditor";
import KontakEditor from "@/components/admin/KontakEditor";

export const dynamic = "force-dynamic";

export default async function KontenPage() {
  const konten = await getKonten();

  return (
    <div className="space-y-6">
      {/* Page Banner Header */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Editor Konten Landing Page</h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Kelola teks, jadwal pendaftaran, syarat berkas, rincian biaya, FAQ, dan kontak panitia yang tampil secara live di situs publik.
        </p>
      </div>

      <div className="space-y-6">
        <ListEditor
          icon="📅"
          judul="Jadwal & Alur Pendaftaran"
          kontenKey="jadwal"
          fields={[
            { name: "tahapan", label: "Tahapan (mis. Pendaftaran Gelombang 1)" },
            { name: "tanggal", label: "Tanggal (mis. 1 Oktober – 31 Desember 2026)" },
          ]}
          awal={konten.jadwal as unknown as Record<string, string>[]}
        />
        <ListEditor
          icon="📋"
          judul="Syarat Pendaftaran"
          kontenKey="syarat"
          fields={[{ name: "teks", label: "Syarat Berkas" }]}
          awal={konten.syarat as unknown as Record<string, string>[]}
        />
        <ListEditor
          icon="💰"
          judul="Rincian Biaya SPMB"
          kontenKey="biaya"
          fields={[
            { name: "item", label: "Item Biaya" },
            { name: "jumlah", label: "Jumlah (mis. Rp 200.000)" },
          ]}
          awal={konten.biaya as unknown as Record<string, string>[]}
        />
        <ListEditor
          icon="❓"
          judul="FAQ (Pertanyaan Umum)"
          kontenKey="faq"
          fields={[
            { name: "tanya", label: "Pertanyaan" },
            { name: "jawab", label: "Jawaban", textarea: true },
          ]}
          awal={konten.faq as unknown as Record<string, string>[]}
        />
        <KontakEditor awal={konten.kontak} />
      </div>
    </div>
  );
}
