// src/components/admin/peminjaman/PeminjamanClient.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ScanBarcode, QrCode, CheckCircle, Book, History, AlertTriangle, Loader2, User, BookOpen, XCircle, Calendar, ArrowRight, Clock } from "lucide-react";
import { processLoan, returnLoan, getBookPreview, getStudentPreview } from "@/app/(admin)/peminjaman/actions";

type LoanData = {
  id: string;
  borrowedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
  book: { id: string; title: string };
  student: { name: string; class: string };
};

export default function PeminjamanClient({ activeLoans, pastLoans }: { activeLoans: LoanData[], pastLoans: LoanData[] }) {
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [isbn, setIsbn] = useState("");
  const [nis, setNis] = useState("");
  
  // Hitung default tanggal (7 hari ke depan) dalam format YYYY-MM-DD
  const getDefaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };
  const [dueDate, setDueDate] = useState<string>(getDefaultDueDate());
  
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [bookPreview, setBookPreview] = useState<any>(null);
  const [studentPreview, setStudentPreview] = useState<any>(null);
  const [isFetchingBook, setIsFetchingBook] = useState(false);
  const [isFetchingStudent, setIsFetchingStudent] = useState(false);

  const displayedLoans = activeTab === "active" ? activeLoans : pastLoans;

  // Cek apakah kedua data sudah valid diseksekusi
  const isReadyToProcess = bookPreview && bookPreview !== "not_found" && studentPreview && studentPreview !== "not_found";

  const handleIsbnEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isbn.trim() !== "") {
      e.preventDefault();
      setIsFetchingBook(true);
      const data = await getBookPreview(isbn.trim());
      setBookPreview(data || "not_found");
      setIsFetchingBook(false);
    }
  };

  const handleNisEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && nis.trim() !== "") {
      e.preventDefault();
      setIsFetchingStudent(true);
      const data = await getStudentPreview(nis.trim());
      setStudentPreview(data || "not_found");
      setIsFetchingStudent(false);
    }
  };

  const handleBorrow = async () => {
    if (!isbn || !nis) {
      setMessage({ type: "error", text: "Scan ISBN dan Kartu Siswa terlebih dahulu." });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    const result = await processLoan(isbn.trim(), nis.trim(), dueDate);
    
    if (result.success) {
      setMessage({ type: "success", text: "Peminjaman berhasil dicatat!" });
      setIsbn(""); 
      setNis("");
      setBookPreview(null);
      setStudentPreview(null);
      setDueDate(getDefaultDueDate()); // Reset kembali ke 7 hari
      setActiveTab("active");
    } else {
      setMessage({ type: "error", text: result.error || "Gagal memproses." });
    }
    
    setIsLoading(false);
  };

  const handleReturn = async (loanId: string, bookId: string) => {
    setProcessingId(loanId);
    const result = await returnLoan(loanId, bookId);
    if (result.success) {
      setMessage({ type: "success", text: "Buku berhasil dikembalikan." });
    } else {
      setMessage({ type: "error", text: result.error || "Gagal memproses pengembalian." });
    }
    setProcessingId(null);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#001f3f]">Sistem Peminjaman</h2>
        <p className="text-[#74777f] mt-1 text-sm">Scan barcode buku dan kartu siswa untuk memproses transaksi.</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg text-sm font-medium border animate-in slide-in-from-top-2 ${message.type === 'error' ? 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]' : 'bg-[#dce9ff] text-[#001c3a] border-[#001f3f]'}`}>
          {message.text}
        </div>
      )}

      {/* Box Utama Input Scanner */}
      <div className="bg-white rounded-xl border border-[#c4c6cf] shadow-sm mb-8 overflow-hidden transition-all duration-300">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: ISBN */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-[#0b1c30]">
                Scan ISBN Buku <span className="text-[#74777f] font-normal italic">(Otomatis via Scanner)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ScanBarcode size={20} className="text-[#74777f] group-focus-within:text-[#001f3f] transition-colors" />
                </div>
                <input 
                  autoFocus
                  type="text" 
                  value={isbn}
                  onChange={(e) => {
                    setIsbn(e.target.value);
                    if (bookPreview) setBookPreview(null);
                  }}
                  onKeyDown={handleIsbnEnter}
                  className="block w-full pl-10 pr-10 py-3.5 border border-[#c4c6cf] rounded-lg bg-[#f8f9ff] text-[#0b1c30] focus:ring-2 focus:ring-[#001f3f] focus:border-[#001f3f] transition-all text-sm outline-none font-medium shadow-inner" 
                  placeholder="Arahkan scanner ke barcode buku..." 
                />
                {isFetchingBook && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Loader2 size={18} className="animate-spin text-[#001f3f]" />
                  </div>
                )}
              </div>
              
              {bookPreview === "not_found" && (
                <div className="mt-3 p-4 bg-[#ffdad6]/40 border border-[#ba1a1a]/40 rounded-xl flex items-center gap-3 text-[#93000a] text-sm font-medium animate-in slide-in-from-top-2">
                  <XCircle size={20} /> Buku tidak ditemukan di database.
                </div>
              )}
              {bookPreview && bookPreview !== "not_found" && (
                <div className="mt-3 p-4 bg-gradient-to-r from-[#f8f9ff] to-white border border-[#c4c6cf] rounded-xl flex items-center gap-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
                  <div className="w-12 h-16 bg-[#d3e4fe] rounded shadow-sm border border-[#c4c6cf] overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                    {bookPreview.coverUrl ? (
                      <Image src={bookPreview.coverUrl} alt="Cover" fill className="object-cover" />
                    ) : (
                      <BookOpen size={20} className="text-[#74777f]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-[#0b1c30] text-sm line-clamp-1">{bookPreview.title}</h4>
                    <p className="text-xs text-[#43474e] font-medium">{bookPreview.author}</p>
                    <div className="mt-1.5">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border ${bookPreview.stock > 0 ? 'bg-[#dce9ff] text-[#001c3a] border-[#001c3a]/20' : 'bg-[#ffdad6] text-[#93000a] border-[#93000a]/20'}`}>
                        {bookPreview.stock > 0 ? `Stok: ${bookPreview.stock}` : 'Stok Kosong'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: QR Siswa */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-[#0b1c30]">
                Scan Kartu QR Siswa <span className="text-[#74777f] font-normal italic">(Otomatis via Scanner)</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <QrCode size={20} className="text-[#74777f] group-focus-within:text-[#001f3f] transition-colors" />
                </div>
                <input 
                  type="text" 
                  value={nis}
                  onChange={(e) => {
                    setNis(e.target.value);
                    if (studentPreview) setStudentPreview(null);
                  }}
                  onKeyDown={handleNisEnter}
                  className="block w-full pl-10 pr-10 py-3.5 border border-[#c4c6cf] rounded-lg bg-[#f8f9ff] text-[#0b1c30] focus:ring-2 focus:ring-[#001f3f] focus:border-[#001f3f] transition-all text-sm outline-none font-medium shadow-inner" 
                  placeholder="Arahkan scanner ke kartu pelajar..." 
                />
                {isFetchingStudent && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Loader2 size={18} className="animate-spin text-[#001f3f]" />
                  </div>
                )}
              </div>

              {studentPreview === "not_found" && (
                <div className="mt-3 p-4 bg-[#ffdad6]/40 border border-[#ba1a1a]/40 rounded-xl flex items-center gap-3 text-[#93000a] text-sm font-medium animate-in slide-in-from-top-2">
                  <XCircle size={20} /> NIS tidak terdaftar di sistem.
                </div>
              )}
              {studentPreview && studentPreview !== "not_found" && (
                <div className="mt-3 p-4 bg-gradient-to-r from-[#f8f9ff] to-white border border-[#c4c6cf] rounded-xl flex items-center gap-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#d3e4fe] shadow-sm border border-[#c4c6cf] flex items-center justify-center text-[#001f3f] flex-shrink-0">
                    <User size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-[#0b1c30] text-sm line-clamp-1">{studentPreview.name}</h4>
                    <p className="text-xs text-[#43474e] font-medium">Kelas {studentPreview.class} • NIS: {studentPreview.nis}</p>
                    <div className="mt-1.5">
                      {studentPreview.isActive ? (
                        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
                          Status: Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-[#ba1a1a]/10 text-[#ba1a1a] border border-[#ba1a1a]/20">
                          Status: Nonaktif
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Summary & Action (Muncul HANYA jika isReadyToProcess = true) */}
          {isReadyToProcess && (
            <div className="mt-8 p-5 bg-gradient-to-br from-[#001f3f] to-[#003366] rounded-xl shadow-lg border border-[#001f3f] animate-in slide-in-from-top-4 fade-in duration-500 text-white">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                
                {/* Waktu & Tanggal Info */}
                <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-start">
                  {/* Tanggal Pinjam (Readonly) */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                      <Clock size={20} className="text-[#fcd400]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider mb-0.5">Tanggal Pinjam</p>
                      <p className="text-sm font-bold">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <ArrowRight className="text-blue-300 hidden md:block" />

                  {/* Tanggal Kembali (Bisa Diedit) */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                      <Calendar size={20} className="text-[#fcd400]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider mb-0.5">Tenggat Kembali</p>
                      <input 
                        type="date" 
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="text-sm font-bold bg-transparent outline-none cursor-pointer border-b border-dashed border-blue-300 pb-0.5 focus:border-white transition-colors [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Tombol Eksekusi */}
                <button 
                  onClick={handleBorrow}
                  disabled={isLoading}
                  className="w-full md:w-auto bg-[#fcd400] text-[#001f3f] hover:bg-white hover:text-[#001f3f] px-8 py-3.5 rounded-lg font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                  Konfirmasi Peminjaman
                </button>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom Section: Tabs & Data Table */}
      <div className="bg-white rounded-xl border border-[#c4c6cf] shadow-sm overflow-hidden">
        <div className="border-b border-[#c4c6cf] px-4 pt-4 bg-[#f8f9ff]">
          <div className="flex space-x-8">
            <button 
              onClick={() => setActiveTab("active")}
              className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === "active" ? "border-[#001f3f] text-[#001f3f]" : "border-transparent text-[#74777f] hover:text-[#0b1c30]"}`}
            >
              <Book size={18} />
              Sedang Dipinjam
              <span className="bg-[#001f3f] text-white text-[10px] px-2 py-0.5 rounded-full ml-1">{activeLoans.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === "history" ? "border-[#001f3f] text-[#001f3f]" : "border-transparent text-[#74777f] hover:text-[#0b1c30]"}`}
            >
              <History size={18} />
              Riwayat
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] border-b border-[#c4c6cf]">
                <th className="py-3 px-6 font-semibold text-xs text-[#43474e] uppercase tracking-wider">Nama Siswa</th>
                <th className="py-3 px-6 font-semibold text-xs text-[#43474e] uppercase tracking-wider">Kelas</th>
                <th className="py-3 px-6 font-semibold text-xs text-[#43474e] uppercase tracking-wider">Judul Buku</th>
                <th className="py-3 px-6 font-semibold text-xs text-[#43474e] uppercase tracking-wider">Tanggal Pinjam</th>
                <th className="py-3 px-6 font-semibold text-xs text-[#43474e] uppercase tracking-wider">Tenggat / Kembali</th>
                <th className="py-3 px-6 font-semibold text-xs text-[#43474e] uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c6cf] text-sm bg-white">
              {displayedLoans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#43474e] font-medium">Tidak ada data transaksi di tab ini.</td>
                </tr>
              ) : (
                displayedLoans.map((loan) => {
                  const isOverdue = !loan.returnedAt && new Date() > new Date(loan.dueDate);
                  
                  return (
                    <tr key={loan.id} className={`hover:bg-[#f8f9ff] transition-colors ${isOverdue ? 'bg-[#ffdad6]/20' : ''}`}>
                      <td className="py-4 px-6 text-[#0b1c30] font-bold">{loan.student.name}</td>
                      <td className="py-4 px-6 text-[#43474e] font-medium">{loan.student.class}</td>
                      <td className="py-4 px-6 text-[#0b1c30] font-medium">{loan.book.title}</td>
                      <td className="py-4 px-6 text-[#43474e]">
                        {loan.borrowedAt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className={`py-4 px-6 font-bold flex items-center gap-1.5 ${isOverdue ? 'text-[#ba1a1a]' : 'text-[#43474e]'}`}>
                        {isOverdue && <AlertTriangle size={16} />}
                        {loan.returnedAt 
                          ? loan.returnedAt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) 
                          : loan.dueDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                        }
                      </td>
                      <td className="py-4 px-6 text-right">
                        {!loan.returnedAt ? (
                          <button 
                            onClick={() => handleReturn(loan.id, loan.book.id)}
                            disabled={processingId === loan.id}
                            className="text-[#001f3f] border-2 border-[#001f3f] hover:bg-[#001f3f] hover:text-white py-1.5 px-4 rounded-md text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 justify-end ml-auto"
                          >
                            {processingId === loan.id ? <Loader2 size={14} className="animate-spin" /> : null}
                            Terima Buku
                          </button>
                        ) : (
                          <span className="text-[#476083] text-xs font-extrabold px-3 py-1.5 bg-[#cbdbf5]/40 rounded-md">Selesai</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}