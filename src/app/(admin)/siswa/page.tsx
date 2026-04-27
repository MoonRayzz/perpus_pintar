// src/app/(admin)/siswa/page.tsx
import prisma from "@/lib/prisma";
import StudentClient from "@/components/admin/siswa/StudentClient";

// Memastikan halaman selalu dirender dengan data paling segar
export const dynamic = 'force-dynamic';

export default async function SiswaPage() {
  // Menarik data siswa dari database, diurutkan berdasarkan nama (A-Z)
  const students = await prisma.student.findMany({ 
    orderBy: { name: 'asc' } 
  });
  
  return (
    <StudentClient initialStudents={students} />
  );
}