import { queryProposals } from "@/lib/queries";
import { GovernanceClient } from "@/components/governance/GovernanceClient";

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const proposals = await queryProposals();
  const initial = proposals.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    status: p.status,
    quorum: p.quorum,
    votesFor: p.votesFor,
    votesAgainst: p.votesAgainst,
    endsAt: p.endsAt.toISOString(),
  }));
  return <GovernanceClient initial={initial} />;
}
