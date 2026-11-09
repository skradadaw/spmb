'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ADMIN_DANGER_BUTTON, ADMIN_FIELD, ADMIN_LABEL, ADMIN_PRIMARY_BUTTON, ADMIN_SECONDARY_BUTTON } from '@/features/admin/components/adminStyles';
import { cn } from '@/lib/utils';
import { createRuangOkbAction, deleteRuangOkbAction, renameRuangOkbAction, type RuangOkbActionResult } from '../actions/ruangOkbActions';
import type { RuangOkbUsage } from '../ruangOkb';

const idle: RuangOkbActionResult = { status: 'idle', message: '' };

/** Daftar Ruang OKB di Pengaturan: tambah, ganti nama, dan hapus. Batas panjang nama diperiksa server setelah dinormalkan. */
export function RuangOkbManager({ rooms }: { rooms: readonly RuangOkbUsage[] }) {
  const [result, setResult] = useState(idle);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<{ id: string; nama: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<RuangOkbActionResult>, onSuccess?: () => void) {
    startTransition(async () => {
      const next = await action();
      setResult(next);
      if (next.status === 'success') onSuccess?.();
    });
  }

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(() => createRuangOkbAction(newName), () => setNewName(''));
  }

  function rename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const { id, nama } = editing;
    run(() => renameRuangOkbAction(id, nama), () => setEditing(null));
  }

  return (
    <div className="max-w-2xl space-y-4">
      <form onSubmit={add} className="space-y-2 rounded-xl border border-slate-200 bg-[var(--admin-surface)] p-3">
        <Label htmlFor="ruang-okb-baru" className={ADMIN_LABEL}>Nama ruangan baru</Label>
        <div className="flex gap-2">
          <Input id="ruang-okb-baru" value={newName} onChange={event => setNewName(event.target.value)} autoComplete="off" placeholder="Mis. Kelas 1A" className={ADMIN_FIELD} />
          <Button type="submit" disabled={pending || !newName.trim()} className={cn(ADMIN_PRIMARY_BUTTON, 'h-9')}>Tambah</Button>
        </div>
      </form>

      {result.message && (
        <p aria-live="polite" className={cn('text-xs font-semibold', result.status === 'success' ? 'text-emerald-700' : 'text-rose-700')}>{result.message}</p>
      )}

      {rooms.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--admin-border)] px-4 py-6 text-center text-sm text-slate-500">Belum ada ruangan. Tambahkan ruangan pertama di atas.</p>
      ) : (
        <ul aria-label="Daftar Ruang OKB" className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-[var(--admin-surface)]">
          {rooms.map(room => (
            <li key={room.id} className="px-3 py-2.5">
              {editing?.id === room.id ? (
                <form onSubmit={rename} className="flex flex-wrap items-center gap-2">
                  <Input aria-label={`Nama baru ${room.nama}`} value={editing.nama} onChange={event => setEditing({ id: room.id, nama: event.target.value })} autoComplete="off" autoFocus className={cn(ADMIN_FIELD, 'min-w-0 flex-1')} />
                  <Button type="button" onClick={() => setEditing(null)} disabled={pending} className={ADMIN_SECONDARY_BUTTON}>Batal</Button>
                  <Button type="submit" disabled={pending || !editing.nama.trim()} className={ADMIN_PRIMARY_BUTTON}>Simpan</Button>
                </form>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 break-words text-sm font-medium text-slate-900">{room.nama}</span>
                  <span className="text-xs text-[var(--admin-muted)]">{room.dipakai > 0 ? `${room.dipakai} Pendaftar` : 'Belum dipakai'}</span>
                  <Button type="button" aria-label={`Ganti nama ${room.nama}`} onClick={() => setEditing({ id: room.id, nama: room.nama })} disabled={pending} className={ADMIN_SECONDARY_BUTTON}>Ganti nama</Button>
                  <Button type="button" aria-label={`Hapus ${room.nama}`} onClick={() => run(() => deleteRuangOkbAction(room.id))} disabled={pending} className={ADMIN_DANGER_BUTTON}>Hapus</Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
