"use client";

import type { Connection, Note } from "@/types";

export function ConnectionsLayer({
  connections,
  notes,
  onDelete,
}: {
  connections: Connection[];
  notes: Note[];
  onDelete: (id: string) => void;
}) {
  const byId = new Map(notes.map((n) => [n.id, n]));

  return (
    <svg
      className="pointer-events-none absolute top-0 left-0 overflow-visible"
      style={{ width: 1, height: 1 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" className="fill-accent-violet" />
        </marker>
      </defs>
      {connections.map((c) => {
        const from = byId.get(c.fromNoteId);
        const to = byId.get(c.toNoteId);
        if (!from || !to) return null;
        const x1 = from.x + from.width / 2;
        const y1 = from.y + from.height / 2;
        const x2 = to.x + to.width / 2;
        const y2 = to.y + to.height / 2;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        return (
          <g key={c.id}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth={2}
              className="stroke-accent-violet/70"
              markerEnd="url(#arrowhead)"
            />
            <circle
              cx={mx}
              cy={my}
              r={7}
              className="pointer-events-auto fill-background stroke-accent-violet/70 opacity-0 hover:opacity-100"
              style={{ cursor: "pointer" }}
              onClick={() => onDelete(c.id)}
            />
          </g>
        );
      })}
    </svg>
  );
}
