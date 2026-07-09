"use client";

import { useEffect } from "react";

/**
 * Keeps the simulation engine ticking on Vercel Hobby (no per-minute cron).
 * Polls /api/sim/tick while any page is open.
 */
export function SimTickProvider() {
  useEffect(() => {
    const tick = () => {
      fetch("/api/sim/tick").catch(() => {});
    };

    tick();
    const interval = setInterval(tick, 10000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
