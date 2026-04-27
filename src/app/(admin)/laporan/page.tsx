// src/app/(admin)/laporan/page.tsx
import prisma from "@/lib/prisma";
import LaporanClient from "@/components/admin/laporan/LaporanClient";

export const dynamic = 'force-dynamic';

export default async function LaporanPage() {
  // Ambil semua kunjungan beserta data siswa dan feedback-nya
  const visits = await prisma.visit.findMany({
    include: {
      student: true,
      feedback: {
        include: { options: { include: { option: true } } }
      }
    },
    orderBy: { checkInTime: 'desc' }
  });

  // (Logika statistik grafik tetap sama seperti sebelumnya...)
  const feedbacks = await prisma.feedback.findMany();
  const feedbackStats = { 
    positive: feedbacks.filter(f => f.rating >= 3).length, 
    negative: feedbacks.filter(f => f.rating < 3).length, 
    total: feedbacks.length 
  };

  return (
    <LaporanClient 
      initialVisits={visits}
      visitStats={[]} // Isi dengan logika grafik sebelumnya jika perlu
      feedbackStats={feedbackStats} 
    />
  );
}