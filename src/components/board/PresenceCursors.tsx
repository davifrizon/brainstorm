"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2 } from "lucide-react";
import type { CursorPresence } from "@/types";

export function PresenceCursors({ peers }: { peers: CursorPresence[] }) {
  return (
    <AnimatePresence>
      {peers.map((p) => (
        <motion.div
          key={p.userId}
          className="pointer-events-none absolute z-[999] flex items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, left: p.x, top: p.y }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        >
          <MousePointer2
            className="size-4 drop-shadow"
            fill={p.color}
            stroke="white"
            strokeWidth={1}
          />
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white shadow"
            style={{ backgroundColor: p.color }}
          >
            {p.displayName}
          </span>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
