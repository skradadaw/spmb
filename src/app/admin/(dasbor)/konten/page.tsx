import { getKonten } from "@/lib/konten";
import ListEditor from "@/components/admin/ListEditor";
import KontakEditor from "@/components/admin/KontakEditor";

export const dynamic = "force-dynamic";

export default async function KontenPage() {
  const konten = await getKonten();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-emerald-900">Konten Landing Page</h1>
      <ListEditor
        judul="Jadwal & Alur Pendaftaran"
        kontenKey="jadwal"
        fields={[
          { name: "tahapan", label: "Tahapan (mis. Pendaftaran Gelombang 1)" },
          { name: "tanggal", label: "Tanggal (mis. 1 Oktober – 31 Desember 2026)" },
        ]}
        awal={konten.jadwal as unknown as Record<string, string>[]}
      />
      <ListEditor
        judul="Syarat Pendaftaran"
        kontenKey="syarat"
        fields={[{ name: "teks", label: "Syarat" }]}
        awal={konten.syarat as unknown as Record<string, string>[]}
      />
      <ListEditor
        judul="Biaya"
        kontenKey="biaya"
        fields={[
          { name: "item", label: "Item biaya" },
          { name: "jumlah", label: "Jumlah (mis. Rp 200.000)" },
        ]}
        awal={konten.biaya as unknown as Record<string, string>[]}
      />
      <ListEditor
        judul="FAQ"
        kontenKey="faq"
        fields={[
          { name: "tanya", label: "Pertanyaan" },
          { name: "jawab", label: "Jawaban", textarea: true },
        ]}
        awal={konten.faq as unknown as Record<string, string>[]}
      />
      <KontakEditor awal={konten.kontak} />
    </div>
  );
}
