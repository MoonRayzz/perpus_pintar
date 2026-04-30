// src/components/admin/laporan/LaporanClient.tsx
"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Download, Loader2, ChevronLeft, ChevronRight, History } from "lucide-react";
import * as XLSX from "xlsx";
import { getEnhancedExportData } from "@/app/(admin)/laporan/actions";

export default function LaporanClient({ 
  initialVisits,
  visitStats, 
  feedbackStats 
}: { 
  initialVisits: any[],
  visitStats: any[], 
  feedbackStats: any 
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [filterDates, setFilterDates] = useState({ start: "", end: "" });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(initialVisits.length / itemsPerPage);
  const currentVisits = initialVisits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = async () => {
    setIsExporting(true);
    // Menarik data dari actions (Kunjungan, Peminjaman, Buku, dan Pengaturan)
    const data = await getEnhancedExportData({ 
      startDate: filterDates.start, 
      endDate: filterDates.end 
    });

    const workbook = XLSX.utils.book_new();
    
    // Buat 3 Sheet Utama
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.visits), "Kunjungan & Feedback");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.loans), "Data Peminjaman");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.books), "Inventaris Buku");

    // --- BUAT SHEET KE-4: KHUSUS PENGESAHAN DARI DATABASE ---
    const s = data.settings;
    const pengesahanData = [
      { Kolom1: "PROFIL PERPUSTAKAAN", Kolom2: "" },
      { Kolom1: "Nama Sekolah", Kolom2: s?.namaSekolah || "SMP Negeri 1 Banjar" },
      { Kolom1: "Alamat", Kolom2: s?.alamat || "-" },
      { Kolom1: "", Kolom2: "" },
      { Kolom1: "Mengetahui,", Kolom2: "Buleleng, " + new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
      { Kolom1: "Kepala Sekolah", Kolom2: "Pustakawan" },
      { Kolom1: "", Kolom2: "" },
      { Kolom1: "", Kolom2: "" },
      { Kolom1: "", Kolom2: "" },
      { Kolom1: s?.kepalaSekolah || "-", Kolom2: s?.pustakawan || "-" },
      { Kolom1: `NIP. ${s?.nipKepala || "-"}`, Kolom2: `NIP. ${s?.nipPustakawan || "-"}` },
    ];
    
    // skipHeader agar rapi tanpa judul tabel (Kolom1, Kolom2 tidak ikut ter-print)
    const sheetPengesahan = XLSX.utils.json_to_sheet(pengesahanData, { skipHeader: true });
    // Lebarkan kolom di Excel biar tulisan tidak kepotong
    sheetPengesahan["!cols"] = [{ wch: 40 }, { wch: 40 }]; 
    XLSX.utils.book_append_sheet(workbook, sheetPengesahan, "Profil & Pengesahan");

    // Proses Download File
    XLSX.writeFile(workbook, `Laporan_Lengkap_Perpus_${new Date().toISOString().split('T')[0]}.xlsx`);
    setIsExporting(false);
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-8">
      {/* Export & Filter Section */}
      <div className="bg-[#001f3f] text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-2xl font-black">Export Laporan Terpadu</h1>
          <p className="text-blue-200 text-sm">Pilih rentang waktu untuk mengunduh data lengkap perpustakaan.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/20">
            <input type="date" value={filterDates.start} onChange={e => setFilterDates({...filterDates, start: e.target.value})} className="bg-transparent text-sm p-2 outline-none" />
            <span className="px-2">s/d</span>
            <input type="date" value={filterDates.end} onChange={e => setFilterDates({...filterDates, end: e.target.value})} className="bg-transparent text-sm p-2 outline-none" />
          </div>
          <button onClick={handleExport} disabled={isExporting} className="bg-[#fcd400] text-[#001f3f] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition-all shadow-md">
            {isExporting ? <Loader2 className="animate-spin" /> : <Download size={20} />}
            Export Excel
          </button>
        </div>
      </div>

      {/* Main Table: Kunjungan & Feedback */}
      <div className="bg-white rounded-2xl border border-[#c4c6cf] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#c4c6cf] bg-[#f8f9ff] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#001f3f] text-white rounded-lg"><History size={20}/></div>
            <h2 className="text-xl font-bold text-[#001f3f]">Log Kunjungan & Feedback Siswa</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#eff4ff] text-[#43474e] text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Waktu / Tanggal</th>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4">Check In/Out</th>
                <th className="px-6 py-4 max-w-md">Feedback Admin/Layanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c6cf] text-sm">
              {currentVisits.map((v) => (
                <tr key={v.id} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#0b1c30]">{new Date(v.checkInTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#001f3f]">{v.student.name}</p>
                    <p className="text-xs text-[#74777f]">NIS: {v.student.nis} • Kelas {v.student.class}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-bold text-[10px]">IN: {new Date(v.checkInTime).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                      {v.checkOutTime && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold text-[10px]">OUT: {new Date(v.checkOutTime).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    {v.feedback ? (
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">{v.feedback.rating === 4 ? "😍" : v.feedback.rating === 3 ? "👍" : v.feedback.rating === 2 ? "😐" : "😡"}</span>
                        
                        <div className="flex flex-col gap-2">
                          {/* 1. Tampilkan Chip Pilihan */}
                          {v.feedback.options && v.feedback.options.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {v.feedback.options.map((opt: any, index: number) => (
                                <span key={opt.feedbackOptionId || index} className="bg-[#e5eeff] text-[#001f3f] text-[10px] px-2 py-0.5 rounded-full border border-blue-200">
                                  {opt.option.label}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* 2. Tampilkan Komentar Manual */}
                          {v.feedback.comment && (
                            <p className="text-xs text-[#0b1c30] italic font-medium bg-[#f8f9ff] border border-[#c4c6cf] p-2 rounded-lg inline-block w-fit">
                              "{v.feedback.comment}"
                            </p>
                          )}
                        </div>

                      </div>
                    ) : (
                      <span className="text-[#c4c6cf] italic text-xs">Belum ada feedback</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Control */}
        <div className="p-4 border-t border-[#c4c6cf] bg-[#f8f9ff] flex justify-between items-center">
          <p className="text-xs text-[#74777f]">Menampilkan halaman {currentPage} dari {totalPages || 1}</p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage <= 1} className="p-2 border rounded hover:bg-white disabled:opacity-30"><ChevronLeft size={16}/></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage >= totalPages} className="p-2 border rounded hover:bg-white disabled:opacity-30"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}