// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const prismaClientSingleton = () => {
  // Menggunakan pooler URL dari environment variable
  const connectionString = `${process.env.DATABASE_URL}`;
  
  // Inisialisasi koneksi pool PostgreSQL
  const pool = new Pool({ connectionString });
  
  // Bungkus pool menggunakan Prisma Adapter
  const adapter = new PrismaPg(pool);

  // Masukkan adapter ke dalam Prisma Client
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;