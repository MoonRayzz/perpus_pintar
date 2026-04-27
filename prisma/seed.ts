// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Koneksi khusus untuk CLI harus menggunakan DIRECT_URL
const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Hash password 'SMPN1BANJAR'
  const hashedPassword = await bcrypt.hash('SMPN1BANJAR', 10);

  // Buat akun admin
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {
      password: hashedPassword,
      name: 'Kepala Perpustakaan',
    },
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Kepala Perpustakaan',
    },
  });

  console.log("✅ Akun admin default berhasil dibuat/diperbarui:");
  console.log(`Username: ${admin.username}`);
  console.log(`Password: SMPN1BANJAR`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });