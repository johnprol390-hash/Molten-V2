import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  let intervalId: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      const sendUpdate = async () => {
        try {
          const [tokens, events] = await Promise.all([
            prisma.token.findMany({
              orderBy: { updatedAt: "desc" },
              take: 10,
              select: {
                id: true,
                ticker: true,
                price: true,
                marketCap: true,
                bondingProgress: true,
                change24h: true,
                updatedAt: true,
              },
            }),
            prisma.tickerEvent.findMany({
              orderBy: { createdAt: "desc" },
              take: 5,
            }),
          ]);

          const data = JSON.stringify({ tokens, events, timestamp: Date.now() });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // connection may be closed
        }
      };

      sendUpdate();
      intervalId = setInterval(sendUpdate, 5000);

      // Trigger sim tick
      fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/sim/tick`).catch(() => {});
    },
    cancel() {
      clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
