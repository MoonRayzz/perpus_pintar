// src/app/(admin)/siswa/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addStudent(data: { nis: string; name: string; class: string }) {
  try {
    const qrCodeHash = `${data.nis}-${Date.now()}`;
    await prisma.student.create({
      data: { ...data, qrCodeHash }
    });
    revalidatePath("/siswa");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menambahkan siswa (NIS mungkin sudah terdaftar)." };
  }
}

// FUNGSI BARU: Edit Data Siswa
export async function editStudent(id: string, data: { nis: string; name: string; class: string }) {
  try {
    await prisma.student.update({
      where: { id },
      data: {
        nis: data.nis,
        name: data.name,
        class: data.class,
      }
    });
    revalidatePath("/siswa");
    return { success: true };
  } catch (error) {
    // Menangkap error jika user mengedit NIS menjadi NIS yang sudah dipakai siswa lain
    return { success: false, error: "Gagal menyimpan. Pastikan NIS tidak bentrok dengan siswa lain." };
  }
}

export async function deleteStudent(id: string) {
  try {
    await prisma.student.delete({ where: { id } });
    revalidatePath("/siswa");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus siswa. Pastikan siswa ini tidak memiliki pinjaman aktif." };
  }
}

export async function importStudents(students: { nis: string; name: string; class: string }[]) {
  try {
    const dataToInsert = students.map(s => ({
      nis: String(s.nis).trim(),
      name: s.name.trim(),
      class: String(s.class).trim(),
      qrCodeHash: `${String(s.nis).trim()}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    }));

    const result = await prisma.student.createMany({
      data: dataToInsert,
      skipDuplicates: true, 
    });

    revalidatePath("/siswa");
    return { success: true, count: result.count };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Terjadi kesalahan saat memproses data ke database." };
  }
}