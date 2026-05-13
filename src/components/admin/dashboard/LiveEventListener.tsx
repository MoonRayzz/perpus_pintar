// src/components/admin/dashboard/LiveEventListener.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Wifi, WifiOff, Zap } from "lucide-react";

type ConnectionStatus = "connecting" | "connected" | "disconnected";
type LastEvent = { type: "check-in" | "check-out"; timestamp: number } | null;

export default function LiveEventListener() {
  const router = useRouter();
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [lastEvent, setLastEvent] = useState<LastEvent>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let eventSource: EventSource;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      setStatus("connecting");
      eventSource = new EventSource("/api/live-visits");

      eventSource.onopen = () => {
        setStatus("connected");
      };

      eventSource.onmessage = (e) => {
        const data = JSON.parse(e.data) as { type: string; timestamp: number };

        if (data.type === "connected") {
          setStatus("connected");
          return;
        }

        // ✅ Ada scan baru! Trigger refresh data Server Components
        setLastEvent(data as LastEvent);

        // Flash efek hijau sebentar
        setIsFlashing(true);
        if (flashTimeout.current) clearTimeout(flashTimeout.current);
        flashTimeout.current = setTimeout(() => setIsFlashing(false), 1500);

        // Router refresh: Next.js re-fetch semua Server Component data (query DB)
        router.refresh();
      };

      eventSource.onerror = () => {
        setStatus("disconnected");
        eventSource.close();
        // Auto-reconnect setelah 5 detik
        reconnectTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimeout);
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
    };
  }, [router]);

  // Label event terakhir
  const lastEventLabel =
    lastEvent?.type === "check-in" ? "Ada siswa masuk" : "Ada siswa keluar";

  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1 rounded-full transition-all duration-500 ${
        isFlashing
          ? "bg-[#dcfce7] ring-2 ring-[#10b981]/30"
          : status === "connected"
          ? "bg-[#e5eeff]"
          : status === "disconnected"
          ? "bg-[#ffdad6]"
          : "bg-[#fff8e1]"
      }`}
    >
      {/* Status dot */}
      {status === "connected" ? (
        <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shrink-0" />
      ) : status === "connecting" ? (
        <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse shrink-0" />
      ) : (
        <span className="w-2 h-2 rounded-full bg-[#ba1a1a] shrink-0" />
      )}

      {/* Label utama */}
      <span
        className={`text-xs font-semibold transition-colors ${
          isFlashing
            ? "text-[#16a34a]"
            : status === "connected"
            ? "text-[#001f3f]"
            : status === "disconnected"
            ? "text-[#ba1a1a]"
            : "text-[#6e5c00]"
        }`}
      >
        {isFlashing ? (
          <span className="flex items-center gap-1">
            <Zap size={10} className="fill-current" /> Diperbarui!
          </span>
        ) : status === "connected" ? (
          "Live"
        ) : status === "disconnected" ? (
          "Terputus"
        ) : (
          "Menghubungkan..."
        )}
      </span>

      {/* Info event terakhir — tampil saat tidak sedang flash */}
      {lastEvent && !isFlashing && status === "connected" && (
        <>
          <span className="text-[#c4c6cf] text-xs">·</span>
          <span className="text-xs text-[#43474e] flex items-center gap-1">
            <Wifi size={10} />
            {lastEventLabel}
          </span>
        </>
      )}

      {/* Info status disconnected */}
      {status === "disconnected" && (
        <>
          <span className="text-[#c4c6cf] text-xs">·</span>
          <span className="text-xs text-[#ba1a1a] flex items-center gap-1">
            <WifiOff size={10} /> Mencoba ulang...
          </span>
        </>
      )}
    </div>
  );
}
