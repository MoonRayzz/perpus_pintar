// src/app/kiosk/layout.tsx
import { Metadata, Viewport } from "next";

// PISAHKAN PENGATURAN WARNA KE DALAM VIEWPORT SESUAI ATURAN BARU NEXT.JS
export const viewport: Viewport = {
  themeColor: "#000613",
};

export const metadata: Metadata = {
  title: "Kiosk Perpustakaan SMPN 1 Banjar",
  description: "Sistem Check-in dan Check-out Perpustakaan Digital",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kiosk Perpus",
  },
};

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {children}
    </section>
  );
}