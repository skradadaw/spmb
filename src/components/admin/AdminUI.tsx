import type { ReactNode } from "react";
import { adminCardCls } from "./styles";

export function AdminField({ id, label, error, hint, children }: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-[#101820]">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-[#667085]">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-700" role="alert">{error}</p>}
    </div>
  );
}

const badgeTone = {
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
  success: "border-green-200 bg-green-50 text-green-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  danger: "border-red-200 bg-red-50 text-red-800",
} as const;

export function AdminBadge({ tone, children }: { tone: keyof typeof badgeTone; children: ReactNode }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeTone[tone]}`}>{children}</span>;
}

export function AdminCard({ className = "", children }: { className?: string; children: ReactNode }) {
  return <section className={`${adminCardCls} ${className}`}>{children}</section>;
}

export function AdminFeedback({ ok, children }: { ok: boolean; children: ReactNode }) {
  return <div role="status" className={`rounded-xl border p-3 text-sm font-medium ${ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>{children}</div>;
}
