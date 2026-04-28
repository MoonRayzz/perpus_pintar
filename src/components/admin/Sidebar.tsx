// src/components/admin/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  BookCopy, 
  ArrowRightLeft, 
  Users, 
  PieChart, 
  LogOut, 
  HelpCircle 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Manajemen Buku", icon: BookCopy, path: "/buku" },
    { name: "Peminjaman", icon: ArrowRightLeft, path: "/peminjaman" },
    { name: "Data Siswa", icon: Users, path: "/siswa" },
    { name: "Laporan", icon: PieChart, path: "/laporan" },
  ];

  // Cek apakah sedang berada di halaman bantuan
  const isBantuanActive = pathname === "/bantuan";

  return (
    <aside className="w-64 bg-white border-r border-[#c4c6cf] h-screen fixed left-0 top-0 flex flex-col shadow-sm">
      
      {/* Branding / Logo */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-[#c4c6cf]">
        <div className="w-10 h-10 relative">
          <Image src="/images/LOGO.png" alt="Logo" fill className="object-contain" priority sizes="40px" />
        </div>
        <div>
          <h2 className="font-black text-[#001f3f] leading-none text-sm">SMPN 1 Banjar</h2>
          <p className="text-[10px] font-bold text-[#74777f]">Sistem Perpustakaan</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
          return (
            <Link key={item.name} href={item.path}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                isActive 
                  ? "bg-[#e5eeff] text-[#001f3f] shadow-sm border border-[#dce9ff]" 
                  : "text-[#43474e] hover:bg-[#f8f9ff] hover:text-[#0b1c30]"
              }`}>
                <item.icon size={20} className={isActive ? "text-[#001f3f]" : "text-[#74777f]"} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions (Pusat Bantuan & Logout) */}
      <div className="p-4 border-t border-[#c4c6cf] space-y-2 bg-[#f8f9ff]">
        
        {/* Ubah Button menjadi Link ke /bantuan */}
        <Link href="/bantuan">
          <div className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            isBantuanActive
              ? "bg-[#e5eeff] text-[#001f3f] shadow-sm border border-[#dce9ff]" 
              : "text-[#43474e] hover:bg-white hover:text-[#0b1c30]"
          }`}>
            <HelpCircle size={18} className={isBantuanActive ? "text-[#001f3f]" : "text-[#74777f]"} />
            Pusat Bantuan
          </div>
        </Link>
        
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-2.5 mt-2 rounded-xl font-bold text-sm text-[#ba1a1a] hover:bg-[#ffdad6] transition-all"
        >
          <LogOut size={18} />
          Keluar Sistem
        </button>
      </div>

    </aside>
  );
} 