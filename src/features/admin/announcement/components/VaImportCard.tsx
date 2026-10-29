'use client';

import { useActionState, useState } from 'react';
import { FileSpreadsheet, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ADMIN_PRIMARY_BUTTON, ADMIN_SECONDARY_BUTTON } from '@/features/admin/components/adminStyles';
import { commitVaImportAction, previewVaImportAction, type VaImportPreviewState } from '../actions/vaImportActions';
import type { VaImportReport } from '../vaImport';

const initialState: VaImportPreviewState = { status: 'idle', message: '' };

/** Impor Nomor VA massal: baca file, periksa laporan per baris, lalu simpan baris yang siap. */
export function VaImportCard() {
  const [preview, previewAction, reading] = useActionState(previewVaImportAction, initialState);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ report: VaImportReport; message: string; ok: boolean } | null>(null);
  const report = preview.report;
  // Hasil simpan hanya berlaku untuk laporan yang sama; membaca file baru menghapusnya.
  const commitMessage = saved && saved.report === report ? saved : null;

  async function save() {
    if (!report) return;
    setSaving(true);
    const result = await commitVaImportAction(report.toSave).catch(() => ({ success: false as const, error: 'Nomor VA tidak dapat disimpan. Tidak ada perubahan yang tersimpan.' }));
    setSaving(false);
    setSaved({ report, ok: result.success, message: result.success ? `${result.saved} Nomor VA tersimpan.` : result.error });
  }

  return (
    <Card className="rounded-2xl border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-base">Impor Nomor VA</CardTitle>
        <p className="text-xs leading-5 text-[var(--admin-muted)]">
          File Excel (.xlsx) atau CSV berkolom <span className="font-semibold">Nomor Pendaftaran</span> dan <span className="font-semibold">Nomor VA</span>.
          Di Excel, format kolom Nomor VA sebagai Teks agar 16 digitnya utuh.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5 pt-0">
        <form action={previewAction} className="flex flex-wrap items-center gap-2">
          <input
            name="file"
            type="file"
            required
            accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            aria-label="File impor Nomor VA"
            className="max-w-full text-xs file:mr-3 file:rounded-lg file:border file:border-slate-200 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold"
          />
          <Button type="submit" disabled={reading || saving} className={ADMIN_SECONDARY_BUTTON}>
            {reading ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <FileSpreadsheet aria-hidden="true" className="size-3.5" />}
            {reading ? 'Membaca...' : 'Baca file'}
          </Button>
        </form>

        {preview.message && (
          <p aria-live="polite" className={cn('text-xs font-semibold', preview.status === 'error' ? 'text-rose-700' : 'text-slate-800')}>{preview.message}</p>
        )}

        {report && (
          <div className="space-y-3">
            {report.groups.map(group => (
              <details key={group.key} data-import-group={group.key} open={group.key === 'cocok' || group.rows.length <= 5} className="rounded-xl border border-[var(--admin-border)]">
                <summary className={cn('cursor-pointer px-3 py-2 text-xs font-semibold', group.key === 'cocok' ? 'text-emerald-800' : group.key === 'tidak-berubah' ? 'text-slate-600' : 'text-amber-800')}>
                  {group.label} ({group.rows.length})
                </summary>
                <ul className="divide-y divide-[var(--admin-border)] border-t border-[var(--admin-border)] text-xs">
                  {group.rows.map(row => (
                    <li key={`${row.line}-${row.nomorPendaftaran}`} className="flex flex-wrap gap-x-3 gap-y-0.5 px-3 py-1.5">
                      <span className="text-[var(--admin-muted)]">Baris {row.line}</span>
                      <span className="font-mono">{row.nomorPendaftaran || '-'}</span>
                      {row.namaLengkap && <span>{row.namaLengkap}</span>}
                      <span className="font-mono">{row.nomorVa || '-'}</span>
                      {row.note && <span className="w-full text-[var(--admin-muted)]">{row.note}</span>}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
            {report.toSave.length > 0 && !commitMessage?.ok && (
              <Button type="button" onClick={save} disabled={saving} className={ADMIN_PRIMARY_BUTTON}>
                {saving ? <Loader2 aria-hidden="true" className="size-3.5 animate-spin" /> : <Save aria-hidden="true" className="size-3.5" />}
                Simpan {report.toSave.length} Nomor VA
              </Button>
            )}
            {commitMessage && (
              <p aria-live="polite" className={cn('text-xs font-semibold', commitMessage.ok ? 'text-emerald-700' : 'text-rose-700')}>{commitMessage.message}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
