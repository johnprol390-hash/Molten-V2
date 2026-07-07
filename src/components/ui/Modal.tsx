"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  bottomSheetOnMobile = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  bottomSheetOnMobile?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "panel relative z-10 w-full max-w-md p-5 shadow-panel",
              bottomSheetOnMobile && "max-sm:absolute max-sm:bottom-0 max-sm:max-w-full max-sm:rounded-b-none",
              className,
            )}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold">{title}</h2>
                <button onClick={onClose} className="rounded p-1 text-white/40 hover:text-white" aria-label="Close">
                  <X size={18} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
