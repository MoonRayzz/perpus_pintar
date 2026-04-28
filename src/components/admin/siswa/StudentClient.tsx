// src/components/admin/siswa/StudentClient.tsx
"use client";

import { useState } from "react";
import { Plus, Trash2, Search, FileUp, Printer, X, FileSpreadsheet, Loader2, Info, Edit2 } from "lucide-react";
import { addStudent, deleteStudent, importStudents, editStudent } from "@/app/(admin)/siswa/actions";
import * as XLSX from "xlsx";
import Barcode from "react-barcode";

type Student = { id: string; nis: string; name: string; class: string; isActive: boolean };

export default function StudentClient({ initialStudents }: { initialStudents: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State untuk modal Edit
  
  // Form States
  const [formData, setFormData] = useState({ nis: "", name: "", class: "" });
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null); // Menyimpan ID siswa yang sedang diedit
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [cardsToPrint, setCardsToPrint] = useState<Student[]>([]);

  // Menggabungkan filtering dari props awal
  const filteredStudents = initialStudents.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.nis.includes(search) || 
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  // Fungsi Tambah Data
  const handleAdd = async () => {
    setIsLoading(true);
    const res = await addStudent(formData);
    if (res.success) {
      setIsAddModalOpen(false);
      setFormData({ nis: "", name: "", class: "" });
    } else {
      setMessage(res.error || "Error");
    }
    setIsLoading(false);
  };

  // Trigger Buka Modal Edit
  const openEditModal = (student: Student) => {
    setEditingStudentId(student.id);
    setFormData({ nis: student.nis, name: student.name, class: student.class });
    setMessage(""); // Bersihkan error lama
    setIsEditModalOpen(true);
  };

  // Fungsi Simpan Hasil Edit
  const handleEdit = async () => {
    if (!editingStudentId) return;
    setIsLoading(true);
    const res = await editStudent(editingStudentId, formData);
    
    if (res.success) {
      setIsEditModalOpen(false);
      setFormData({ nis: "", name: "", class: "" });
      setEditingStudentId(null);
    } else {
      setMessage(res.error || "Error saat mengedit data");
    }
    setIsLoading(false);
  };

  // Fungsi Upload Excel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const formattedData = data.map(row => ({
          nis: String(row["NIS"] || row["nis"] || ""),
          name: String(row["NAMA"] || row["Nama"] || row["nama"] || ""),
          class: String(row["KELAS"] || row["Kelas"] || row["kelas"] || "")
        })).filter(row => row.nis && row.name && row.class);

        if (formattedData.length === 0) {
          setMessage("Format Excel salah. Pastikan ada kolom NIS, Nama, dan Kelas.");
          setIsLoading(false);
          return;
        }

        const res = await importStudents(formattedData);
        if (res.success) {
          setIsImportModalOpen(false);
          alert(`Berhasil mengimpor ${res.count} siswa baru!`);
        } else {
          setMessage(res.error || "Gagal mengimpor.");
        }
      } catch (err) {
        setMessage("File rusak atau tidak bisa dibaca.");
      }
      setIsLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  // Fungsi Trigger Cetak
  const triggerPrint = (studentsData: Student[]) => {
    setCardsToPrint(studentsData);
    setTimeout(() => {
      window.print();
      setCardsToPrint([]); 
    }, 500);
  };

  return (
    <>
      {/* CSS KHUSUS PRINT */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          aside, header { display: none !important; }
          #normal-ui { display: none !important; }
          body, main, .ml-64, .p-6 { margin: 0 !important; padding: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          #print-area { display: flex !important; width: 100%; }
          @page { size: A4 portrait; margin: 10mm; }
          .page-break-avoid { page-break-inside: avoid; break-inside: avoid; }
        }
      `}} />

      {/* ===== TAMPILAN NORMAL ===== */}
      <div id="normal-ui" className="animate-in fade-in duration-500 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#001f3f]">Manajemen Data Siswa</h2>
            <p className="text-[#74777f] text-sm mt-1">Kelola data anggota dan cetak kartu perpustakaan (Barcode).</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => triggerPrint(filteredStudents)} className="bg-white border-2 border-[#001f3f] text-[#001f3f] hover:bg-[#e5eeff] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
              <Printer size={18} /> Cetak Masal ({filteredStudents.length})
            </button>
            <button onClick={() => setIsImportModalOpen(true)} className="bg-[#dce9ff] text-[#001c3a] hover:bg-[#afc8f0] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
              <FileUp size={18} /> Import Excel
            </button>
            <button onClick={() => { setIsAddModalOpen(true); setFormData({nis:'', name:'', class:''}); setMessage(""); }} className="bg-[#fcd400] text-[#001f3f] hover:bg-[#ffe16d] px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm">
              <Plus size={18} /> Tambah Satuan
            </button>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="bg-white rounded-xl border border-[#c4c6cf] shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-[#c4c6cf] bg-[#f8f9ff]">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-2.5 text-[#74777f]" size={18} />
              <input type="text" placeholder="Cari nama, NIS, atau kelas..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-[#c4c6cf] rounded-md text-sm outline-none focus:ring-2 focus:ring-[#001f3f]" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white border-b border-[#c4c6cf]">
                <tr>
                  <th className="py-3 px-6 text-xs uppercase font-bold text-[#43474e]">NIS</th>
                  <th className="py-3 px-6 text-xs uppercase font-bold text-[#43474e]">Nama Lengkap</th>
                  <th className="py-3 px-6 text-xs uppercase font-bold text-[#43474e]">Kelas</th>
                  <th className="py-3 px-6 text-xs uppercase font-bold text-[#43474e] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6cf]">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-[#74777f]">Tidak ada data siswa ditemukan.</td></tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-[#f8f9ff]">
                      <td className="py-3 px-6 font-mono text-sm text-[#001f3f] font-bold">{s.nis}</td>
                      <td className="py-3 px-6 font-medium text-[#0b1c30]">{s.name}</td>
                      <td className="py-3 px-6 text-[#43474e]">{s.class}</td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => triggerPrint([s])} className="flex items-center gap-1 text-xs font-bold bg-[#e5eeff] text-[#001f3f] px-3 py-1.5 rounded hover:bg-[#dce9ff] transition-colors">
                            <Printer size={14} /> Cetak Kartu
                          </button>
                          
                          {/* TOMBOL EDIT */}
                          <button onClick={() => openEditModal(s)} className="text-[#001f3f] p-1.5 hover:bg-[#e5eeff] rounded transition-colors" title="Edit Data">
                            <Edit2 size={16} />
                          </button>

                          <button onClick={() => deleteStudent(s.id)} className="text-[#ba1a1a] p-1.5 hover:bg-[#ffdad6] rounded transition-colors" title="Hapus Siswa">
                            <Trash2 size={16} />
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

        {/* MODAL: Tambah Satuan */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-[#000613]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl border border-[#c4c6cf]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-[#001f3f]">Tambah Siswa</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-[#74777f] hover:bg-slate-100 p-1 rounded-full"><X size={20}/></button>
              </div>
              {message && <p className="mb-4 text-sm text-[#ba1a1a] bg-[#ffdad6] p-2 rounded">{message}</p>}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-[#43474e] uppercase">NIS</label>
                  <input className="w-full mt-1 p-2 border border-[#c4c6cf] rounded text-sm outline-none focus:border-[#001f3f]" placeholder="Contoh: 12345" value={formData.nis} onChange={e => setFormData({...formData, nis: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#43474e] uppercase">Nama Lengkap</label>
                  <input className="w-full mt-1 p-2 border border-[#c4c6cf] rounded text-sm outline-none focus:border-[#001f3f]" placeholder="Contoh: Budi Santoso" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#43474e] uppercase">Kelas</label>
                  <input className="w-full mt-1 p-2 border border-[#c4c6cf] rounded text-sm outline-none focus:border-[#001f3f]" placeholder="Contoh: IX-A" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} />
                </div>
              </div>
              <button onClick={handleAdd} disabled={isLoading} className="w-full bg-[#fcd400] text-[#001f3f] py-2.5 rounded-lg font-bold flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : null} Simpan Data
              </button>
            </div>
          </div>
        )}

        {/* MODAL: Edit Data */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-[#000613]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl border border-[#c4c6cf]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-[#001f3f]">Edit Data Siswa</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-[#74777f] hover:bg-slate-100 p-1 rounded-full"><X size={20}/></button>
              </div>
              {message && <p className="mb-4 text-sm text-[#ba1a1a] bg-[#ffdad6] p-2 rounded">{message}</p>}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-[#43474e] uppercase">NIS</label>
                  <input className="w-full mt-1 p-2 border border-[#c4c6cf] rounded text-sm outline-none focus:border-[#001f3f]" value={formData.nis} onChange={e => setFormData({...formData, nis: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#43474e] uppercase">Nama Lengkap</label>
                  <input className="w-full mt-1 p-2 border border-[#c4c6cf] rounded text-sm outline-none focus:border-[#001f3f]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#43474e] uppercase">Kelas</label>
                  <input className="w-full mt-1 p-2 border border-[#c4c6cf] rounded text-sm outline-none focus:border-[#001f3f]" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} />
                </div>
              </div>
              <button onClick={handleEdit} disabled={isLoading} className="w-full bg-[#001f3f] text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#00152a]">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : null} Perbarui Data
              </button>
            </div>
          </div>
        )}

        {/* MODAL: Import Excel */}
        {isImportModalOpen && (
          <div className="fixed inset-0 bg-[#000613]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl border border-[#c4c6cf]">
              <div className="flex justify-between items-center mb-4 border-b border-[#c4c6cf] pb-3">
                <h3 className="font-bold text-lg text-[#001f3f] flex items-center gap-2"><FileSpreadsheet size={20}/> Import Excel</h3>
                <button onClick={() => setIsImportModalOpen(false)} className="text-[#74777f] hover:bg-slate-100 p-1 rounded-full"><X size={20}/></button>
              </div>

              <div className="mb-6 space-y-4">
                <div className="bg-[#e5eeff] border border-[#dce9ff] p-4 rounded-lg text-sm text-[#001f3f]">
                  <p className="font-bold mb-2 flex items-center gap-1"><Info size={16}/> Panduan Struktur Kolom</p>
                  <p className="mb-2 text-[#43474e]">Pastikan baris pertama (Header) Excel memiliki nama kolom ini:</p>
                  <table className="w-full bg-white border border-[#c4c6cf] rounded mt-2">
                    <thead className="bg-[#f8f9ff] text-xs">
                      <tr><th className="border-b border-[#c4c6cf] p-2">NIS</th><th className="border-b border-[#c4c6cf] p-2">Nama</th><th className="border-b border-[#c4c6cf] p-2">Kelas</th></tr>
                    </thead>
                    <tbody className="text-xs font-mono text-[#43474e]">
                      <tr><td className="p-2 border-b border-[#c4c6cf]">12345</td><td className="p-2 border-b border-[#c4c6cf]">Andi Saputra</td><td className="p-2 border-b border-[#c4c6cf]">VII-A</td></tr>
                    </tbody>
                  </table>
                </div>
                
                {message && <p className="text-sm text-[#ba1a1a] font-medium">{message}</p>}

                <div className="border-2 border-dashed border-[#c4c6cf] rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-[#f8f9ff] transition-colors relative cursor-pointer group">
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isLoading} />
                  {isLoading ? <Loader2 size={32} className="animate-spin text-[#001f3f] mb-2" /> : <FileUp size={32} className="text-[#74777f] group-hover:text-[#001f3f] mb-2 transition-colors" />}
                  <p className="font-bold text-[#0b1c30]">Klik atau seret file ke sini</p>
                  <p className="text-xs text-[#74777f] mt-1">Format didukung: .xlsx, .xls, .csv</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== TAMPILAN PRINT ===== */}
      <div id="print-area" className="hidden flex-wrap gap-4 justify-start items-start p-0 m-0 w-full bg-white">
        {cardsToPrint.map((s, index) => (
          <div key={index} className="page-break-avoid w-[8.5cm] h-[5.4cm] border-2 border-[#001f3f] rounded-lg bg-white relative overflow-hidden flex flex-col box-border">
            <div className="bg-[#001f3f] text-white flex items-center px-3 py-1.5 gap-2 shrink-0">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <img src="/images/LOGO.png" alt="Logo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black leading-none tracking-wide">KARTU PERPUSTAKAAN</span>
                <span className="text-[8px] leading-none opacity-90 mt-0.5">SMPN 1 Banjar</span>
              </div>
            </div>
            <div className="flex-1 px-4 py-2 flex flex-col justify-center bg-white">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">Nama Anggota</p>
              <h4 className="text-sm font-black text-black leading-tight line-clamp-1">{s.name}</h4>
              <div className="flex justify-between mt-2">
                <div>
                  <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">NIS</p>
                  <p className="text-xs font-bold text-black">{s.nis}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Kelas</p>
                  <p className="text-xs font-bold text-black">{s.class}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 flex items-center justify-center py-1.5 px-2 border-t border-gray-200 shrink-0">
              <Barcode value={s.nis} format="CODE128" width={1.5} height={25} fontSize={10} margin={0} background="transparent" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}