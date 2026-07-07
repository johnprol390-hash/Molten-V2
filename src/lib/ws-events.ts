// Typed, versioned realtime events shared by the ws-server and the client.
export type WsEvent =
  | { type: "hello"; ts: number; tokens: number }
  | { type: "tick"; ts: number; prices: Record<string, number> }
  | {
      type: "trade";
      ts: number;
      trade: {
        tokenId: string;
        ticker: string;
        side: "buy" | "sell";
        amountHype: number;
        usd: number;
        price: number;
        wallet: string;
      };
    }
  | { type: "graduation"; ts: number; tokenId: string; ticker: string };
