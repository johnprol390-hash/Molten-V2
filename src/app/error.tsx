"use client";

import Link from "next/link";

// Route-level error boundary so an unexpected runtime error renders a friendly
// page instead of bubbling into a platform-level failure.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="mb-3 text-4xl">⚠️</div>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-white/50">
        An unexpected error occurred while loading this view. This is usually transient.
      </p>
      <div className="mt-5 flex gap-3">
        <button onClick={reset} className="rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-base-900 hover:bg-mint-400">
          Try again
        </button>
        <Link href="/" className="rounded-lg border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold hover:border-mint/40">
          Go home
        </Link>
      </div>
    </div>
  );
}
