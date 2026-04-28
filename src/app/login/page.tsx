// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Lock, BookMarked, Sparkles } from "lucide-react";

// --- DATA DUMMY UNTUK ANIMASI BUKU ---
const DUMMY_BOOKS = [
  { id: 1, title: "Laskar Pelangi", author: "Andrea Hirata", color: "from-blue-500 to-cyan-400" },
  { id: 2, title: "Bumi Manusia", author: "Pramoedya A. Toer", color: "from-orange-500 to-amber-400" },
  { id: 3, title: "Filosofi Teras", author: "Henry Manampiring", color: "from-emerald-500 to-teal-400" },
  { id: 4, title: "Atomic Habits", author: "James Clear", color: "from-purple-500 to-pink-400" },
  { id: 5, title: "Sapiens", author: "Yuval Noah Harari", color: "from-slate-700 to-slate-500" },
  { id: 6, title: "Laut Bercerita", author: "Leila S. Chudori", color: "from-indigo-500 to-blue-500" },
  { id: 7, title: "Cantik Itu Luka", author: "Eka Kurniawan", color: "from-rose-500 to-red-400" },
  { id: 8, title: "Gadis Kretek", author: "Ratih Kumala", color: "from-yellow-600 to-orange-500" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Username atau password salah!");
      setIsLoading(false);
    } else {
      router.push("/");
    }
  };

  const infiniteBooks = [...DUMMY_BOOKS, ...DUMMY_BOOKS];

  return (
    <div className="flex h-[100dvh] w-full bg-[#f8f9ff] overflow-hidden">
      
      {/* ================= SISI KIRI: FORM LOGIN ================= */}
      <div className="w-full lg:w-5/12 h-full flex flex-col justify-center px-8 sm:px-12 md:px-20 relative z-10 bg-white shadow-[20px_0_50px_rgba(0,0,0,0.05)]">
        
        <div className="w-full max-w-sm mx-auto">
          
          {/* Header & Logo (DIPERBESAR & DI TENGAH) */}
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="relative w-28 h-28 md:w-36 md:h-36 bg-white rounded-[2rem] flex items-center justify-center p-2 mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#eff4ff]">
              <Image 
                src="/images/LOGO.png" 
                alt="Logo SMPN 1 Banjar" 
                fill 
                className="object-contain p-4" 
                priority 
                sizes="(max-width: 768px) 112px, 144px"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#001f3f] mb-2 tracking-tight">Masuk ke Sistem</h1>
            <p className="text-[#74777f] font-medium text-sm flex items-center justify-center gap-2">
              <Sparkles size={16} className="text-[#fcd400]" />
              Dashboard Admin Perpustakaan
            </p>
          </div>

          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#93000a] text-sm font-bold rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-full bg-[#ba1a1a] rounded-full" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#43474e] uppercase tracking-wider mb-1.5 block ml-1">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-[#eff4ff] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:bg-white transition-all font-semibold text-[#0b1c30] placeholder:text-[#c4c6cf]"
                  placeholder="Masukkan username admin..."
                  required
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-[#43474e] uppercase tracking-wider mb-1.5 block ml-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-[#eff4ff] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:bg-white transition-all font-semibold text-[#0b1c30] placeholder:text-[#c4c6cf]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-6 bg-[#001f3f] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#001c3a] transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(0,31,63,0.15)] active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} className="text-[#fcd400]" />}
              {isLoading ? "Memverifikasi..." : "Akses Dashboard"}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-[#eff4ff] text-center">
            <p className="text-xs text-[#74777f] font-medium leading-relaxed">
              Sistem Manajemen Perpustakaan Terpadu <br/> SMPN 1 Banjar © 2026
            </p>
          </div>
        </div>
      </div>

      {/* ================= SISI KANAN: ANIMASI BUKU BERJALAN ================= */}
      <div className="hidden lg:flex w-7/12 h-full bg-[#000613] relative overflow-hidden items-center justify-center gap-4 xl:gap-6 px-8">
        
        {/* Efek Cahaya Latar Belakang */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#001f3f] rounded-full filter blur-[120px] opacity-60 pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-[#fcd400] rounded-full filter blur-[150px] opacity-10 pointer-events-none" />

        {/* Kolom 1 (Scroll ke Atas) */}
        <div className="relative h-[200vh] w-52 xl:w-64 overflow-hidden mask-vertical pointer-events-none">
          <div className="flex flex-col gap-6 animate-scroll-up w-full absolute top-0">
            {infiniteBooks.map((book, idx) => (
              <BookCard key={`col1-${idx}`} book={book} />
            ))}
          </div>
        </div>

        {/* Kolom 2 (Scroll ke Bawah) */}
        <div className="relative h-[200vh] w-52 xl:w-64 overflow-hidden mask-vertical pointer-events-none">
          <div className="flex flex-col gap-6 animate-scroll-down w-full absolute bottom-0">
            {infiniteBooks.map((book, idx) => (
              <BookCard key={`col2-${idx}`} book={book} />
            ))}
          </div>
        </div>

        {/* Kolom 3 (Scroll ke Atas lambat) */}
        <div className="relative h-[200vh] w-52 xl:w-64 overflow-hidden mask-vertical pointer-events-none hidden xl:block">
          <div className="flex flex-col gap-6 animate-scroll-up-slow w-full absolute top-0">
            {infiniteBooks.map((book, idx) => (
              <BookCard key={`col3-${idx}`} book={book} />
            ))}
          </div>
        </div>

        {/* Teks Overlay Mengambang */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="text-center p-8 xl:p-12 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
            <h2 className="text-4xl xl:text-5xl font-black text-white mb-3 tracking-tight drop-shadow-lg">
              Eksplorasi <span className="text-[#fcd400]">Dunia</span>
            </h2>
            <p className="text-lg xl:text-xl text-[#afc8f0] font-medium">Melalui Jendela Perpustakaan Kita.</p>
          </div>
        </div>

      </div>

      <style jsx global>{`
        @keyframes scroll-up { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        @keyframes scroll-down { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }
        .animate-scroll-up { animation: scroll-up 25s linear infinite; }
        .animate-scroll-up-slow { animation: scroll-up 35s linear infinite; }
        .animate-scroll-down { animation: scroll-down 30s linear infinite; }
        .mask-vertical {
          mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
        }
      `}</style>
    </div>
  );
}

function BookCard({ book }: { book: any }) {
  return (
    <div className={`w-full aspect-[2/3] rounded-2xl bg-gradient-to-br ${book.color} p-5 xl:p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-white/20 shrink-0`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/10 rounded-tr-full" />
      <div className="absolute top-0 bottom-0 left-4 w-1 bg-black/20 shadow-[1px_0_2px_rgba(255,255,255,0.2)]" />
      <div className="relative z-10 pl-5">
        <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 text-white">
          <BookMarked size={18} />
        </div>
        <h3 className="text-xl xl:text-2xl font-black text-white leading-tight drop-shadow-md mb-2">{book.title}</h3>
      </div>
      <div className="relative z-10 pl-5">
        <p className="text-white/80 font-bold text-xs xl:text-sm uppercase tracking-widest">{book.author}</p>
      </div>
    </div>
  );
}