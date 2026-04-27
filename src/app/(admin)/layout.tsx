// src/app/(admin)/layout.tsx
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex w-full font-sans">
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen max-w-[calc(100%-16rem)]">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto bg-[#f8f9ff]">
          {/* Komponen pembungkus ini menjaga jarak antar elemen sesuai desain */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}