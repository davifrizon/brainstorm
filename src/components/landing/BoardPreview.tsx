"use client";

import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";

const NOTES = [
  { text: "Viagem surpresa pra praia 🏖️", color: "#fde68a", x: "8%", y: "18%", rot: -4 },
  { text: "App pra dividir conta do rolê", color: "#b8dcf5", x: "38%", y: "8%", rot: 3 },
  { text: "Torneio de Mario Kart 🏆", color: "#f7b8c4", x: "62%", y: "32%", rot: -2 },
  { text: "Podcast sobre nada", color: "#d9c8f5", x: "12%", y: "56%", rot: 2 },
  { text: "Dia de jogos + pizza 🍕", color: "#b7e8d3", x: "42%", y: "60%", rot: -3 },
];

const CURSORS = [
  { name: "Lucas", color: "#a78bfa", x: "70%", y: "12%", delay: 0 },
  { name: "Maria", color: "#34d399", x: "20%", y: "45%", delay: 1.6 },
  { name: "Pedro", color: "#fbbf24", x: "55%", y: "70%", delay: 3.1 },
];

export function BoardPreview() {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-border bg-card/60 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="canvas-grid absolute inset-0 opacity-40 [background-size:22px_22px]" />
      <div className="relative aspect-[16/9] w-full sm:aspect-[16/8]">
        {NOTES.map((n, i) => (
          <motion.div
            key={n.text}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: "easeOut" }}
            whileHover={{ rotate: 0, scale: 1.04 }}
            style={{
              left: n.x,
              top: n.y,
              backgroundColor: n.color,
              rotate: n.rot,
            }}
            className="absolute w-[34%] max-w-[220px] rounded-lg p-3 text-[13px] font-medium text-black/80 shadow-lg sm:p-4 sm:text-sm"
          >
            {n.text}
          </motion.div>
        ))}

        {CURSORS.map((c) => (
          <motion.div
            key={c.name}
            className="absolute hidden items-center gap-1.5 sm:flex"
            initial={{ left: c.x, top: c.y }}
            animate={{
              left: [c.x, `calc(${c.x} + 6%)`, c.x],
              top: [c.y, `calc(${c.y} + 5%)`, c.y],
            }}
            transition={{
              duration: 5,
              delay: c.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <MousePointer2
              className="size-4 drop-shadow"
              fill={c.color}
              stroke="white"
              strokeWidth={1}
            />
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white shadow"
              style={{ backgroundColor: c.color }}
            >
              {c.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
