"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";

// Periodically drives the tracking engine (copy trades + buy alerts) for the
// authenticated user and surfaces a lightweight toast when something fires.
export function EngineTick() {
  const connected = useAppStore((s) => s.wallets.length > 0);
  const [toast, setToast] = useState<string | null>(null);
  const running = useRef(false);

  useEffect(() => {
    if (!connected) return;
    let cancelled = false;

    const tick = async () => {
      if (running.current) return;
      running.current = true;
      try {
        const res = await fetch("/api/engine/tick", { method: "POST" });
        const d = await res.json();
        if (!cancelled && (d.alerts > 0 || d.copies > 0) && d.messages?.length) {
          setToast(d.messages[0]);
          setTimeout(() => setToast(null), 4000);
        }
      } catch {
        /* ignore */
      } finally {
        running.current = false;
      }
    };

    const first = setTimeout(tick, 4000);
    const interval = setInterval(tick, 25000);
    return () => {
      cancelled = true;
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [connected]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-16 left-1/2 z-[90] -translate-x-1/2 rounded-full border border-mint/30 bg-base-850/95 px-4 py-2 text-xs font-medium text-mint shadow-panel backdrop-blur"
        >
          <span className="flex items-center gap-1.5">
            <Zap size={12} /> {toast}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
