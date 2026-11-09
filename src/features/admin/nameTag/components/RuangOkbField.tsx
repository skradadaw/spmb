'use client';

import Link from 'next/link';
import { FormSelect } from '@/features/admin/components/FormSelect';
import { ruangOkbKey, type RuangOkb } from '@/features/admin/ruangOkb/ruangOkb';
import { cn } from '@/lib/utils';
import type { SaveRuangOkbResult } from '../actions/saveRuangOkbAction';

export const initialRuangOkbResult: SaveRuangOkbResult = { status: 'idle', message: '', updated: 0 };

/** Id ruangan di daftar yang namanya sama dengan Ruang OKB tersimpan; nama ruangan unik, jadi cukup dicocokkan. */
export function ruangOkbIdFor(rooms: readonly RuangOkb[], ruangOkb: string | null) {
  if (!ruangOkb) return '';
  const key = ruangOkbKey(ruangOkb);
  return rooms.find(room => ruangOkbKey(room.nama) === key)?.id ?? '';
}

/** Ruang OKB dipilih dari daftar ruangan di Pengaturan, dalam urutan yang diberikan. */
function RuangOkbSelect({ id, rooms, value, onChange }: { id: string; rooms: readonly RuangOkb[]; value: string; onChange: (value: string) => void }) {
  return <FormSelect id={id} name="ruangOkbId" value={value} onChange={onChange} placeholder="Pilih ruangan" options={rooms.map(room => ({ value: room.id, label: room.nama }))} className="h-9" />;
}

/** Pilihan ruangan, atau keterangan bila daftarnya kosong (`[]`) atau gagal dimuat (`null`). */
export function RuangOkbChoice({ id, rooms, value, onChange }: { id: string; rooms: readonly RuangOkb[] | null; value: string; onChange: (value: string) => void }) {
  if (!rooms) return <p className="text-xs font-semibold text-rose-700">Daftar Ruang OKB belum dapat dimuat. Muat ulang halaman.</p>;
  if (rooms.length === 0) return <EmptyRuangOkbList />;
  return <RuangOkbSelect id={id} rooms={rooms} value={value} onChange={onChange} />;
}

function EmptyRuangOkbList() {
  return (
    <p className="text-xs text-[var(--admin-muted)]">
      Belum ada ruangan. Tambahkan di <Link href="/admin/pengaturan/ruang-okb" className="font-semibold text-[var(--admin-sidebar)] hover:underline">Pengaturan</Link>.
    </p>
  );
}

export function RuangOkbResultMessage({ result }: { result: SaveRuangOkbResult }) {
  if (!result.message) return null;
  return (
    <p aria-live="polite" className={cn('text-xs font-semibold', result.status === 'success' ? 'text-emerald-700' : 'text-rose-700')}>
      {result.message}
    </p>
  );
}
