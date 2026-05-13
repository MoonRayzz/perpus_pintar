// src/app/(admin)/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Library, BookOpen, Users, Star } from "lucide-react";
import LiveEventListener from "@/components/admin/dashboard/LiveEventListener";

// --- REALTIME DASHBOARD ---
// force-dynamic: halaman TIDAK di-cache sama sekali.
// Setiap kali router.refresh() dipanggil oleh LiveRefresher (setiap 5 detik),
// Next.js akan menjalankan ulang semua query DB di bawah ini dan mengirim data terbaru ke browser.
export const dynamic = "force-dynamic";

// Fungsi untuk mengubah angka rating menjadi emoji
const getRatingEmoji = (rating: number) => {
  switch (rating) {
    case 1: return "😡";
    case 2: return "😐";
    case 3: return "👍";
    case 4: return "😍";
    default: return "😐";
  }
};

export default async function AdminDashboard() {
  // --- 1. AMBIL DATA DARI DATABASE VIA PRISMA (OPTIMIZED FOR BIG DATA) ---
  
  // A. Hitung Total Buku (berdasarkan jumlah fisik total)
  const totalBooksResult = await prisma.book.aggregate({
    _sum: { stockTotal: true }
  });
  const totalBooks = totalBooksResult._sum.stockTotal || 0;

  // B. Hitung Buku yang sedang dipinjam (belum dikembalikan)
  const booksBorrowed = await prisma.loan.count({
    where: { returnedAt: null }
  });

  // C. Hitung Pengunjung Hari Ini
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  const visitorsToday = await prisma.visit.count({
    where: {
      checkInTime: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  // D. Hitung Rata-rata Rating Feedback
  const ratingResult = await prisma.feedback.aggregate({
    _avg: { rating: true }
  });
  const averageRating = ratingResult._avg.rating?.toFixed(1) || "0.0";

  // E. Ambil Daftar Pengunjung Saat Ini (Dibatasi 10 agar memori tidak penuh)
  const currentVisitors = await prisma.visit.findMany({
    where: { checkOutTime: null },
    include: { student: true }, 
    orderBy: { checkInTime: 'desc' },
    take: 10 
  });

  // F. Ambil Feedback Terbaru (Dibatasi 4 agar dashboard tetap rapi)
  const recentFeedback = await prisma.feedback.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      visit: {
        include: { student: true }
      },
      options: {
        include: { option: true }
      }
    },
    take: 4
  });

  // --- 2. RENDER UI ---
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#0b1c30] tracking-tight">Overview Hari Ini</h2>
        <p className="text-[#43474e] mt-1 text-sm">Ringkasan aktivitas Perpustakaan SMPN 1 Banjar.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Buku */}
        <div className="bg-white border border-[#c4c6cf] rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-[#43474e] text-sm">Total Buku</span>
            <div className="p-2 bg-[#e5eeff] rounded-md text-[#001f3f]">
              <Library size={20} />
            </div>
          </div>
          <div className="text-4xl font-bold text-[#0b1c30]">
            {totalBooks.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Card 2: Buku Dipinjam */}
        <div className="bg-white border border-[#c4c6cf] rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-[#43474e] text-sm">Buku Dipinjam</span>
            <div className="p-2 bg-[#e5eeff] rounded-md text-[#001f3f]">
              <BookOpen size={20} />
            </div>
          </div>
          <div className="text-4xl font-bold text-[#0b1c30]">
            {booksBorrowed.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Card 3: Pengunjung Hari Ini */}
        <div className="bg-white border border-[#c4c6cf] rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-[#43474e] text-sm">Pengunjung Hari Ini</span>
            <div className="p-2 bg-[#e5eeff] rounded-md text-[#001f3f]">
              <Users size={20} />
            </div>
          </div>
          <div className="text-4xl font-bold text-[#0b1c30]">
            {visitorsToday.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Card 4: Rata-rata Rating */}
        <div className="bg-white border border-[#c4c6cf] rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="font-medium text-[#43474e] text-sm">Rata-rata Rating</span>
            <div className="p-2 bg-[#fcd400] rounded-md text-[#6e5c00]">
              <Star size={20} fill="currentColor" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#0b1c30]">{averageRating}</span>
            <span className="text-sm text-[#43474e]">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left Column: Pengunjung Saat Ini */}
        <div className="bg-white border border-[#c4c6cf] rounded-xl flex flex-col shadow-sm">
          <div className="p-5 border-b border-[#c4c6cf] flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#0b1c30]">Pengunjung Saat Ini</h3>
            {/* LiveEventListener: koneksi SSE persisten — hanya update saat ada scan */}
            <LiveEventListener />
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            {currentVisitors.length === 0 ? (
              <div className="p-8 text-center text-[#43474e] flex flex-col items-center justify-center h-full">
                <Users size={32} className="opacity-20 mb-2" />
                <p className="text-sm">Belum ada pengunjung di dalam perpustakaan saat ini.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[#c4c6cf]">
                {currentVisitors.map((visit) => {
                  const initial = visit.student.name.substring(0, 2).toUpperCase();
                  const time = visit.checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <li key={visit.id} className="flex items-center justify-between p-4 hover:bg-[#f8f9ff] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#d3e4fe] flex items-center justify-center text-[#001f3f] font-bold text-sm">
                          {initial}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0b1c30] text-sm">{visit.student.name}</p>
                          <p className="text-xs text-[#43474e]">Kelas {visit.student.class}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-[#43474e]">{time}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="p-4 border-t border-[#c4c6cf] text-center">
            <Link href="/siswa" className="text-sm font-semibold text-[#001f3f] hover:underline">
              Lihat Semua Data Siswa
            </Link>
          </div>
        </div>

        {/* Right Column: Feedback Terbaru */}
        <div className="bg-white border border-[#c4c6cf] rounded-xl flex flex-col shadow-sm">
          <div className="p-5 border-b border-[#c4c6cf]">
            <h3 className="text-lg font-bold text-[#0b1c30]">Feedback Terbaru</h3>
          </div>
          <div className="p-5 flex-1 overflow-y-auto max-h-[400px]">
            {recentFeedback.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#43474e]">
                <Star size={32} className="opacity-20 mb-2" />
                <p className="text-sm">Belum ada feedback dari siswa.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentFeedback.map((fb) => {
                  // Menggabungkan opsi chip dan komentar manual
                  const selectedOptions = fb.options.map(opt => opt.option.label).join(", ");
                  const finalComment = [selectedOptions, fb.comment].filter(Boolean).join(" | ");
                  
                  return (
                    <div key={fb.id} className="flex gap-4 p-4 rounded-lg bg-[#f8f9ff] border border-[#c4c6cf]">
                      <div className="text-3xl shrink-0 drop-shadow-sm">
                        {getRatingEmoji(fb.rating)}
                      </div>
                      <div>
                        {finalComment ? (
                          <p className="text-sm text-[#0b1c30] italic font-medium">"{finalComment}"</p>
                        ) : (
                          <p className="text-sm text-[#0b1c30] italic text-opacity-50">"Tanpa komentar."</p>
                        )}
                        <p className="text-xs text-[#43474e] mt-2 font-medium">
                          - {fb.visit.student.name} ({fb.visit.student.class}), {fb.createdAt.toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}