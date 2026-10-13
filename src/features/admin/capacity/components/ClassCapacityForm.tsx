'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ClassCapacity, ClassOption } from '@/features/registration/classCapacity';
import { saveClassCapacitiesAction, type SaveClassCapacitiesState } from '../actions/saveClassCapacitiesAction';

const initialState: SaveClassCapacitiesState = { status: 'idle', message: '' };

export function ClassCapacityForm({ capacities, total }: { capacities: ClassCapacity[]; total: number }) {
  const [state, formAction, pending] = useActionState(saveClassCapacitiesAction, initialState);
  const [values, setValues] = useState<Record<ClassOption, string>>(
    () => Object.fromEntries(capacities.map(({ pilihanKelas, kuota }) => [pilihanKelas, String(kuota)])) as Record<ClassOption, string>,
  );
  const sum = Object.values(values).reduce((acc, value) => acc + (Number(value) || 0), 0);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {capacities.map(({ pilihanKelas, terpakai }) => (
          <div key={pilihanKelas} className="space-y-1.5">
            <Label htmlFor={`kuota-${pilihanKelas}`} className="font-semibold">{pilihanKelas}</Label>
            <Input
              id={`kuota-${pilihanKelas}`}
              type="number"
              name={pilihanKelas}
              min={terpakai}
              step={1}
              required
              value={values[pilihanKelas]}
              onChange={(event) => setValues((current) => ({ ...current, [pilihanKelas]: event.target.value }))}
            />
            <span className="block text-xs text-[var(--admin-muted)]">{terpakai} kursi terpakai</span>
          </div>
        ))}
      </div>
      <p className={sum === total ? 'text-sm text-[var(--admin-muted)]' : 'text-sm font-semibold text-rose-700'}>
        Jumlah: {sum} dari {total} kursi
      </p>
      {state.message && (
        <p aria-live="polite" className={state.status === 'success' ? 'text-sm font-semibold text-emerald-700' : 'text-sm font-semibold text-rose-700'}>
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending || sum !== total}>{pending ? 'Menyimpan...' : 'Simpan kuota'}</Button>
    </form>
  );
}
