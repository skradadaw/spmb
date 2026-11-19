import { parseRuangOkbExportSelection, ruangOkbExportFilename, ruangOkbExportSheet } from '@/features/admin/nameTag/ruangOkbExport';
import { fetchRuangOkbExportRows } from '@/features/admin/nameTag/server/nameTagRepository';
import { getAdminSession } from '@/features/auth/session';
import { getSupabaseAdmin } from '@/features/registration/server/supabaseAdmin';
import { buildXlsx } from '@/lib/xlsx';

const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };

/** Excel pembagian Ruang OKB untuk satu kelompok (tanggal + Gelombang OKB): hanya Pendaftar yang sudah punya ruangan. */
export async function GET(request: Request) {
  if (!await getAdminSession()) return Response.json({ error: 'Sesi admin diperlukan.' }, { status: 401, headers: PRIVATE_HEADERS });
  const selection = parseRuangOkbExportSelection(new URL(request.url).searchParams);
  if (!selection) return Response.json({ error: 'Kelompok OKB tidak dikenal.' }, { status: 400, headers: PRIVATE_HEADERS });
  try {
    const rows = await fetchRuangOkbExportRows(getSupabaseAdmin(), selection);
    return new Response(buildXlsx(ruangOkbExportSheet(rows, selection)), {
      status: 200,
      headers: { ...PRIVATE_HEADERS, 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="${ruangOkbExportFilename(selection)}"` },
    });
  } catch {
    return Response.json({ error: 'Pembagian Ruang OKB belum dapat diekspor.' }, { status: 500, headers: PRIVATE_HEADERS });
  }
}
