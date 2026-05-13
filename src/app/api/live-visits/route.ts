// src/app/api/live-visits/route.ts
//
// API Route SSE — browser dashboard konek ke sini dan menunggu event.
// Saat notifyDashboard() dipanggil dari kiosk/actions.ts,
// semua browser yang konek akan langsung menerima event tanpa polling.

import { sseClients } from "@/lib/sse-notifier";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // SSE membutuhkan Node.js runtime, bukan Edge

export async function GET() {
  const encoder = new TextEncoder();

  // Gunakan variabel lokal agar bisa di-cleanup di cancel()
  let controller: ReadableStreamDefaultController;
  let heartbeatId: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
      sseClients.add(controller);

      // Konfirmasi koneksi ke client
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
      );

      // Heartbeat setiap 25 detik agar koneksi tidak di-timeout oleh proxy/load-balancer
      heartbeatId = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          // Stream sudah tertutup
          clearInterval(heartbeatId);
          sseClients.delete(controller);
        }
      }, 25000);
    },

    cancel() {
      // Dipanggil saat browser menutup tab / navigasi keluar
      clearInterval(heartbeatId);
      sseClients.delete(controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Penting untuk Nginx agar tidak buffer SSE
    },
  });
}
