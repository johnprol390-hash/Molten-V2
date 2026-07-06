import Link from "next/link";
import { queryToken, queryTrades, queryHolders } from "@/lib/queries";
import { TokenTerminal } from "@/components/token/TokenTerminal";

export const dynamic = "force-dynamic";

export default async function TokenPage({ params }: { params: { id: string } }) {
  const token = await queryToken(params.id);
  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-lg font-semibold">Token not found</p>
        <Link href="/discover" className="mt-3 inline-block text-sm text-mint hover:underline">
          Back to Discover
        </Link>
      </div>
    );
  }
  const [trades, holders] = await Promise.all([queryTrades(params.id), queryHolders(params.id)]);
  return <TokenTerminal token={token} trades={trades} holders={holders} />;
}
