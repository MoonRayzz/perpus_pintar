// src/app/kiosk/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kiosk Perpustakaan SMPN 1 Banjar",
  description: "Sistem Check-in dan Check-out Perpustakaan Digital",
  manifest: "/manifest.json",
  themeColor: "#000613",
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