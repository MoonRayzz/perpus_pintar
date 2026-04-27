// src/app/kiosk/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, BookOpen, Sparkles, ChevronRight, Scan, AlertCircle, Send, Keyboard, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";
import Lottie from "lottie-react";
import { processKioskScan, submitKioskFeedback } from "@/app/kiosk/actions";

// Tambahan State: THANK_YOU
type ScreenState = "STANDBY" | "SUCCESS" | "FEEDBACK_RATING" | "FEEDBACK_DETAIL" | "THANK_YOU";
type ScanData = { type: "IN" | "OUT"; student: any; visitId: string } | null;

export default function KioskPage() {
  const [screen, setScreen] = useState<ScreenState>("STANDBY");
  const [isManualMode, setIsManualMode] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [scanData, setScanData] = useState<ScanData>(null);
  const [rating, setRating] = useState<number>(0);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  // State untuk menyimpan data JSON animasi Lottie
  const [thanksAnimationData, setThanksAnimationData] = useState<any>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch file Lottie dari folder public (Aman di Next.js)
  useEffect(() => {
    fetch("/animations/Thanks button.json")
      .then((res) => res.json())
      .then((data) => setThanksAnimationData(data))
      .catch((err) => console.error("Gagal memuat animasi Lottie:", err));
  }, []);

  // 2. Auto-focus protection scanner
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (screen === "STANDBY" && !isManualMode) {
      inputRef.current?.focus();
      interval = setInterval(() => {
        if (document.activeElement !== inputRef.current && screen === "STANDBY" && !isManualMode) {
          inputRef.current?.focus();
        }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [screen, isManualMode]);

  // 3. Fallback Timer untuk Layar Terima Kasih (Jika Lottie macet/durasi terlalu panjang)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (screen === "THANK_YOU") {
      timeout = setTimeout(() => {
        resetKiosk();
      }, 5000); // Batas maksimal 5 detik
    }
    return () => clearTimeout(timeout);
  }, [screen]);

  const executeScan = async (nis: string) => {
    setIsProcessing(true);
    setErrorMsg("");

    const result = await processKioskScan(nis.trim());

    if (result.success) {
      const data = result as ScanData;
      setScanData(data);
      setScreen("SUCCESS");
      setIsManualMode(false);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fcd400', '#001f3f', '#ffffff'],
        disableForReducedMotion: true
      });

      if (data?.type === "IN") {
        // Jika Check-in: Langsung kembali ke standby setelah 5 detik
        setTimeout(() => resetKiosk(), 5000);
      } else {
        // Jika Check-out: Pindah ke Feedback setelah 3 detik
        setTimeout(() => setScreen("FEEDBACK_RATING"), 3000);
      }
    } else {
      setErrorMsg(result.error || "Gagal memproses");
      setTimeout(() => setErrorMsg(""), 4000);
    }

    setScanInput("");
    setIsProcessing(false);
  };

  const handleScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && scanInput.trim() !== "") {
      e.preventDefault();
      executeScan(scanInput);
    }
  };

  const handleRatingSelect = (selected: number) => {
    setRating(selected);
    setScreen("FEEDBACK_DETAIL");
  };

  // Submit Feedback & Transisi ke Layar Terima Kasih
  const handleFinalSubmit = async () => {
    if (scanData?.visitId) {
      await submitKioskFeedback(scanData.visitId, rating);
    }
    setScreen("THANK_YOU"); // Pindah ke Lottie
  };

  // Skip Feedback & Transisi ke Layar Terima Kasih
  const handleSkipFeedback = () => {
    setScreen("THANK_YOU"); // Pindah ke Lottie
  };

  const resetKiosk = () => {
    setScreen("STANDBY");
    setIsManualMode(false);
    setScanData(null);
    setRating(0);
    setSelectedReasons([]);
  };

  const reasonsList = [
    { id: "1", text: "Ruangan kurang nyaman", icon: "🤒" },
    { id: "2", text: "Buku kurang lengkap", icon: "📚" },
    { id: "3", text: "Petugas sangat membantu", icon: "👨‍💼" },
    { id: "4", text: "Suasana kondusif", icon: "🤫" },
    { id: "5", text: "Wi-Fi cepat", icon: "📶" },
    { id: "6", text: "Buku yang dicari tersedia", icon: "✅" },
  ];

  return (
    <div className="relative h-[100dvh] w-full bg-[#000613] overflow-hidden flex flex-col items-center justify-center font-sans text-white select-none">

      {/* BACKGROUND AMBIENT (Hardware Accelerated) */}
      <div className="absolute inset-0 z-0 pointer-events-none transform-gpu">
        <div className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] bg-[#001f3f] rounded-full filter blur-[100px] animate-blob" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] bg-[#fcd400] rounded-full filter blur-[120px] animate-blob animation-delay-4000 opacity-20" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] transform-gpu" />
      </div>

      <AnimatePresence mode="wait">

        {/* ================= LAYAR 1: STANDBY ================= */}
        {screen === "STANDBY" && (
          <motion.main key="standby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }} className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-6 text-center transform-gpu">
            <input ref={inputRef} type="text" value={scanInput} onChange={(e) => setScanInput(e.target.value)} onKeyDown={handleScan} className="absolute opacity-0 pointer-events-none" />

            <div className="mb-6 p-4 bg-white rounded-3xl shadow-[0_0_40px_rgba(252,212,0,0.2)] border-4 border-[#fcd400]/20 transform-gpu">
              <div className="relative w-20 h-20 md:w-28 md:h-28">
                <Image src="/images/LOGO.png" alt="Logo" fill className="object-contain" priority />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-1 tracking-tight leading-tight">Selamat Datang di</h1>
            <h2 className="text-2xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#fcd400] via-white to-[#fcd400] bg-[length:200%_auto] animate-gradient-x mb-8">
              Perpustakaan Digital
            </h2>

            <div className="w-full max-w-lg bg-[#001f3f]/40 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden transform-gpu">
              <AnimatePresence mode="wait">
                {!isManualMode ? (
                  <motion.div key="scan-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col items-center">
                    <h3 className="text-xl md:text-2xl font-bold text-blue-100 mb-8">
                      {isProcessing ? "Memproses..." : "Arahkan Kartu Anggota"}
                    </h3>
                    <div className="relative w-40 h-40 bg-black/50 rounded-[32px] border-2 border-white/10 flex items-center justify-center overflow-hidden transform-gpu">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#fcd400] rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#fcd400] rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#fcd400] rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#fcd400] rounded-br-lg" />
                      <QrCode size={60} className="text-white/20" />
                      <div className="absolute left-0 w-full h-1 bg-[#fcd400] shadow-[0_0_15px_#fcd400] z-20 animate-laser" />
                    </div>
                    <button onClick={() => setIsManualMode(true)} className="mt-8 flex items-center gap-2 text-white/50 hover:text-[#fcd400] transition-colors text-sm font-medium p-2">
                      <Keyboard size={16} /> Alat scan bermasalah? Ketik manual
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="manual-ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col items-center w-full">
                    <div className="w-full flex items-center justify-between mb-6">
                      <button onClick={() => setIsManualMode(false)} className="p-3 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={24} /></button>
                      <h3 className="text-lg font-bold text-[#fcd400]">Input Manual</h3>
                      <div className="w-12" />
                    </div>
                    <div className="w-full space-y-4">
                      <input
                        ref={manualInputRef} type="number" inputMode="numeric" placeholder="Nomor NIS..." value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && executeScan(scanInput)}
                        className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-5 text-2xl font-black text-center focus:border-[#fcd400] outline-none transition-colors placeholder:text-white/30" autoFocus
                      />
                      <button
                        onClick={() => executeScan(scanInput)} disabled={!scanInput || isProcessing}
                        className="w-full bg-[#fcd400] text-[#001f3f] py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-white transition-colors disabled:opacity-50 active:scale-95"
                      >
                        {isProcessing ? <Loader2 size={24} className="animate-spin" /> : "KONFIRMASI"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {errorMsg && (
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-[#ffdad6] bg-[#ba1a1a]/80 py-3 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm">
                  <AlertCircle size={18} /> {errorMsg}
                </motion.p>
              )}
            </div>
          </motion.main>
        )}

        {/* ================= LAYAR 2: SUCCESS ================= */}
        {screen === "SUCCESS" && (
          <motion.main key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-6 text-center transform-gpu">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#10b981]/20 flex items-center justify-center mb-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }} className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#10b981] flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.2 }} strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              {scanData?.type === "IN" ? "Selamat Datang," : "Sampai Jumpa,"} <br />
              <span className="text-[#fcd400]">{scanData?.student.name}!</span>
            </h1>
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg md:text-xl text-white font-bold px-6 py-2 bg-white/10 rounded-full border border-white/20">Kelas {scanData?.student.class}</p>
              <p className="text-base text-white/80 max-w-md font-medium mt-2">
                {scanData?.type === "IN"
                  ? "Selamat menikmati layanan perpustakaan digital kami. Mari tingkatkan literasi hari ini!"
                  : "Terima kasih atas kunjungannya. Jangan lupa mengisi ulasan sebelum kembali ke kelas!"}
              </p>
            </div>
          </motion.main>
        )}

        {/* ================= LAYAR 3: FEEDBACK RATING ================= */}
        {screen === "FEEDBACK_RATING" && (
          <motion.main key="feedback1" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.3 }} className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-5xl px-6 transform-gpu">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">Bagaimana pengalamanmu di <br /> perpustakaan hari ini?</h1>
              <p className="text-lg text-[#afc8f0]">Tap salah satu emoji untuk membantu kami.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl">
              {[
                { val: 1, emoji: "😡", label: "Buruk" },
                { val: 2, emoji: "😐", label: "Biasa" },
                { val: 3, emoji: "😊", label: "Bagus" },
                { val: 4, emoji: "😍", label: "Luar Biasa" },
              ].map((item) => (
                <button key={item.val} onClick={() => handleRatingSelect(item.val)} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[32px] p-6 md:p-8 flex flex-col items-center justify-center gap-3 hover:bg-[#fcd400]/20 hover:border-[#fcd400] transition-colors group shadow-lg active:scale-95">
                  <span className="text-6xl md:text-[80px] drop-shadow-xl">{item.emoji}</span>
                  <span className="text-lg md:text-xl font-bold text-white mt-2">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.main>
        )}

        {/* ================= LAYAR 4: FEEDBACK DETAIL ================= */}
        {screen === "FEEDBACK_DETAIL" && (
          <motion.main key="feedback2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }} className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-6 transform-gpu">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Ceritakan lebih lanjut (Opsional)</h1>
              <p className="text-base text-[#afc8f0]">Apa yang membuatmu merasa demikian?</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 w-full max-w-3xl mb-10">
              {reasonsList.map((reason) => {
                const isSelected = selectedReasons.includes(reason.id);
                return (
                  <button key={reason.id} onClick={() => isSelected ? setSelectedReasons(p => p.filter(r => r !== reason.id)) : setSelectedReasons(p => [...p, reason.id])} className={`px-5 py-3 md:px-6 md:py-4 rounded-full font-bold text-sm md:text-lg flex items-center gap-2 md:gap-3 transition-colors ${isSelected ? 'bg-[#fcd400] text-[#001f3f]' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}>
                    <span className="text-xl">{reason.icon}</span> {reason.text}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4 w-full justify-center">
              <button onClick={handleSkipFeedback} className="px-6 py-3 md:px-8 md:py-4 rounded-2xl border-2 border-white/30 text-white font-bold text-base hover:bg-white/10 transition-colors">Lewati</button>
              <button onClick={handleFinalSubmit} className="px-8 py-3 md:px-12 md:py-4 rounded-2xl bg-[#fcd400] text-[#001f3f] font-black text-lg hover:bg-white transition-colors flex items-center gap-2 shadow-lg">Kirim Feedback <Send size={20} /></button>
            </div>
          </motion.main>
        )}

        {/* ================= LAYAR 5: UCAPAN TERIMA KASIH & LOTTIE ================= */}
        {screen === "THANK_YOU" && (
          <motion.main key="thankyou" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-6 text-center transform-gpu">

            <div className="w-64 h-64 md:w-80 md:h-80 mb-2 flex items-center justify-center">
              {thanksAnimationData ? (
                <Lottie
                  animationData={thanksAnimationData}
                  loop={false}
                  onComplete={resetKiosk}
                  className="w-full h-full"
                />
              ) : (
                <Loader2 size={48} className="text-[#fcd400] animate-spin" />
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#fcd400] to-white mb-4 drop-shadow-lg">
              Terima Kasih atas Kunjungan Anda!
            </h1>
            <p className="text-lg md:text-xl text-[#afc8f0] font-medium max-w-2xl leading-relaxed">
              Masukan Anda sangat berharga bagi kami. <br />
              Kami menantikan kehadiran Anda kembali di Perpustakaan SMPN 1 Banjar.
            </p>

          </motion.main>
        )}

      </AnimatePresence>

      {/* TICKER (TETAP AMAN & RINGAN) */}
      <footer className="absolute bottom-0 z-20 w-full bg-[#001f3f]/80 backdrop-blur-md border-t border-white/10 py-3 overflow-hidden pointer-events-none">
        <div className="flex whitespace-nowrap items-center font-bold text-sm md:text-base text-white/80 animate-ticker">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-8 px-4">
              <span className="flex items-center gap-2 text-[#fcd400]"><BookOpen size={18} /> Perpustakaan SMPN 1 Banjar</span>
              <span>•</span>
              <span>Sistem Peminjaman Terintegrasi</span>
              <span>•</span>
              <span className="flex items-center gap-2 text-[#afc8f0]"><Sparkles size={18} /> Budayakan Membaca Setiap Hari!</span>
              <span>•</span>
            </div>
          ))}
        </div>
      </footer>

      {/* CSS KHUSUS PERFORMA TINGGI */}
      <style jsx global>{`
        @keyframes ticker { 0% { transform: translate3d(0, 0, 0); } 100% { transform: translate3d(-50%, 0, 0); } }
        .animate-ticker { width: fit-content; animation: ticker 25s linear infinite; will-change: transform; }
        @keyframes blob { 0%, 100% { transform: translate3d(0px, 0px, 0) scale(1); } 33% { transform: translate3d(30px, -50px, 0) scale(1.1); } 66% { transform: translate3d(-20px, 20px, 0) scale(0.9); } }
        .animate-blob { animation: blob 12s infinite ease-in-out; will-change: transform; }
        .animation-delay-4000 { animation-delay: 4s; }
        @keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient-x { animation: gradient-x 4s linear infinite; }
        @keyframes laser { 0% { transform: translateY(-10px); } 50% { transform: translateY(160px); } 100% { transform: translateY(-10px); } }
        .animate-laser { animation: laser 2s infinite ease-in-out; will-change: transform; }
        input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}

function Loader2({ size = 24, className = "" }: { size?: number, className?: string }) {
  return <div className={className}><Scan size={size} /></div>;
}