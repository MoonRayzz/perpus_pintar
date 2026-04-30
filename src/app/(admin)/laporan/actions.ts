// src/app/(admin)/laporan/actions.ts
"use server";

import prisma from "@/lib/prisma";

export async function getEnhancedExportData(filter: { startDate?: string; endDate?: string }) {
  try {
    const loans = await prisma.loan.findMany({
      where: filter.startDate && filter.endDate ? { borrowedAt: { gte: new Date(filter.startDate), lte: new Date(filter.endDate) } } : {},
      include: { book: { select: { title: true, isbn: true } }, student: { select: { name: true, nis: true, class: true } } },
      orderBy: { borrowedAt: 'desc' }
    });

    const visits = await prisma.visit.findMany({
      where: filter.startDate && filter.endDate ? { checkInTime: { gte: new Date(filter.startDate), lte: new Date(filter.endDate) } } : {},
      include: { student: { select: { name: true, nis: true, class: true } }, feedback: { include: { options: { include: { option: true } } } } },
      orderBy: { checkInTime: 'desc' }
    });

    const books = await prisma.book.findMany({ orderBy: { title: 'asc' } });

    // TARIK DATA PENGATURAN DARI DATABASE
    const settings = await prisma.systemSettings.findUnique({ where: { id: "default" } });

    return {
      loans: loans.map(l => ({
        "NIS": l.student.nis, "Nama": l.student.name, "Kelas": l.student.class, "Judul Buku": l.book.title,
        "Tgl Pinjam": l.borrowedAt.toLocaleDateString('id-ID'), "Tgl Kembali": l.returnedAt?.toLocaleDateString('id-ID') || "-", "Status": l.returnedAt ? "Selesai" : "Dipinjam"
      })),
      visits: visits.map(v => ({
        "Tgl Kunjung": v.checkInTime.toLocaleDateString('id-ID'), "Nama": v.student.name, "NIS": v.student.nis, "Kelas": v.student.class,
        "Masuk": v.checkInTime.toLocaleTimeString('id-ID'), "Keluar": v.checkOutTime?.toLocaleTimeString('id-ID') || "-",
        "Rating": v.feedback?.rating === 4 ? "Sangat Senang" : v.feedback?.rating === 3 ? "Senang" : v.feedback?.rating === 2 ? "Biasa" : v.feedback?.rating === 1 ? "Sedih" : "-",
        "Komentar": [v.feedback?.options?.map(o => o.option.label).join(", "), v.feedback?.comment].filter(Boolean).join(" | ") || "-"
      })),
      books: books.map(b => ({
        "ISBN": b.isbn, "Judul": b.title, "Penulis": b.author, "Kategori": b.category || "Umum", "Total Stok": b.stockTotal, "Tersedia": b.stock
      })),
      settings // <--- LEMPAR DATA PENGATURAN INI KE UI
    };
  } catch (error) {
    console.error(error);
    return { loans: [], visits: [], books: [], settings: null };
  }
}