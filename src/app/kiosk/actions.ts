// src/app/kiosk/actions.ts
"use server";

import prisma from "@/lib/prisma";

// 1. Proses Scan (Check-in / Check-out)
export async function processKioskScan(nis: string) {
  try {
    const student = await prisma.student.findUnique({ where: { nis } });
    if (!student) return { success: false, error: "NIS tidak terdaftar di sistem." };
    if (!student.isActive) return { success: false, error: "Kartu siswa tidak aktif." };

    // Cek apakah ada kunjungan yang "menggantung" (belum check-out) hari ini
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const activeVisit = await prisma.visit.findFirst({
      where: {
        studentId: student.id,
        checkOutTime: null,
        checkInTime: { gte: startOfDay }
      }
    });

    if (activeVisit) {
      // Jika sudah ada di dalam, maka ini proses CHECK-OUT
      await prisma.visit.update({
        where: { id: activeVisit.id },
        data: { checkOutTime: new Date() }
      });
      return { success: true, type: "OUT", student, visitId: activeVisit.id };
    } else {
      // Jika belum ada, maka ini proses CHECK-IN
      const newVisit = await prisma.visit.create({
        data: { studentId: student.id, checkInTime: new Date() }
      });
      return { success: true, type: "IN", student, visitId: newVisit.id };
    }
  } catch (error) {
    console.error("Kiosk Scan Error:", error);
    return { success: false, error: "Terjadi kesalahan sistem server." };
  }
}

// 2. Simpan Feedback Siswa
export async function submitKioskFeedback(visitId: string, rating: number) {
  try {
    await prisma.feedback.create({
      data: {
        visitId,
        rating
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Feedback Error:", error);
    return { success: false };
  }
}