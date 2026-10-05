import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'border-transparent bg-slate-900 text-white',
  secondary: 'border-transparent bg-slate-100 text-slate-700',
  destructive: 'border-transparent bg-rose-50 text-rose-700',
  outline: 'border-slate-200 bg-white text-slate-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
} as const;

export type BadgeVariant = keyof typeof variants;

export function badgeVariants(variant: BadgeVariant = 'default') {
  return cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none', variants[variant]);
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return <span className={cn(badgeVariants(variant), className)} {...props} />;
}
