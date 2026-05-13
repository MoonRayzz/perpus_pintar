// src/app/kiosk/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { notifyDashboard } from "@/lib/sse-notifier";

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
      // 🔔 Push event ke semua dashboard yang sedang terbuka
      notifyDashboard("check-out");
      return { success: true, type: "OUT", student, visitId: activeVisit.id };
    } else {
      // Jika belum ada, maka ini proses CHECK-IN
      const newVisit = await prisma.visit.create({
        data: { studentId: student.id, checkInTime: new Date() }
      });
      // 🔔 Push event ke semua dashboard yang sedang terbuka
      notifyDashboard("check-in");
      return { success: true, type: "IN", student, visitId: newVisit.id };
    }
  } catch (error) {
    console.error("Kiosk Scan Error:", error);
    return { success: false, error: "Terjadi kesalahan sistem server." };
  }
}

// 2. Simpan Feedback Siswa (Update dengan Input Manual)
export async function submitKioskFeedback(visitId: string, rating: number, reasons: string[], customComment: string) {
  try {
    // A. Cek & Buat Master Data Option di DB (jika belum ada)
    const optionIds = [];
    for (const label of reasons) {
      let opt = await prisma.feedbackOption.findFirst({ where: { label } });
      if (!opt) {
        opt = await prisma.feedbackOption.create({
          data: { label, type: rating >= 3 ? "POSITIVE" : "NEGATIVE" }
        });
      }
      optionIds.push(opt.id);
    }

    // B. Simpan Feedback, Relasi Chip, dan Komentar Manual
    await prisma.feedback.create({
      data: {
        visitId,
        rating,
        comment: customComment.trim() !== "" ? customComment.trim() : null,
        options: {
          create: optionIds.map(id => ({
            option: { connect: { id } }
          }))
        }
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Feedback Error:", error);
    return { success: false };
  }
}