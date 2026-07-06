import "server-only";
import WebSocket from "ws";
import type { WsEvent } from "./ws-events";

// Publish an event to the realtime server for fan-out to all connected clients.
// Opens a short-lived connection; silently no-ops if the ws-server is down so
// trade execution never fails just because realtime is unavailable.
export function publish(event: WsEvent) {
  const url = process.env.WS_INTERNAL_URL ?? process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4001";
  return new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    try {
      const ws = new WebSocket(url);
      const timer = setTimeout(() => {
        try {
          ws.terminate();
        } catch {
          /* noop */
        }
        finish();
      }, 800);
      ws.on("open", () => {
        ws.send(JSON.stringify({ type: "publish", event }), () => {
          clearTimeout(timer);
          ws.close();
          finish();
        });
      });
      ws.on("error", () => {
        clearTimeout(timer);
        finish();
      });
    } catch {
      finish();
    }
  });
}
