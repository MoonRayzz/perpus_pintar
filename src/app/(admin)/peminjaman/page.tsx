// src/app/(admin)/peminjaman/page.tsx
import prisma from "@/lib/prisma";
import PeminjamanClient from "@/components/admin/peminjaman/PeminjamanClient";

export const dynamic = 'force-dynamic';

export default async function PeminjamanPage() {
  // Ambil data pengaturan untuk aturan denda dan limit pinjam
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "default" }
  });
  
  // Jika database pengaturan kosong, buat nilai default cadangan
  const defaultSettings = settings || {
    maxPinjamHari: 7,
    maxBukuSiswa: 3,
    dendaPerHari: 1000
  };

  // Ambil data peminjaman aktif
  const activeLoans = await prisma.loan.findMany({
    where: { returnedAt: null },
    include: {
      book: { select: { id: true, title: true } },
      student: { select: { name: true, class: true } }
    },
    orderBy: { borrowedAt: 'desc' }
  });

  // Ambil data riwayat
  const pastLoans = await prisma.loan.findMany({
    where: { returnedAt: { not: null } },
    include: {
      book: { select: { id: true, title: true } },
      student: { select: { name: true, class: true } }
    },
    orderBy: { returnedAt: 'desc' },
    take: 50
  });

  return (
    <PeminjamanClient 
      activeLoans={activeLoans} 
      pastLoans={pastLoans} 
      settings={defaultSettings} 
    />
  );
}