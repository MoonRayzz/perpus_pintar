// src/components/admin/buku/BookClient.tsx
"use client";

import { useState } from "react";
import { ScanBarcode, Plus, Image as ImageIcon, Edit, Trash2, X, Info, Loader2 } from "lucide-react";
import Image from "next/image";
import { fetchBookMetadata, createBook } from "@/app/(admin)/buku/actions";

type Book = {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string | null;
  category: string | null;
  coverUrl: string | null;
  stock: number;
  stockTotal: number;
};

export default function BookClient({ initialBooks }: { initialBooks: Book[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // States untuk Form Tambah Buku
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [formData, setFormData] = useState({
    isbn: "",
    title: "",
    author: "",
    publisher: "",
    category: "Umum",
    coverUrl: "",
    stock: 1
  });

  // Filter pencarian tabel
  const filteredBooks = initialBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fungsi yang dipanggil saat tombol Enter ditekan di kolom ISBN
  const handleIsbnScan = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && formData.isbn.trim() !== "") {
      e.preventDefault();
      setIsLoading(true);
      setMessage({ type: "", text: "" });

      // Panggil Server Action ke Google Books
      const result = await fetchBookMetadata(formData.isbn.trim());

      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          title: result.data.title,
          author: result.data.author,
          publisher: result.data.publisher,
          category: result.data.category,
          coverUrl: result.data.coverUrl,
        }));
        setMessage({ type: "success", text: "Data buku ditemukan!" });
      } else {
        setMessage({ type: "error", text: result.error || "Buku tidak ditemukan." });
      }
      setIsLoading(false);
    }
  };

  // Fungsi untuk menyimpan ke Database
  const handleSaveBook = async () => {
    if (!formData.isbn || !formData.title) {
      setMessage({ type: "error", text: "ISBN dan Judul wajib diisi." });
      return;
    }

    setIsSaving(true);
    const result = await createBook(formData);
    
    if (result.success) {
      // Tutup modal dan reset form
      setIsModalOpen(false);
      setFormData({ isbn: "", title: "", author: "", publisher: "", category: "Umum", coverUrl: "", stock: 1 });
      setMessage({ type: "", text: "" });
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menyimpan." });
    }
    setIsSaving(false);
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header Halaman & Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#0b1c30]">Manajemen Buku</h2>
          <p className="text-[#43474e] mt-1 text-sm">Kelola katalog buku, tambah inventaris, dan perbarui data.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative flex items-center w-80 h-10 rounded-md border border-[#c4c6cf] bg-white px-3 shadow-sm">
            <ScanBarcode size={20} className="text-[#43474e] mr-2" />
            <input
              type="text"
              placeholder="Cari di tabel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-[#0b1c30] placeholder-[#74777f] h-full outline-none"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#fcd400] text-[#6e5c00] font-medium text-sm px-4 py-2 rounded-md hover:bg-[#ffe16d] transition-colors shadow-sm active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            Tambah Buku
          </button>
        </div>
      </div>

      {/* Tabel Data Buku */}
      <div className="bg-white border border-[#c4c6cf] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] border-b border-[#c4c6cf] text-xs text-[#43474e] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold w-16">Cover</th>
                <th className="px-6 py-4 font-semibold">Judul Buku</th>
                <th className="px-6 py-4 font-semibold">Penulis</th>
                <th className="px-6 py-4 font-semibold">Kategori</th>
                <th className="px-6 py-4 font-semibold">ISBN</th>
                <th className="px-6 py-4 font-semibold text-right">Stok</th>
                <th className="px-6 py-4 font-semibold text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c6cf] text-sm text-[#0b1c30]">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#43474e]">
                    Tidak ada data buku yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="px-6 py-3">
                      <div className="w-10 h-14 bg-[#d3e4fe] rounded border border-[#c4c6cf] overflow-hidden flex items-center justify-center relative">
                        {book.coverUrl ? (
                          <Image src={book.coverUrl} alt={`Cover ${book.title}`} fill sizes="40px" className="object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-[#74777f]" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{book.title}</td>
                    <td className="px-6 py-4 text-[#43474e]">{book.author}</td>
                    <td className="px-6 py-4">{book.category || "-"}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[#43474e]">{book.isbn}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-semibold ${book.stock > 0 ? 'bg-[#dce9ff] text-[#001c3a]' : 'bg-[#ffdad6] text-[#93000a]'}`}>
                        {book.stock} / {book.stockTotal}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button className="text-[#43474e] hover:text-[#ba1a1a] p-1 rounded hover:bg-[#ffdad6] transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Buku */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#000613]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-[#c4c6cf] flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#c4c6cf] bg-[#f8f9ff] rounded-t-xl">
              <h3 className="text-xl font-bold text-[#0b1c30]">Tambah Buku Baru</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#43474e] hover:bg-[#d3e4fe] p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              {message.text && (
                <div className={`p-3 rounded-md text-sm font-medium ${message.type === 'error' ? 'bg-[#ffdad6] text-[#93000a]' : 'bg-[#dce9ff] text-[#001c3a]'}`}>
                  {message.text}
                </div>
              )}

              {/* Input ISBN */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0b1c30]">ISBN <span className="text-[#ba1a1a]">*</span></label>
                <div className="relative flex items-center w-full h-10 rounded-md border-2 border-[#001f3f] bg-white px-3 ring-4 ring-[#d4e3ff]/50 transition-all">
                  <ScanBarcode size={20} className="text-[#001f3f] mr-2" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Scan Barcode lalu tekan Enter..."
                    value={formData.isbn}
                    onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                    onKeyDown={handleIsbnScan}
                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-[#0b1c30] h-full outline-none"
                  />
                  {isLoading && <Loader2 size={16} className="animate-spin text-[#001f3f]" />}
                </div>
                <p className="text-[11px] text-[#43474e] mt-1 flex items-center gap-1">
                  <Info size={14} />
                  Tekan <b>Enter</b> setelah mengetik ISBN untuk mencari data otomatis.
                </p>
              </div>

              <div className="h-px w-full bg-[#c4c6cf]/50"></div>

              {/* Data Field (Bisa diedit manual jika API gagal) */}
              <div className={`flex flex-col gap-4 ${isLoading ? 'opacity-50' : ''}`}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#43474e]">Judul Buku</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Judul Buku..."
                    className="w-full h-10 rounded-md border border-[#c4c6cf] bg-white px-3 text-sm text-[#0b1c30] outline-none focus:border-[#001f3f]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#43474e]">Penulis</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      placeholder="Penulis..."
                      className="w-full h-10 rounded-md border border-[#c4c6cf] bg-white px-3 text-sm text-[#0b1c30] outline-none focus:border-[#001f3f]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#43474e]">Penerbit</label>
                    <input
                      type="text"
                      value={formData.publisher}
                      onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                      placeholder="Penerbit..."
                      className="w-full h-10 rounded-md border border-[#c4c6cf] bg-white px-3 text-sm text-[#0b1c30] outline-none focus:border-[#001f3f]"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-[#c4c6cf]/50"></div>

              <div className="flex flex-col gap-1.5 w-1/3">
                <label className="text-sm font-medium text-[#0b1c30]">Stok Awal <span className="text-[#ba1a1a]">*</span></label>
                <input
                  type="number"
                  min="1"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 1})}
                  className="w-full h-10 rounded-md border border-[#c4c6cf] bg-white px-3 text-sm text-[#0b1c30] focus:border-[#001f3f] focus:ring-1 focus:ring-[#001f3f] transition-all outline-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#c4c6cf] bg-[#f8f9ff] flex justify-end gap-3 rounded-b-xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-md border border-[#001f3f] text-[#001f3f] font-medium text-sm hover:bg-[#d3e4fe] transition-colors disabled:opacity-50"
                disabled={isSaving}
              >
                Batal
              </button>
              <button 
                onClick={handleSaveBook}
                disabled={isSaving || isLoading}
                className="px-6 py-2 rounded-md bg-[#fcd400] text-[#6e5c00] font-medium text-sm hover:bg-[#ffe16d] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}