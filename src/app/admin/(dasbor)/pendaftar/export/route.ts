import ExcelJS from "exceljs";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  LABEL_PENERIMAAN,
  LABEL_VERIFIKASI,
  type StatusPenerimaan,
  type StatusVerifikasi,
} from "@/lib/status";
import type { Pendaftar } from "@/lib/types";

export async function GET(request: Request) {
  const auth = await createServerSupabase();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return new Response("Tidak diizinkan", { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const verifikasi = searchParams.get("verifikasi");
  const penerimaan = searchParams.get("penerimaan");

  const supabase = createAdminClient();
  let query = supabase.from("pendaftar").select("*").order("nomor_urut", { ascending: true });
  if (q) query = query.or(`nama_lengkap.ilike.%${q}%,nomor_pendaftaran.ilike.%${q}%`);
  if (verifikasi) query = query.eq("status_verifikasi", verifikasi);
  if (penerimaan) query = query.eq("status_penerimaan", penerimaan);
  const { data } = await query.returns<Pendaftar[]>();

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Pendaftar");
  ws.columns = [
    { header: "Nomor Pendaftaran", key: "nomor_pendaftaran", width: 18 },
    { header: "Nama Lengkap", key: "nama_lengkap", width: 25 },
    { header: "NIK", key: "nik", width: 20 },
    { header: "Tempat Lahir", key: "tempat_lahir", width: 15 },
    { header: "Tanggal Lahir", key: "tanggal_lahir", width: 14 },
    { header: "Jenis Kelamin", key: "jenis_kelamin", width: 13 },
    { header: "Alamat", key: "alamat", width: 35 },
    { header: "Asal TK/RA", key: "asal_tk", width: 18 },
    { header: "Nama Ayah", key: "nama_ayah", width: 22 },
    { header: "Pekerjaan Ayah", key: "pekerjaan_ayah", width: 18 },
    { header: "Pendidikan Ayah", key: "pendidikan_ayah", width: 15 },
    { header: "Nama Ibu", key: "nama_ibu", width: 22 },
    { header: "Pekerjaan Ibu", key: "pekerjaan_ibu", width: 18 },
    { header: "Pendidikan Ibu", key: "pendidikan_ibu", width: 15 },
    { header: "Nama Wali", key: "nama_wali", width: 22 },
    { header: "Pekerjaan Wali", key: "pekerjaan_wali", width: 18 },
    { header: "No. WhatsApp", key: "no_whatsapp", width: 15 },
    { header: "Status Verifikasi", key: "status_verifikasi", width: 18 },
    { header: "Status Penerimaan", key: "status_penerimaan", width: 18 },
    { header: "Catatan", key: "catatan_admin", width: 30 },
    { header: "Tanggal Daftar", key: "created_at", width: 20 },
  ];
  ws.getRow(1).font = { bold: true };

  for (const p of data ?? []) {
    ws.addRow({
      ...p,
      jenis_kelamin: p.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",
      asal_tk: p.asal_tk ?? "",
      nama_wali: p.nama_wali ?? "",
      pekerjaan_wali: p.pekerjaan_wali ?? "",
      status_verifikasi: LABEL_VERIFIKASI[p.status_verifikasi as StatusVerifikasi],
      status_penerimaan: LABEL_PENERIMAAN[p.status_penerimaan as StatusPenerimaan],
      catatan_admin: p.catatan_admin ?? "",
      created_at: new Date(p.created_at).toLocaleString("id-ID"),
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="pendaftar-spmb-2027-2028.xlsx"',
    },
  });
}
