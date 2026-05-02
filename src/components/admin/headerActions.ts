// src/components/admin/headerActions.ts
"use server";

import prisma from "@/lib/prisma";

export async function getNotifications() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Tarik data peminjaman yang terlambat
    const overdueLoans = await prisma.loan.findMany({
      where: {
        returnedAt: null,
        dueDate: { lt: today }
      },
      include: {
        student: { select: { name: true, class: true } },
        book: { select: { title: true } }
      },
      orderBy: { dueDate: 'asc' },
      take: 5 // Ambil 5 teratas agar dropdown tidak kepanjangan
    });

    // 2. Tarik data buku yang stoknya habis (0)
    const emptyBooks = await prisma.book.findMany({
      where: { stock: 0 },
      select: { title: true },
      take: 5
    });

    // Gabungkan dan format datanya untuk Notifikasi
    const notifications = [
      ...overdueLoans.map(loan => {
        const due = new Date(loan.dueDate);
        due.setHours(0,0,0,0);
        const diffTime = today.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          id: `loan-${loan.id}`,
          type: "OVERDUE",
          title: "Keterlambatan Pengembalian",
          message: `${loan.student.name} (Kelas ${loan.student.class}) terlambat ${diffDays} hari mengembalikan buku "${loan.book.title}".`,
          time: loan.dueDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
        };
      }),
      ...emptyBooks.map(book => ({
        id: `book-${book.title}`,
        type: "EMPTY_STOCK",
        title: "Stok Buku Habis",
        message: `Buku "${book.title}" sedang habis dipinjam seluruhnya.`,
        time: "Hari ini"
      }))
    ];

    return notifications;
  } catch (error) {
    console.error("Gagal menarik notifikasi:", error);
    return [];
  }
}