import { getKonten } from "@/lib/konten";
import { AdminCard } from "@/components/admin/AdminUI";
import ListEditor from "@/components/admin/ListEditor";
import KontakEditor from "@/components/admin/KontakEditor";

export const dynamic = "force-dynamic";

export default async function KontenPage() {
  const konten = await getKonten();

  return (
    <div className="space-y-6">
      <AdminCard className="p-5 sm:p-6">
        <h1 className="admin-display text-2xl font-bold text-[#101820] sm:text-3xl">Kelola Konten</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#667085]">
          Perbarui informasi yang tampil di halaman utama untuk calon siswa dan wali.
        </p>
      </AdminCard>

      <div className="space-y-6">
        <ListEditor
          icon="clock"
          judul="Jadwal & Alur Pendaftaran"
          kontenKey="jadwal"
          fields={[
            { name: "tahapan", label: "Tahapan (mis. Pendaftaran Gelombang 1)" },
            { name: "tanggal", label: "Tanggal (mis. 1 Oktober – 31 Desember 2026)" },
          ]}
          awal={konten.jadwal as unknown as Record<string, string>[]}
        />
        <ListEditor
          icon="file"
          judul="Syarat Pendaftaran"
          kontenKey="syarat"
          fields={[{ name: "teks", label: "Syarat Berkas" }]}
          awal={konten.syarat as unknown as Record<string, string>[]}
        />
        <ListEditor
          icon="content"
          judul="Rincian Biaya SPMB"
          kontenKey="biaya"
          fields={[
            { name: "item", label: "Item Biaya" },
            { name: "jumlah", label: "Jumlah (mis. Rp 200.000)" },
          ]}
          awal={konten.biaya as unknown as Record<string, string>[]}
        />
        <ListEditor
          icon="warning"
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
