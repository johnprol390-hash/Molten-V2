import "server-only";
import type { WsEvent } from "./ws-events";

// Publish an event to the realtime server's HTTP hook for fan-out to all
// connected WebSocket clients. Uses fetch (no ws client in the app bundle) and
// never throws — trade execution must not fail just because realtime is down.
function httpBase(): string {
  const url = process.env.WS_INTERNAL_URL ?? process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4001";
  return url.replace(/^ws/, "http");
}

export async function publish(event: WsEvent): Promise<void> {
  try {
    await fetch(`${httpBase()}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      // Don't let a slow/absent realtime server block the request for long.
      signal: AbortSignal.timeout(800),
    });
  } catch {
    /* realtime unavailable — ignore */
  }
}
