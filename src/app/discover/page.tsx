import { queryTokens } from "@/lib/queries";
import { DiscoverClient } from "@/components/discover/DiscoverClient";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const tokens = await queryTokens();
  return <DiscoverClient tokens={tokens} />;
}
