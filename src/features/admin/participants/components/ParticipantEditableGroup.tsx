'use client';

import { useActionState, useEffect, useState, type ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormSelect } from '@/features/admin/components/FormSelect';
import { ADMIN_FIELD, ADMIN_LABEL, ADMIN_PRIMARY_BUTTON, ADMIN_SECONDARY_BUTTON } from '@/features/admin/components/adminStyles';
import { useWilayahIndonesia, type Region } from '@/hooks/useWilayahIndonesia';
import { cn } from '@/lib/utils';
import { updateParticipantDataAction, type UpdateParticipantDataState } from '../actions/updateParticipantDataAction';
import { EDIT_FIELDS, REGION_KEYS, type EditField, type EditGroup, type EditValues, type FormKey } from '../editing';
import { ParticipantFieldGroup, type ParticipantFieldGroupProps } from './ParticipantFieldGroup';

const initialState: UpdateParticipantDataState = { status: 'idle', message: '' };

type Props = Omit<ParticipantFieldGroupProps, 'name' | 'action' | 'children'> & {
  name: EditGroup;
  participantId: string;
  formValues: Record<string, string>;
};

export function ParticipantEditableGroup({ participantId, formValues, ...groupProps }: Props) {
  const [editing, setEditing] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  return (
    <ParticipantFieldGroup
      {...groupProps}
      action={editing ? null : (
        <div className="flex items-center gap-2">
          {savedNotice && <span role="status" className="text-xs font-medium text-emerald-700">Tersimpan</span>}
          <Button type="button" variant="ghost" size="sm" onClick={() => { setSavedNotice(false); setEditing(true); }} aria-label={`Edit ${groupProps.title}`} className="h-7 gap-1 px-2 text-xs">
            <Pencil aria-hidden="true" className="size-3" />Edit
          </Button>
        </div>
      )}
    >
      {editing ? (
        <GroupEditForm
          group={groupProps.name}
          participantId={participantId}
          initialValues={formValues}
          onCancel={() => setEditing(false)}
          onSaved={() => { setEditing(false); setSavedNotice(true); }}
        />
      ) : undefined}
    </ParticipantFieldGroup>
  );
}

function GroupEditForm({ group, participantId, initialValues, onCancel, onSaved }: {
  group: EditGroup;
  participantId: string;
  initialValues: Record<string, string>;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateParticipantDataAction, initialState);
  const [values, setValues] = useState<EditValues>(initialValues);
  const setValue = (key: FormKey, value: string) => setValues((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (state.status === 'success') onSaved();
  }, [state, onSaved]);

  const visibleFields = EDIT_FIELDS[group].filter((field) => !field.showIf || field.showIf(values));

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/30 p-3">
      <input type="hidden" name="participantId" value={participantId} />
      <input type="hidden" name="group" value={group} />
      <div className="grid gap-3 sm:grid-cols-2">
        {visibleFields.map((field) => (
          <FieldControl key={field.key} field={field} value={values[field.key] ?? ''} error={state.fieldErrors?.[field.key]} onChange={(value) => setValue(field.key, value)} />
        ))}
        {group === 'address' && <RegionSelects values={values} setValue={setValue} errors={state.fieldErrors} />}
      </div>
      {state.status === 'error' && <p role="alert" className="text-sm font-semibold text-rose-700">{state.message}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" onClick={onCancel} disabled={pending} className={ADMIN_SECONDARY_BUTTON}>Batal</Button>
        <Button type="submit" disabled={pending} className={ADMIN_PRIMARY_BUTTON}>{pending ? 'Menyimpan...' : 'Simpan'}</Button>
      </div>
    </form>
  );
}

function FieldShell({ id, label, error, wide, children }: { id: string; label: string; error?: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={cn('space-y-1.5', wide && 'sm:col-span-2')}>
      <Label htmlFor={id} className={ADMIN_LABEL}>{label}</Label>
      {children}
      {error && <p className="text-xs text-rose-700">{error}</p>}
    </div>
  );
}

function FieldControl({ field, value, error, onChange }: { field: EditField; value: string; error?: string; onChange: (value: string) => void }) {
  const id = `edit-${field.key}`;
  const invalid = error ? 'border-rose-400' : undefined;
  if (field.type === 'select') {
    return (
      <FieldShell id={id} label={field.label} error={error}>
        <FormSelect id={id} name={field.key} value={value} options={field.options ?? []} invalid={Boolean(error)} onChange={onChange} className={ADMIN_FIELD} />
      </FieldShell>
    );
  }
  if (field.type === 'textarea') {
    return (
      <FieldShell id={id} label={field.label} error={error} wide>
        <Textarea id={id} name={field.key} value={value} maxLength={field.maxLength} rows={2} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} className={cn('bg-white', invalid)} />
      </FieldShell>
    );
  }
  return (
    <FieldShell id={id} label={field.label} error={error}>
      <Input
        id={id}
        name={field.key}
        type={field.type === 'date' ? 'date' : 'text'}
        inputMode={field.type === 'digits' ? 'numeric' : undefined}
        value={value}
        maxLength={field.maxLength}
        onChange={(event) => onChange(field.type === 'digits' ? event.target.value.replace(/\D/g, '') : event.target.value)}
        aria-invalid={Boolean(error)}
        className={cn(ADMIN_FIELD, invalid)}
      />
    </FieldShell>
  );
}

const REGION_LABELS: Record<(typeof REGION_KEYS)[number], string> = {
  provinsi: 'Provinsi',
  kota: 'Kabupaten / kota',
  kecamatan: 'Kecamatan',
  kelurahan: 'Desa / kelurahan',
};

const findId = (list: Region[], name?: string) => list.find((item) => item.name === name)?.id;

/** Same cascading region data as the registration form; values are stored by name. */
function RegionSelects({ values, setValue, errors }: {
  values: EditValues;
  setValue: (key: FormKey, value: string) => void;
  errors?: UpdateParticipantDataState['fieldErrors'];
}) {
  const { provinces, regencies, districts, villages, loading, fetchRegencies, fetchDistricts, fetchVillages } = useWilayahIndonesia();
  useEffect(() => { const id = findId(provinces, values.provinsi); if (id) fetchRegencies(id); }, [provinces, values.provinsi, fetchRegencies]);
  useEffect(() => { const id = findId(regencies, values.kota); if (id) fetchDistricts(id); }, [regencies, values.kota, fetchDistricts]);
  useEffect(() => { const id = findId(districts, values.kecamatan); if (id) fetchVillages(id); }, [districts, values.kecamatan, fetchVillages]);

  const levels = [
    { key: 'provinsi', list: provinces, busy: loading.provinces, clears: ['kota', 'kecamatan', 'kelurahan'] },
    { key: 'kota', list: regencies, busy: loading.regencies, clears: ['kecamatan', 'kelurahan'] },
    { key: 'kecamatan', list: districts, busy: loading.districts, clears: ['kelurahan'] },
    { key: 'kelurahan', list: villages, busy: loading.villages, clears: [] },
  ] as const;

  return levels.map(({ key, list, busy, clears }) => {
    const id = `edit-${key}`;
    return (
      <FieldShell key={key} id={id} label={REGION_LABELS[key]} error={errors?.[key]}>
        <FormSelect
          id={id}
          name={key}
          value={values[key] ?? ''}
          options={list.map((item) => ({ value: item.name, label: item.name }))}
          placeholder={busy ? 'Memuat...' : 'Pilih'}
          invalid={Boolean(errors?.[key])}
          className={ADMIN_FIELD}
          onChange={(next) => { setValue(key, next); clears.forEach((child) => setValue(child, '')); }}
        />
      </FieldShell>
    );
  });
}
