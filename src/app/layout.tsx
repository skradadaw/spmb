import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";



const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
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
