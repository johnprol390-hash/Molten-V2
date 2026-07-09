import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const alt = "Molten Token";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { id: string } }) {
  try {
    const token = await prisma.token.findFirst({
      where: { OR: [{ id: params.id }, { contractAddress: params.id }] },
    });

    if (!token) {
      return new ImageResponse(
        (
          <div
            style={{
              background: "#0A0A0A",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FAFAFA",
              fontSize: 48,
            }}
          >
            🌋 Molten V2
          </div>
        ),
        { ...size }
      );
    }

    const mcap =
      token.marketCap >= 1000
        ? `$${(token.marketCap / 1000).toFixed(1)}K`
        : `$${token.marketCap.toFixed(2)}`;

    return new ImageResponse(
      (
        <div
          style={{
            background: "#0A0A0A",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 60, marginBottom: 20 }}>🌋</div>
          <div style={{ fontSize: 48, fontWeight: "bold", color: "#FAFAFA" }}>
            {token.name}
          </div>
          <div style={{ fontSize: 32, color: "#97FCE4", marginTop: 8 }}>
            ${token.ticker}
          </div>
          <div style={{ fontSize: 24, color: "#A1A1AA", marginTop: 16 }}>
            Market Cap: {mcap}
          </div>
          <div style={{ fontSize: 18, color: "#FF6B35", marginTop: 8 }}>
            {token.bondingProgress.toFixed(0)}% bonded
          </div>
        </div>
      ),
      { ...size }
    );
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            background: "#0A0A0A",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#97FCE4",
            fontSize: 48,
          }}
        >
          🌋 Molten V2
        </div>
      ),
      { ...size }
    );
  }
}
