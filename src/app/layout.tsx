import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "SPMB SD Plus 3 Al-Muhajirin — Tahun Ajaran 2027/2028",
  description:
    "Sistem Penerimaan Murid Baru SD Plus 3 Al-Muhajirin Tahun Ajaran 2027/2028. Daftar online dan cek status pendaftaran.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Header />
        <main className="mx-auto max-w-4xl px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
