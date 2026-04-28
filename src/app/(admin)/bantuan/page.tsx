// src/app/(admin)/bantuan/page.tsx
"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Users, 
  MonitorSmartphone, 
  FileSpreadsheet, 
  ChevronDown,
  Phone,
  Search,
  BookCopy // <-- Ini yang tadi tertinggal dan menyebabkan error
} from "lucide-react";

// --- DATA FAQ (Disesuaikan 100% dengan Sistem yang Dibuat) ---
const faqs = [
  {
    question: "Bagaimana cara kerja Absensi (Kiosk) di depan perpustakaan?",
    answer: "Sistem Kiosk bekerja secara mandiri. Saat siswa masuk, mereka cukup scan Kartu Barcode (atau ketik NIS manual) dan sistem akan mencatat jam masuk (Check-In). Saat mereka akan keluar, mereka scan lagi untuk Check-Out, lalu Kiosk akan otomatis menampilkan layar Feedback (Emoji, pilihan alasan, dan kolom teks manual) sebelum mereka meninggalkan ruangan."
  },
  {
    question: "Bagaimana cara mencetak Kartu Anggota (Barcode) Siswa?",
    answer: "Buka menu 'Data Siswa'. Anda memiliki dua opsi: 1) Cetak Satuan dengan mengklik ikon printer di baris nama siswa, atau 2) Cetak Massal dengan mencentang beberapa nama siswa sekaligus lalu klik 'Cetak Kartu Terpilih'. Sistem sudah mendesainnya agar pas dan rapi saat dicetak di kertas ukuran A4."
  },
  {
    question: "Apakah saya bisa memasukkan ratusan data siswa sekaligus?",
    answer: "Sangat bisa! Di menu 'Data Siswa', klik tombol kuning 'Import Excel'. Unduh template Excel yang disediakan, isi data siswa ke dalamnya (NIS, Nama, Kelas), lalu unggah file tersebut kembali ke sistem. Semua data dan Barcode akan di-generate secara otomatis."
  },
  {
    question: "Bagaimana alur Peminjaman dan Pengembalian Buku?",
    answer: "Buka menu 'Peminjaman'. Untuk meminjam, pilih siswa dan buku yang dituju, lalu tentukan 'Tanggal Kembali'. Jika siswa terlambat mengembalikan buku melewati tanggal tersebut, statusnya akan berwarna merah (Terlambat). Untuk menyelesaikan peminjaman, cukup klik tombol centang (Selesaikan)."
  },
  {
    question: "Bagaimana cara menarik Laporan untuk Kepala Sekolah/Akreditasi?",
    answer: "Buka menu 'Laporan'. Anda bisa memfilter data berdasarkan rentang tanggal (misalnya dari tanggal 1 sampai 30 April). Setelah itu klik 'Export ke Excel'. Sistem akan mengunduh satu file Excel lengkap yang terbagi menjadi 3 Sheet: 1) Riwayat Peminjaman Buku, 2) Log Kunjungan & Feedback Siswa, dan 3) Data Inventaris/Stok Buku Saat Ini."
  },
  {
    question: "Di mana saya bisa melihat Komentar dan Feedback dari siswa?",
    answer: "Komentar dan tingkat kepuasan siswa saat Check-Out dapat dilihat secara langsung (Live) di Halaman Dashboard utama pada kolom 'Feedback Terbaru'. Selain itu, detail lengkap komentar tiap siswa juga ikut terekap di dalam file Export Excel di menu Laporan."
  }
];

// --- DATA PANDUAN CEPAT ---
const guides = [
  { icon: MonitorSmartphone, title: "Kiosk Siswa", desc: "Layar absen & feedback mandiri." },
  { icon: BookCopy, title: "Sirkulasi Buku", desc: "Cara pinjam, kembali, dan denda." },
  { icon: Users, title: "Kelola Anggota", desc: "Import siswa dan cetak kartu A4." },
  { icon: FileSpreadsheet, title: "Laporan Excel", desc: "Tarik data 3-Sheet pelaporan." },
];

export default function BantuanPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0); // Buka FAQ pertama secara default
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      
      {/* HEADER HERO SECTION */}
      <div className="bg-[#001f3f] rounded-3xl p-8 md:p-12 text-white shadow-lg relative overflow-hidden mb-10">
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-[#fcd400] rounded-full filter blur-[100px] opacity-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
            Pusat Bantuan <span className="text-[#fcd400]">Admin</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed">
            Temukan panduan lengkap, jawaban atas pertanyaan umum, dan pelajari cara mengoptimalkan Sistem Perpustakaan Terintegrasi SMPN 1 Banjar.
          </p>
          
          {/* SEARCH BAR */}
          <div className="relative w-full max-w-md text-[#0b1c30]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-[#74777f]" />
            </div>
            <input 
              type="text" 
              placeholder="Cari solusi atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border-2 border-transparent outline-none focus:border-[#fcd400] focus:ring-4 focus:ring-[#fcd400]/30 transition-all font-medium shadow-md"
            />
          </div>
        </div>
      </div>

      {/* QUICK GUIDES CARDS */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-[#0b1c30] mb-6 flex items-center gap-2">
          <BookOpen size={24} className="text-[#001f3f]" /> Topik Utama Sistem
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guides.map((guide, idx) => (
            <div key={idx} className="bg-white border border-[#c4c6cf] rounded-2xl p-6 hover:shadow-lg hover:border-[#001f3f] transition-all cursor-default group">
              <div className="w-12 h-12 bg-[#e5eeff] text-[#001f3f] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-[#fcd400]">
                <guide.icon size={24} />
              </div>
              <h3 className="font-bold text-[#0b1c30] text-lg mb-1">{guide.title}</h3>
              <p className="text-sm text-[#74777f] font-medium leading-relaxed">{guide.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ ACCORDION SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Pertanyaan Umum */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-[#0b1c30] mb-6">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-white border border-[#c4c6cf] rounded-2xl text-[#74777f]">
                Pencarian "{searchQuery}" tidak ditemukan.
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className={`bg-white border transition-all duration-300 rounded-2xl overflow-hidden ${isOpen ? 'border-[#001f3f] shadow-md' : 'border-[#c4c6cf] hover:border-[#74777f]'}`}
                  >
                    <button 
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between bg-white outline-none"
                    >
                      <span className={`font-bold pr-4 ${isOpen ? 'text-[#001f3f]' : 'text-[#43474e]'}`}>
                        {faq.question}
                      </span>
                      <ChevronDown 
                        size={20} 
                        className={`text-[#74777f] transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
                      />
                    </button>
                    
                    <div 
                      className={`px-6 text-[#43474e] leading-relaxed transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 pb-0 opacity-0'}`}
                    >
                      <div className="w-full h-[1px] bg-[#e5eeff] mb-4"></div>
                      {faq.answer}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Kolom Kanan: Kotak Kontak Bantuan */}
        <div className="lg:col-span-1">
          <div className="bg-[#f8f9ff] border border-[#c4c6cf] rounded-2xl p-6 sticky top-6">
            <div className="w-14 h-14 bg-[#ffdad6] text-[#93000a] rounded-full flex items-center justify-center mb-6">
              <Phone size={28} />
            </div>
            <h3 className="text-xl font-bold text-[#0b1c30] mb-2">Masih Butuh Bantuan?</h3>
            <p className="text-[#43474e] text-sm leading-relaxed mb-6">
              Jika Anda mengalami masalah teknis yang tidak ada di daftar ini (seperti server down, scanner rusak, atau error database), segera hubungi Tim Pembuat Sistem.
            </p>
            
            <div className="space-y-4">
              <div className="bg-white border border-[#c4c6cf] p-4 rounded-xl">
                <p className="text-xs font-bold text-[#74777f] uppercase mb-1">WhatsApp Developer</p>
                <p className="font-bold text-[#001f3f]">+62 851-5724-4627</p>
              </div>
              <div className="bg-white border border-[#c4c6cf] p-4 rounded-xl">
                <p className="text-xs font-bold text-[#74777f] uppercase mb-1">Email Pelaporan</p>
                <p className="font-bold text-[#001f3f] text-sm">arisftp2@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}