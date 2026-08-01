import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPMB SD Plus 3 Al-Muhajirin — Tahun Ajaran 2027/2028",
  description:
    "Sistem Penerimaan Murid Baru SD Plus 3 Al-Muhajirin Tahun Ajaran 2027/2028. Daftar online dan cek status pendaftaran.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body
        suppressHydrationWarning
        className="min-h-screen bg-slate-50 text-slate-900 antialiased"
      >
        {children}
      </body>
    </html>
  );
}
