// src/app/(admin)/buku/page.tsx
import prisma from "@/lib/prisma";
import BookClient from "@/components/admin/buku/BookClient";

// Memastikan halaman ini dirender secara dinamis agar selalu menarik data terbaru
export const dynamic = 'force-dynamic';

export default async function ManajemenBukuPage() {
  // Mengambil seluruh data buku dari Supabase (diurutkan dari yang terbaru ditambahkan)
  const books = await prisma.book.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Melempar data buku ke Client Component untuk dirender dan di-filter
  return (
    <BookClient initialBooks={books} />
  );
}