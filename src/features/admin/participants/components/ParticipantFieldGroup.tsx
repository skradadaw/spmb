import type { ReactNode } from 'react';
import { PARTICIPANT_FIELDS, type ParticipantFieldGroupName } from '../fields';
import { formatParticipantFieldValue } from '../presentation';

export type ParticipantFieldGroupProps = {
  title: string;
  name: ParticipantFieldGroupName;
  values?: Record<string, string | null>;
  hiddenFields?: string[];
  fullWidthFields?: string[];
  /** Rendered beside the heading, e.g. an edit button. */
  action?: ReactNode;
  /** Replaces the read-only field list, e.g. with an edit form. */
  children?: ReactNode;
  /** Extra controls under a field's value, keyed by field, e.g. the NISN Tidak Sesuai toggle. */
  fieldAddons?: Partial<Record<string, ReactNode>>;
  /** Fields whose value needs the admin's attention; shown in amber. */
  warningFields?: string[];
};

export function ParticipantFieldGroup({ title, name, values = {}, hiddenFields = [], fullWidthFields = [], action, children, fieldAddons = {}, warningFields = [] }: ParticipantFieldGroupProps) {
  const entries = PARTICIPANT_FIELDS[name]
    .filter(([key]) => !hiddenFields.includes(key))
    .map(([key, , label]) => [key, label, values?.[key] ?? null] as const);

  return (
    <section aria-labelledby={`participant-${name}-heading`} data-detail-group className="grid min-w-0 gap-2 border-b border-slate-200/70 pb-4 last:border-b-0 last:pb-0">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <h3 id={`participant-${name}-heading`} className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children ?? (
        <dl className="grid min-w-0 grid-cols-2 divide-x divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 sm:grid-cols-3">
          {entries.map(([key, label, value]) => (
            <div key={key} data-field={key} data-warning={warningFields.includes(key) || undefined} className={`min-w-0 px-3 py-2.5 ${fullWidthFields.includes(key) ? 'col-span-full' : ''} ${warningFields.includes(key) ? 'bg-amber-50/70' : ''}`}>
              <dt className="text-xs font-medium leading-5 text-[var(--admin-muted)]">{label}</dt>
              <dd className={`mt-1 break-words text-sm font-medium leading-6 ${warningFields.includes(key) ? 'text-amber-800' : 'text-slate-900'}`}>{formatParticipantFieldValue(name, key, value)}</dd>
              {fieldAddons[key] && <dd className="mt-1">{fieldAddons[key]}</dd>}
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
