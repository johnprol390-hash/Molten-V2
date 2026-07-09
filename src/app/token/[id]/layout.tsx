import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const { prisma } = await import("@/lib/db");
    const token = await prisma.token.findFirst({
      where: { OR: [{ id: params.id }, { contractAddress: params.id }] },
    });

    if (!token) {
      return { title: "Token Not Found — Molten V2" };
    }

    return {
      title: `${token.name} ($${token.ticker}) — Molten V2`,
      description: token.description,
      openGraph: {
        title: `${token.name} ($${token.ticker})`,
        description: `${token.description} | Market Cap: $${token.marketCap.toFixed(0)} | ${token.bondingProgress.toFixed(0)}% bonded`,
      },
    };
  } catch {
    return { title: "Molten V2" };
  }
}

export default function TokenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
