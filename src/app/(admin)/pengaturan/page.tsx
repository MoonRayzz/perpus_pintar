// src/app/(admin)/pengaturan/page.tsx
import PengaturanClient from "@/components/admin/pengaturan/PengaturanClient";
import { getSettings } from "./actions";

export const metadata = {
  title: "Pengaturan Sistem | Perpus SMPN 1 Banjar",
};

// Pastikan halaman tidak di-cache agar selalu menampilkan data paling baru
export const dynamic = 'force-dynamic'; 

export default async function PengaturanPage() {
  // Tarik data asli dari database sebelum halaman dirender
  const settings = await getSettings();

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-[#001f3f] tracking-tight">Pengaturan Sistem</h2>
        <p className="text-[#74777f] mt-2 text-sm md:text-base">
          Kelola profil sekolah, aturan peminjaman buku, dan keamanan akun admin Anda di sini.
        </p>
      </div>

      {/* Lempar data dari database ke komponen Client */}
      <PengaturanClient initialSettings={settings} />
    </div>
  );
}