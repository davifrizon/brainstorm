"use client";

import { Minus, Plus, Maximize } from "lucide-react";

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <div className="absolute right-5 bottom-6 z-20 flex items-center gap-0.5 rounded-xl border border-border bg-card/90 p-1 shadow-lg backdrop-blur">
      <button
        type="button"
        onClick={onZoomOut}
        aria-label="Diminuir zoom"
        className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Minus className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onReset}
        aria-label="Redefinir zoom para 100%"
        className="min-w-11 px-1 text-center text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        aria-label="Aumentar zoom"
        className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Plus className="size-3.5" />
      </button>
      <div className="mx-0.5 h-5 w-px bg-border" />
      <button
        type="button"
        onClick={onReset}
        aria-label="Ajustar zoom pra caber tudo"
        className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Maximize className="size-3.5" />
      </button>
    </div>
  );
}
