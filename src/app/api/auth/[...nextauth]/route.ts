// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // Cari admin di database
        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username }
        });
        
        console.log("👉 Data Admin dari DB:", admin ? "Ditemukan" : "TIDAK DITEMUKAN");

        if (!admin) return null;

        // Cek kecocokan password
        const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);
        
        console.log("👉 Hasil cek password:", isPasswordValid ? "COCOK" : "SALAH");

        if (!isPasswordValid) return null;

        // Jika lolos, kembalikan data admin
        return { id: admin.id, name: admin.name, email: admin.username };
      }
    })
  ],
  session: { 
    strategy: "jwt",
    maxAge: 4 * 60 * 60, // Otomatis logout maksimal 4 jam (sebagai lapisan keamanan ekstra)
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // TIDAK MENYETAK maxAge di sini = Menjadi "Session Cookie"
        // Artinya: Cookie akan otomatis dibuang/dihapus oleh browser begitu browser di-close.
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "R4h4s1aP3rpus123!",
});

export { handler as GET, handler as POST };