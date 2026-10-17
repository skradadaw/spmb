/**
 * Shared sizing and the four button roles so admin cards look the same:
 * primary (school green, one per section), secondary (white), danger (red) and the verified state.
 */
export const ADMIN_ACTION_BUTTON = 'h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold shadow-none';
export const ADMIN_PRIMARY_BUTTON = `${ADMIN_ACTION_BUTTON} border border-transparent bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-100`;
export const ADMIN_SECONDARY_BUTTON = `${ADMIN_ACTION_BUTTON} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900`;
export const ADMIN_DANGER_BUTTON = `${ADMIN_ACTION_BUTTON} border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 hover:text-rose-800`;
export const ADMIN_DANGER_SOLID_BUTTON = `${ADMIN_ACTION_BUTTON} border border-transparent bg-rose-700 text-white hover:bg-rose-800 hover:text-white`;
/** A finished state (e.g. "Terverifikasi"), not a call to action. */
export const ADMIN_DONE_BUTTON = `${ADMIN_ACTION_BUTTON} border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`;
export const ADMIN_SECTION_TITLE = 'text-xs font-semibold leading-4 text-slate-950';
export const ADMIN_LABEL = 'text-xs font-medium text-slate-700';
export const ADMIN_FIELD = 'h-9 rounded-lg text-sm';
