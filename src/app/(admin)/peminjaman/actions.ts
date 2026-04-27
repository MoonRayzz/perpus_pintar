// src/app/(admin)/peminjaman/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- FUNGSI PREVIEW ---
export async function getBookPreview(isbn: string) {
  if (!isbn) return null;
  try {
    return await prisma.book.findUnique({ where: { isbn } });
  } catch (error) {
    return null;
  }
}

export async function getStudentPreview(nis: string) {
  if (!nis) return null;
  try {
    return await prisma.student.findUnique({ where: { nis } });
  } catch (error) {
    return null;
  }
}

// --- FUNGSI TRANSAKSI UTAMA ---
export async function processLoan(isbn: string, nis: string, dueDateString: string) {
  if (!isbn || !nis) return { success: false, error: "ISBN dan NIS wajib diisi." };

  try {
    const book = await prisma.book.findUnique({ where: { isbn } });
    if (!book) return { success: false, error: "Buku dengan ISBN tersebut tidak ditemukan." };
    if (book.stock < 1) return { success: false, error: "Stok buku sedang kosong (sedang dipinjam semua)." };

    const student = await prisma.student.findUnique({ where: { nis } });
    if (!student) return { success: false, error: "Siswa dengan NIS tersebut tidak terdaftar." };

    const existingLoan = await prisma.loan.findFirst({
      where: { studentId: student.id, bookId: book.id, returnedAt: null }
    });
    if (existingLoan) return { success: false, error: "Siswa ini masih meminjam buku yang sama." };

    // Konversi string tanggal dari UI menjadi Object Date
    const dueDate = new Date(dueDateString);

    await prisma.$transaction([
      prisma.loan.create({
        data: {
          studentId: student.id,
          bookId: book.id,
          dueDate: dueDate,
        }
      }),
      prisma.book.update({
        where: { id: book.id },
        data: { stock: book.stock - 1 }
      })
    ]);

    revalidatePath("/peminjaman");
    revalidatePath("/buku"); 
    return { success: true };
  } catch (error) {
    console.error("Loan error:", error);
    return { success: false, error: "Terjadi kesalahan pada server." };
  }
}

export async function returnLoan(loanId: string, bookId: string) {
  try {
    await prisma.$transaction([
      prisma.loan.update({
        where: { id: loanId },
        data: { returnedAt: new Date() }
      }),
      prisma.book.update({
        where: { id: bookId },
        data: { stock: { increment: 1 } }
      })
    ]);

    revalidatePath("/peminjaman");
    revalidatePath("/buku");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal memproses pengembalian." };
  }
}