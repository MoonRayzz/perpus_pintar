// src/components/admin/Header.tsx
import { Search, Bell, Settings } from "lucide-react";
import Image from "next/image";

export default function Header() {
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

      <div className="flex items-center gap-4 ml-4">
        <button className="text-[#43474e] hover:bg-[#eff4ff] p-2 rounded-full transition-colors active:scale-95">
          <Bell size={20} />
        </button>
        <button className="text-[#43474e] hover:bg-[#eff4ff] p-2 rounded-full transition-colors active:scale-95">
          <Settings size={20} />
        </button>
        
        <div className="w-8 h-8 rounded-full bg-[#d3e4fe] border border-[#c4c6cf] ml-2 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
          {/* Placeholder for Admin Profile Picture */}
          <div className="w-full h-full flex items-center justify-center bg-[#001f3f] text-white font-bold text-sm">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}