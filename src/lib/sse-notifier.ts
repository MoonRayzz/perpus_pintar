// src/lib/sse-notifier.ts
//
// Modul ini menyimpan daftar koneksi SSE yang aktif (in-memory).
// Menggunakan globalThis agar Set tidak hilang saat Turbopack melakukan HMR (hot-reload).
//
// ⚠️  Hanya bekerja di lingkungan single-process (dev / self-hosted / VPS).
//     Di Vercel Serverless, setiap request adalah proses baru — gunakan Pusher/Ably.

const g = globalThis as typeof globalThis & {
  _sseClients?: Set<ReadableStreamDefaultController>;
};

if (!g._sseClients) {
  g._sseClients = new Set();
}

export const sseClients = g._sseClients;

export type SSEEventType = "check-in" | "check-out";

/**
 * Kirim event ke SEMUA tab dashboard yang sedang terbuka.
 * Dipanggil dari kiosk/actions.ts setelah scan berhasil.
 */
export function notifyDashboard(eventType: SSEEventType) {
  const payload = JSON.stringify({ type: eventType, timestamp: Date.now() });
  const message = `data: ${payload}\n\n`;
  const encoder = new TextEncoder();

  sseClients.forEach((controller) => {
    try {
      controller.enqueue(encoder.encode(message));
    } catch {
      // Koneksi sudah mati — hapus dari daftar
      sseClients.delete(controller);
    }
  });
}
