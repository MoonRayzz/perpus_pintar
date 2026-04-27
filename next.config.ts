// perpus_pintar/next.config.ts

import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // PWA hanya aktif saat di-build (production)
  register: true,
  scope: "/kiosk", 
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "books.google.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Tambahkan baris ini untuk mendiamkan error Turbopack
  turbopack: {}, 
};

export default withPWA(nextConfig);