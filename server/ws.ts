import { WebSocketServer, WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";

// Standalone realtime server. Broadcasts price ticks, simulated trades and
// graduation events to all connected clients over channels. In production this
// process is where the Hyperliquid WS feed / Redis pub-sub fan-out would live.

const prisma = new PrismaClient();
const PORT = Number(process.env.WS_PORT ?? 4001);

const wss = new WebSocketServer({ port: PORT });
console.log(`⚡ Molten realtime server listening on ws://localhost:${PORT}`);

interface TokenLite {
  id: string;
  ticker: string;
  price: number;
}

let tokens: TokenLite[] = [];

async function loadTokens() {
  const rows = await prisma.token.findMany({ select: { id: true, ticker: true, price: true } });
  tokens = rows.map((r) => ({ id: r.id, ticker: r.ticker, price: r.price }));
  console.log(`  loaded ${tokens.length} tokens`);
}

function broadcast(data: unknown) {
  const msg = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  }
}

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "hello", ts: Date.now(), tokens: tokens.length }));
});

// Price ticks — jitter each token's price with a slight random walk.
setInterval(() => {
  if (tokens.length === 0) return;
  const prices: Record<string, number> = {};
  for (const t of tokens) {
    t.price = Math.max(1e-12, t.price * (1 + (Math.random() - 0.5) * 0.02));
    prices[t.id] = t.price;
  }
  broadcast({ type: "tick", ts: Date.now(), prices });
}, 1200);

// Simulated live trades.
setInterval(() => {
  if (tokens.length === 0) return;
  const t = tokens[Math.floor(Math.random() * tokens.length)];
  const side = Math.random() < 0.58 ? "buy" : "sell";
  const amountHype = +(Math.random() * 20 + 0.05).toFixed(3);
  broadcast({
    type: "trade",
    ts: Date.now(),
    trade: {
      tokenId: t.id,
      ticker: t.ticker,
      side,
      amountHype,
      usd: amountHype * 32,
      price: t.price,
      wallet: "0x" + Math.random().toString(16).slice(2, 10) + "…",
    },
  });
}, 2600);

async function main() {
  await loadTokens();
  setInterval(loadTokens, 60_000);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

process.on("SIGINT", () => {
  wss.close();
  prisma.$disconnect();
  process.exit(0);
});
