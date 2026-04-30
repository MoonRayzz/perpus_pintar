// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Konfigurasi Metadata dan OpenGraph (Preview Link WA/Sosmed)
export const metadata: Metadata = {
  metadataBase: new URL("https://perpus-pintar.vercel.app"), // <-- TAMBAHAN INI MEMPERBAIKI WARNING
  title: "Sistem Perpustakaan SMPN 1 Banjar",
  description: "Sistem Manajemen Perpustakaan Terpadu dan Digital untuk SMPN 1 Banjar.",
  openGraph: {
    title: "Perpustakaan SMPN 1 Banjar",
    description: "Sistem Manajemen Perpustakaan Terpadu dan Digital untuk SMPN 1 Banjar.",
    url: "https://perpus-pintar.vercel.app", 
    siteName: "Perpus SMPN 1 Banjar",
    images: [
      {
        url: "/images/SEKOLAH.jpeg", 
        width: 1200, 
        height: 630,
        alt: "Gedung SMPN 1 Banjar",
      },
    ],
    locale: "id_ID",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}