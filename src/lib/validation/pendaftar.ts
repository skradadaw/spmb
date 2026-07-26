import { z } from "zod";

const wajib = (label: string, min = 2) =>
  z.string().trim().min(min, `${label} wajib diisi`);

const opsional = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""));

export const siswaSchema = z.object({
  nama_lengkap: wajib("Nama lengkap", 3),
  nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit angka"),
  tempat_lahir: wajib("Tempat lahir"),
  tanggal_lahir: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal lahir wajib diisi")
    .refine((v) => {
      const t = Date.parse(v);
      return !Number.isNaN(t) && t < Date.now();
    }, "Tanggal lahir tidak valid"),
  jenis_kelamin: z.enum(["L", "P"], { message: "Pilih jenis kelamin" }),
  alamat: wajib("Alamat", 10),
  asal_tk: opsional,
});

export const ortuSchema = z.object({
  nama_ayah: wajib("Nama ayah", 3),
  pekerjaan_ayah: wajib("Pekerjaan ayah"),
  pendidikan_ayah: wajib("Pendidikan ayah"),
  nama_ibu: wajib("Nama ibu", 3),
  pekerjaan_ibu: wajib("Pekerjaan ibu"),
  pendidikan_ibu: wajib("Pendidikan ibu"),
  nama_wali: opsional,
  pekerjaan_wali: opsional,
  no_whatsapp: z
    .string()
    .regex(/^08\d{8,11}$/, "Nomor WhatsApp tidak valid (contoh: 081234567890)"),
});

export const pendaftarSchema = siswaSchema.merge(ortuSchema);

export type DataSiswa = z.infer<typeof siswaSchema>;
export type DataOrtu = z.infer<typeof ortuSchema>;
export type DataPendaftar = z.infer<typeof pendaftarSchema>;

/** Ubah error Zod menjadi peta { namaField: pesan } untuk ditampilkan di form. */
export function petaError(error: z.ZodError): Record<string, string> {
  const peta: Record<string, string> = {};
  for (const issue of error.issues) {
    const k = String(issue.path[0] ?? "");
    if (k && !peta[k]) peta[k] = issue.message;
  }
  return peta;
}
