// src/components/admin/Header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, Settings, AlertTriangle, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { getNotifications } from "./headerActions";

export default function Header() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ambil data notifikasi saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchNotifs = async () => {
      setIsLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      setIsLoading(false);
    };
    fetchNotifs();
  }, []);

  // Tutup dropdown jika user klik di luar kotak
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex justify-between items-center w-full px-6 py-3 bg-white border-b border-[#c4c6cf] h-16">
      <div className="flex items-center flex-1">
        {/* Search Bar */}
        <div className="relative w-full max-w-md hidden md:block">
          <Search 
            size={20} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#43474e]" 
          />
          <input 
            type="text" 
            placeholder="Cari buku, ISBN, atau siswa..." 
            className="w-full pl-10 pr-12 py-2 bg-[#f8f9ff] border border-[#c4c6cf] rounded-md text-[#0b1c30] text-sm focus:outline-none focus:ring-2 focus:ring-[#001f3f] focus:border-transparent transition-all placeholder:text-[#74777f]"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            <kbd className="hidden sm:inline-block border border-[#c4c6cf] rounded bg-[#e5eeff] px-1.5 font-sans text-[10px] font-medium text-[#74777f]">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4 relative">
        
        {/* === WRAPPER NOTIFIKASI === */}
        <div ref={dropdownRef} className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="text-[#43474e] hover:bg-[#eff4ff] p-2 rounded-full transition-colors active:scale-95 relative"
          >
            <Bell size={20} />
            {/* Titik merah indikator jika ada notifikasi */}
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          {/* Kotak Dropdown Notifikasi */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#c4c6cf] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="p-4 border-b border-[#c4c6cf] bg-[#f8f9ff] flex justify-between items-center">
                <h3 className="font-black text-[#001f3f] text-sm">Notifikasi Sistem</h3>
                <span className="text-[10px] font-bold bg-[#dce9ff] text-[#001f3f] px-2 py-0.5 rounded-full">
                  {notifications.length} Baru
                </span>
              </div>
              
              <div className="max-h-[350px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 flex justify-center items-center">
                    <Loader2 size={24} className="animate-spin text-[#001f3f]" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-[#74777f]">
                    <Bell size={32} className="mx-auto opacity-20 mb-2" />
                    <p className="text-sm">Tidak ada notifikasi baru.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-[#c4c6cf]">
                    {notifications.map((notif) => (
                      <li key={notif.id} className="p-4 hover:bg-[#f8f9ff] transition-colors cursor-pointer group">
                        <div className="flex gap-3 items-start">
                          <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${notif.type === "OVERDUE" ? "bg-[#ffdad6] text-[#ba1a1a]" : "bg-[#fff8e1] text-[#6e5c00]"}`}>
                            {notif.type === "OVERDUE" ? <AlertTriangle size={16} /> : <BookOpen size={16} />}
                          </div>
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <p className="font-bold text-[#0b1c30] text-sm leading-tight">{notif.title}</p>
                              <span className="text-[10px] text-[#74777f] shrink-0 font-medium whitespace-nowrap">{notif.time}</span>
                            </div>
                            <p className="text-xs text-[#43474e] mt-1 leading-relaxed">{notif.message}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="p-3 border-t border-[#c4c6cf] text-center bg-[#f8f9ff]">
                <Link href="/peminjaman" onClick={() => setIsNotifOpen(false)} className="text-xs font-bold text-[#001f3f] hover:underline">
                  Lihat Semua Transaksi
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Tombol Pengaturan */}
        <Link href="/pengaturan" className="text-[#43474e] hover:bg-[#eff4ff] p-2 rounded-full transition-colors active:scale-95 cursor-pointer">
          <Settings size={20} />
        </Link>
        
        {/* Profil Admin */}
        <div className="w-8 h-8 rounded-full bg-[#d3e4fe] border border-[#c4c6cf] ml-2 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
          <div className="w-full h-full flex items-center justify-center bg-[#001f3f] text-white font-bold text-sm">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}