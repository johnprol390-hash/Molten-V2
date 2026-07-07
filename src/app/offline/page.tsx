export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="mb-3 text-4xl">📴</div>
      <h1 className="text-lg font-semibold">You&apos;re offline</h1>
      <p className="mt-2 text-sm text-white/50">
        Molten can&apos;t reach the network right now. Cached pages and your last-known prices are still
        available — reconnect to resume live trading.
      </p>
    </div>
  );
}
