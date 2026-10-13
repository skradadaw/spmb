import { cn } from '@/lib/utils';

/**
 * One button scale for the landing page: `lg` for section actions, `sm` for the header,
 * menu, copy, and footer. Every action shares radius, weight, icon size, and press feedback.
 */
const sizes = {
  lg: 'min-h-12 px-6 py-3 text-center text-base [&_svg]:size-5',
  sm: 'min-h-11 px-4 py-2 text-sm whitespace-nowrap [&_svg]:size-[18px]',
} as const;

const variants = {
  /** Green fill, the default call to action on light backgrounds and the hero. */
  primary:
    'bg-public-green text-white shadow-md shadow-public-green/20 hover:bg-public-green-hover active:bg-public-green-hover focus-visible:outline-public-green',
  /** Amber fill for the one call to action on a deep green band. */
  accent:
    'bg-amber-300 text-public-deep shadow-md shadow-public-deep/30 hover:bg-amber-200 active:bg-amber-200 focus-visible:outline-white',
  /** White fill on a deep green band. */
  solidOnDeep:
    'bg-white text-public-deep shadow-sm hover:bg-public-tint active:bg-public-tint focus-visible:outline-white',
  /** Translucent outline on a deep green band. */
  outlineOnDeep:
    'border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 active:bg-white/25 focus-visible:outline-white',
  /** Outline on a light background. */
  outline:
    'border border-public-deep/15 bg-white text-slate-700 hover:bg-public-tint hover:text-public-deep active:bg-public-tint focus-visible:outline-public-green',
} as const;

export type ActionVariant = keyof typeof variants;

export function actionClass(
  variant: ActionVariant,
  size: keyof typeof sizes = 'lg',
  className?: string,
) {
  return cn(
    'tap-press inline-flex items-center justify-center gap-2 rounded-xl font-bold focus-visible:outline-2 focus-visible:outline-offset-2 [&_svg]:shrink-0',
    sizes[size],
    variants[variant],
    className,
  );
}
