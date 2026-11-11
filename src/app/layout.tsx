import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";

// Self-host agar dev/build tidak gagal mengunduh dari Google Fonts saat offline atau di balik proxy.
// Variable font subset latin dari Google Fonts (v12), mencakup ketebalan 200–800.
const plusJakartaSans = localFont({
  src: "./fonts/PlusJakartaSans-latin.woff2",
  weight: "200 800",
  style: "normal",
  variable: "--font-plus-jakarta",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: 'SPMB Online SD Plus 3 Al-Muhajirin',
  description:
    'Informasi dan formulir Seleksi Penerimaan Murid Baru SD Plus 3 Al-Muhajirin Tahun Ajaran 2027/2028.',
  icons: {
    icon: '/logo.png',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={cn("h-full", "antialiased", plusJakartaSans.variable, "font-sans")}
      suppressHydrationWarning
    >
      <body className={`${plusJakartaSans.className} min-h-full flex flex-col`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
