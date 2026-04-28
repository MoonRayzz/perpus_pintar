// src/middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Regex ini artinya: "Gembok SEMUA halaman KECUALI /kiosk, /login, /api, dan file gambar/statik"
  matcher: ["/((?!kiosk|login|api|_next/static|_next/image|images|favicon.ico|manifest.json).*)"],
};