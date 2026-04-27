// src/components/admin/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  ArrowRightLeft, 
  Users, 
  BarChart3, 
  HelpCircle,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Manajemen Buku", href: "/buku", icon: BookOpen },
    { name: "Peminjaman", href: "/peminjaman", icon: ArrowRightLeft },
    { name: "Data Siswa", href: "/siswa", icon: Users },
    { name: "Laporan", href: "/laporan", icon: BarChart3 },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-[#c4c6cf] bg-white flex flex-col pt-4 pb-8 z-50">
      {/* Logo & Header */}
      <div className="px-6 pb-6 border-b border-[#c4c6cf] mb-4 flex items-center gap-3">
        <div className="w-10 h-10 shrink-0">
          <Image 
            src="/images/LOGO.png" 
            alt="Logo SMPN 1 Banjar" 
            width={40} 
            height={40}
            className="object-contain"
            priority
          />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#001f3f] leading-tight">SMPN 1 Banjar</h1>
          <p className="text-[12px] font-semibold text-[#43474e]">Sistem Perpustakaan</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ease-in-out font-medium text-sm ${
                isActive
                  ? "bg-[#eff4ff] text-[#001f3f] border-r-2 border-[#001f3f] font-bold"
                  : "text-[#43474e] hover:text-[#001f3f] hover:bg-[#eff4ff]"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="px-4 mt-auto flex flex-col gap-1 border-t border-[#c4c6cf] pt-4">
        <Link
          href="/bantuan"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-[#43474e] hover:text-[#001f3f] hover:bg-[#eff4ff] transition-all duration-200 ease-in-out font-medium text-sm"
        >
          <HelpCircle size={20} />
          Pusat Bantuan
        </Link>
        <button
          className="flex items-center gap-3 px-3 py-2 rounded-md text-[#43474e] hover:text-[#ba1a1a] hover:bg-[#ffdad6] transition-all duration-200 ease-in-out font-medium text-sm w-full text-left"
        >
          <LogOut size={20} />
          Keluar
        </button>
      </div>
    </aside>
  );
}