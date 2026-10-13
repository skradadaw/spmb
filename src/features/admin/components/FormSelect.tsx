'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type FormSelectOption = { value: string; label: string };

// Radix Select reserves the empty string, so "no value" options travel under this placeholder value.
const EMPTY = '__empty__';

/**
 * shadcn Select for server-action forms: the chosen value is submitted through a hidden input,
 * which also supports empty options and values no longer in the list (e.g. older data).
 */
export function FormSelect({ id, name, value, options, placeholder = 'Pilih', invalid, onChange, className }: {
  id: string;
  name: string;
  value: string;
  options: readonly FormSelectOption[];
  placeholder?: string;
  invalid?: boolean;
  onChange: (value: string) => void;
  className?: string;
}) {
  const known = options.some((option) => option.value === value);
  const items = value && !known ? [{ value, label: value }, ...options] : options;
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select value={value === '' && !options.some((option) => option.value === '') ? undefined : value || EMPTY} onValueChange={(next) => onChange(next === EMPTY ? '' : next)}>
        <SelectTrigger id={id} aria-invalid={invalid || undefined} className={cn('h-10 w-full bg-white', invalid && 'border-rose-400', className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((option) => (
            <SelectItem key={option.value || EMPTY} value={option.value || EMPTY}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
