// src/app/(admin)/peminjaman/page.tsx
import prisma from "@/lib/prisma";
import PeminjamanClient from "@/components/admin/peminjaman/PeminjamanClient";

export const dynamic = 'force-dynamic';

export default async function PeminjamanPage() {
  // Ambil data peminjaman yang masih aktif (belum dikembalikan)
  const activeLoans = await prisma.loan.findMany({
    where: { returnedAt: null },
    include: {
      book: { select: { id: true, title: true } },
      student: { select: { name: true, class: true } }
    },
    orderBy: { borrowedAt: 'desc' }
  });

  // Ambil data riwayat peminjaman (sudah dikembalikan)
  const pastLoans = await prisma.loan.findMany({
    where: { returnedAt: { not: null } },
    include: {
      book: { select: { id: true, title: true } },
      student: { select: { name: true, class: true } }
    },
    orderBy: { returnedAt: 'desc' },
    take: 50 // Batasi 50 riwayat terakhir
  });

  return (
    <PeminjamanClient activeLoans={activeLoans} pastLoans={pastLoans} />
  );
}