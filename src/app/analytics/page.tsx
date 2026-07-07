import { queryAnalytics } from "@/lib/queries";
import { AnalyticsClient } from "@/components/analytics/AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const metrics = await queryAnalytics();
  return <AnalyticsClient metrics={metrics} />;
}
