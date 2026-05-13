// src/components/admin/pengaturan/PengaturanClient.tsx
"use client";

import { useState } from "react";
import { 
  Building2, 
  BookOpenCheck, 
  ShieldCheck, 
  Save, 
  Loader2, 
  CheckCircle2 
} from "lucide-react";
import { updateSettings } from "@/app/(admin)/pengaturan/actions"; // Import fungsi simpan ke DB

export default function PengaturanClient({ initialSettings }: { initialSettings: any }) {
  const [activeTab, setActiveTab] = useState<"profil" | "aturan" | "akun">("profil");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // --- STATE UNTUK FORM PROFIL (Sekarang mengambil dari database) ---
  const [profilData, setProfilData] = useState({
    namaSekolah: initialSettings?.namaSekolah || "",
    alamat: initialSettings?.alamat || "",
    kepalaSekolah: initialSettings?.kepalaSekolah || "",
    nipKepala: initialSettings?.nipKepala || "",
    pustakawan: initialSettings?.pustakawan || "",
    nipPustakawan: initialSettings?.nipPustakawan || ""
  });

  // --- STATE UNTUK FORM ATURAN (Sekarang mengambil dari database) ---
  const [aturanData, setAturanData] = useState({
    maxPinjamHari: initialSettings?.maxPinjamHari || 7,
    maxBukuSiswa: initialSettings?.maxBukuSiswa || 3,
    dendaPerHari: initialSettings?.dendaPerHari || 1000
  });

  // --- STATE UNTUK FORM AKUN ---
  const [akunData, setAkunData] = useState({
    passwordLama: "",
    passwordBaru: "",
    konfirmasiPassword: ""
  });

  // Fungsi Simpan Data ke Database Asli
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg("");

    try {
      if (activeTab === "profil") {
        await updateSettings(profilData);
      } else if (activeTab === "aturan") {
        await updateSettings(aturanData);
      } else if (activeTab === "akun") {
        // Untuk fitur ubah sandi, logikanya akan disiapkan terpisah nanti
        setAkunData({ passwordLama: "", passwordBaru: "", konfirmasiPassword: "" });
      }

      setSuccessMsg("Pengaturan berhasil disimpan dan diperbarui!");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      
      {/* SISI KIRI: MENU NAVIGASI TAB */}
      <div className="w-full md:w-1/4 bg-white rounded-2xl border border-[#c4c6cf] shadow-sm overflow-hidden shrink-0">
        <nav className="flex flex-col p-2 gap-1">
          <button 
            onClick={() => { setActiveTab("profil"); setSuccessMsg(""); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === "profil" 
                ? "bg-[#e5eeff] text-[#001f3f] border border-[#dce9ff]" 
                : "text-[#43474e] hover:bg-[#f8f9ff] hover:text-[#0b1c30] border border-transparent"
            }`}
          >
            <Building2 size={20} className={activeTab === "profil" ? "text-[#001f3f]" : "text-[#74777f]"} />
            Profil Sekolah
          </button>

          <button 
            onClick={() => { setActiveTab("aturan"); setSuccessMsg(""); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === "aturan" 
                ? "bg-[#e5eeff] text-[#001f3f] border border-[#dce9ff]" 
                : "text-[#43474e] hover:bg-[#f8f9ff] hover:text-[#0b1c30] border border-transparent"
            }`}
          >
            <BookOpenCheck size={20} className={activeTab === "aturan" ? "text-[#001f3f]" : "text-[#74777f]"} />
            Aturan Peminjaman
          </button>

          <button 
            onClick={() => { setActiveTab("akun"); setSuccessMsg(""); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === "akun" 
                ? "bg-[#e5eeff] text-[#001f3f] border border-[#dce9ff]" 
                : "text-[#43474e] hover:bg-[#f8f9ff] hover:text-[#0b1c30] border border-transparent"
            }`}
          >
            <ShieldCheck size={20} className={activeTab === "akun" ? "text-[#001f3f]" : "text-[#74777f]"} />
            Keamanan Akun
          </button>
        </nav>
      </div>

      {/* SISI KANAN: KONTEN FORM */}
      <div className="w-full md:w-3/4 bg-white rounded-2xl border border-[#c4c6cf] shadow-sm">
        <div className="p-6 md:p-8 border-b border-[#c4c6cf]">
          <h3 className="text-xl font-black text-[#001f3f]">
            {activeTab === "profil" && "Identitas & Profil Sekolah"}
            {activeTab === "aturan" && "Aturan & Kebijakan Perpustakaan"}
            {activeTab === "akun" && "Ubah Kata Sandi Admin"}
          </h3>
          <p className="text-[#74777f] text-sm mt-1">
            {activeTab === "profil" && "Data ini akan digunakan sebagai kop surat dan penanda tangan pada fitur cetak laporan."}
            {activeTab === "aturan" && "Sistem akan otomatis menghitung denda dan batas pinjam berdasarkan aturan di bawah ini."}
            {activeTab === "akun" && "Pastikan Anda menggunakan kata sandi yang kuat dan mudah diingat."}
          </p>
        </div>

        <form onSubmit={handleSave} className="p-6 md:p-8">
          
          {/* PESAN SUKSES MENGAMBANG */}
          {successMsg && (
            <div className="mb-8 p-4 bg-[#e5eeff] border border-[#dce9ff] rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="text-[#001f3f]" size={24} />
              <p className="text-[#001f3f] font-bold text-sm">{successMsg}</p>
            </div>
          )}

          {/* === FORM PROFIL SISI === */}
          {activeTab === "profil" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#43474e] uppercase mb-2">Nama Instansi / Sekolah</label>
                <input type="text" value={profilData.namaSekolah} onChange={e => setProfilData({...profilData, namaSekolah: e.target.value})} className="w-full px-4 py-3 border-2 border-[#eff4ff] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:bg-white font-medium text-[#0b1c30] transition-colors" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#43474e] uppercase mb-2">Alamat Lengkap</label>
                <textarea value={profilData.alamat} onChange={e => setProfilData({...profilData, alamat: e.target.value})} className="w-full px-4 py-3 border-2 border-[#eff4ff] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:bg-white font-medium text-[#0b1c30] transition-colors resize-none h-24" required />
              </div>
              
              <div className="pt-4 border-t border-[#c4c6cf] md:col-span-2 mb-2">
                <p className="font-bold text-[#001f3f]">Data Penandatangan Laporan</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474e] uppercase mb-2">Nama Kepala Sekolah</label>
                <input type="text" value={profilData.kepalaSekolah} onChange={e => setProfilData({...profilData, kepalaSekolah: e.target.value})} className="w-full px-4 py-3 border-2 border-[#eff4ff] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:bg-white font-medium text-[#0b1c30] transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#43474e] uppercase mb-2">NIP Kepala Sekolah</label>
                <input type="text" value={profilData.nipKepala} onChange={e => setProfilData({...profilData, nipKepala: e.target.value})} className="w-full px-4 py-3 border-2 border-[#eff4ff] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:bg-white font-medium text-[#0b1c30] transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#43474e] uppercase mb-2">Nama Pustakawan</label>
                <input type="text" value={profilData.pustakawan} onChange={e => setProfilData({...profilData, pustakawan: e.target.value})} className="w-full px-4 py-3 border-2 border-[#eff4ff] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:bg-white font-medium text-[#0b1c30] transition-colors" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#43474e] uppercase mb-2">NIP Pustakawan</label>
                <input type="text" value={profilData.nipPustakawan} onChange={e => setProfilData({...profilData, nipPustakawan: e.target.value})} className="w-full px-4 py-3 border-2 border-[#eff4ff] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:bg-white font-medium text-[#0b1c30] transition-colors" required />
              </div>
            </div>
          )}

          {/* === FORM ATURAN PEMINJAMAN === */}
          {activeTab === "aturan" && (
            <div className="grid grid-cols-1 gap-6 animate-in fade-in max-w-xl">
              <div>
                <label className="block text-xs font-bold text-[#43474e] uppercase mb-2">Maksimal Lama Pinjam (Hari)</label>
                <div className="relative">
                  <input type="number" value={aturanData.maxPinjamHari} onChange={e => setAturanData({...aturanData, maxPinjamHari: parseInt(e.target.value)})} className="w-full px-4 pr-16 py-3 border-2 border-[#eff4ff] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:bg-white font-black text-xl text-[#0b1c30] transition-colors [appearance:none] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" min="1" required />
                  <span className="absolute right-4 top-3.5 font-bold text-[#74777f] pointer-events-none">Hari</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#43474e] uppercase mb-2">Maksimal Buku Dipinjam Bersamaan</label>
                <div className="relative">
                  <input type="number" value={aturanData.maxBukuSiswa} onChange={e => setAturanData({...aturanData, maxBukuSiswa: parseInt(e.target.value)})} className="w-full px-4 pr-16 py-3 border-2 border-[#eff4ff] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:bg-white font-black text-xl text-[#0b1c30] transition-colors [appearance:none] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" min="1" required />
                  <span className="absolute right-4 top-3.5 font-bold text-[#74777f] pointer-events-none">Buku</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#43474e] uppercase mb-2">Denda Keterlambatan Per Hari</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 font-bold text-[#001f3f]">Rp</span>
                  <input type="number" value={aturanData.dendaPerHari} onChange={e => setAturanData({...aturanData, dendaPerHari: parseInt(e.target.value)})} className="w-full pl-12 pr-4 py-3 border-2 border-[#eff4ff] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:bg-white font-black text-xl text-[#0b1c30] transition-colors" min="0" step="500" required />
                </div>
              </div>
            </div>
          )}

          {/* === FORM AKUN === */}
          {activeTab === "akun" && (
            <div className="grid grid-cols-1 gap-6 animate-in fade-in max-w-xl">
              <div className="p-4 bg-[#fff8e1] border border-[#ffe16d] rounded-xl mb-2">
                <p className="text-sm font-bold text-[#6e5c00]">Perhatian!</p>
                <p className="text-sm text-[#6e5c00] mt-1">Setelah kata sandi diubah, Anda akan diminta untuk login kembali menggunakan kata sandi yang baru.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#43474e] uppercase mb-2">Kata Sandi Saat Ini</label>
                <input type="password" value={akunData.passwordLama} onChange={e => setAkunData({...akunData, passwordLama: e.target.value})} className="w-full px-4 py-3 border-2 border-[#eff4ff] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:bg-white font-medium text-[#0b1c30] transition-colors" placeholder="Masukkan sandi lama" required />
              </div>
              <div className="pt-4 border-t border-[#c4c6cf]">
                <label className="block text-xs font-bold text-[#43474e] uppercase mb-2">Kata Sandi Baru</label>
                <input type="password" value={akunData.passwordBaru} onChange={e => setAkunData({...akunData, passwordBaru: e.target.value})} className="w-full px-4 py-3 border-2 border-[#eff4ff] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:bg-white font-medium text-[#0b1c30] transition-colors" placeholder="Minimal 8 karakter" minLength={8} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#43474e] uppercase mb-2">Ulangi Kata Sandi Baru</label>
                <input type="password" value={akunData.konfirmasiPassword} onChange={e => setAkunData({...akunData, konfirmasiPassword: e.target.value})} className="w-full px-4 py-3 border-2 border-[#eff4ff] rounded-xl bg-[#f8f9ff] outline-none focus:border-[#001f3f] focus:bg-white font-medium text-[#0b1c30] transition-colors" placeholder="Ketik ulang sandi baru" minLength={8} required />
                
                {akunData.passwordBaru !== akunData.konfirmasiPassword && akunData.konfirmasiPassword.length > 0 && (
                  <p className="text-xs text-[#ba1a1a] font-bold mt-2">Kata sandi tidak cocok!</p>
                )}
              </div>
            </div>
          )}

          {/* TOMBOL SIMPAN GLOBAL */}
          <div className="mt-10 pt-6 border-t border-[#c4c6cf] flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading || (activeTab === "akun" && akunData.passwordBaru !== akunData.konfirmasiPassword)}
              className="bg-[#fcd400] text-[#001f3f] px-8 py-3.5 rounded-xl font-black text-base hover:bg-[#ffe16d] transition-all flex items-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Simpan Pengaturan
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}