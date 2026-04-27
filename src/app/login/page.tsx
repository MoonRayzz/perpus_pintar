// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Lock } from "lucide-react";

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
      router.push("/"); // Arahkan ke dashboard admin jika sukses
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9ff] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-[#c4c6cf] overflow-hidden">
        
        {/* Header Login */}
        <div className="bg-[#001f3f] p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white rounded-full p-2 mb-4">
            <Image src="/images/LOGO.png" alt="Logo" width={80} height={80} className="object-contain" />
          </div>
          <h1 className="text-2xl font-black text-white">Sistem Admin</h1>
          <p className="text-[#afc8f0] text-sm">Perpustakaan SMPN 1 Banjar</p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-[#ffdad6] text-[#93000a] text-sm font-bold rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-[#43474e] uppercase tracking-wider mb-1 block">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-[#c4c6cf] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:ring-2 focus:ring-[#001f3f]/20 transition-all font-medium"
                placeholder="Masukkan username..."
                required
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-[#43474e] uppercase tracking-wider mb-1 block">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-[#c4c6cf] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:ring-2 focus:ring-[#001f3f]/20 transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-8 bg-[#fcd400] text-[#001f3f] py-3.5 rounded-xl font-black text-lg hover:bg-[#ffe16d] transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
            {isLoading ? "Memverifikasi..." : "Masuk ke Sistem"}
          </button>
        </form>
      </div>
    </div>
  );
}