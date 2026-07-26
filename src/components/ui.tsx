import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base " +
  "focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

const warnaBadge = {
  abu: "bg-gray-100 text-gray-700",
  hijau: "bg-emerald-100 text-emerald-800",
  kuning: "bg-amber-100 text-amber-800",
  merah: "bg-red-100 text-red-700",
} as const;

export function Badge({
  warna,
  children,
}: {
  warna: keyof typeof warnaBadge;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${warnaBadge[warna]}`}
    >
      {children}
    </span>
  );
}
