// src/app/(admin)/pengaturan/actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  // Cari pengaturan, kalau belum ada sama sekali, buatkan nilai default
  const settings = await prisma.systemSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" }
  });
  return settings;
}

export async function updateSettings(data: any) {
  try {
    await prisma.systemSettings.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data }
    });
    revalidatePath("/pengaturan");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menyimpan pengaturan." };
  }
}