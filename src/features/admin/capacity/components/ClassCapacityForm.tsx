'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { totalCapacity, totalUsedSeats, type ClassCapacity } from '@/features/registration/classCapacity';
import { saveClassCapacitiesAction, type SaveClassCapacitiesState } from '../actions/saveClassCapacitiesAction';

const initialState: SaveClassCapacitiesState = { status: 'idle', message: '' };

export function ClassCapacityForm({ capacities }: { capacities: ClassCapacity[]; total?: number }) {
  const [state, formAction, pending] = useActionState(saveClassCapacitiesAction, initialState);
  const currentTotal = totalCapacity(capacities);
  const used = totalUsedSeats(capacities);
  const [value, setValue] = useState(String(currentTotal));

  const numValue = Number(value);
  const isValid = Number.isSafeInteger(numValue) && numValue >= used && numValue > 0;

  return (
    <form action={formAction} className="space-y-5">
      <div className="max-w-sm space-y-2">
        <Label htmlFor="kapasitasTotal" className="text-sm font-semibold">
          Kapasitas Total Siswa Baru
        </Label>
        <Input
          id="kapasitasTotal"
          type="number"
          name="kapasitasTotal"
          min={Math.max(1, used)}
          step={1}
          required
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="text-xs text-[var(--admin-muted)]">
          Saat ini <strong>{used}</strong> kursi sedang terpakai (pendaftar berproses &amp; diterima).
        </p>
      </div>

      {state.message && (
        <p
          aria-live="polite"
          className={state.status === 'success' ? 'text-sm font-semibold text-emerald-700' : 'text-sm font-semibold text-rose-700'}
        >
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending || !isValid}>
        {pending ? 'Menyimpan...' : 'Simpan kapasitas'}
      </Button>
    </form>
  );
}
