"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import type { Frame } from "@/types";

export function FrameBox({
  frame,
  zoom,
  onMove,
  onResize,
  onRename,
  onDelete,
}: {
  frame: Frame;
  zoom: number;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const dragOrigin = useRef<{ x: number; y: number; fx: number; fy: number } | null>(null);
  const resizeOrigin = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(frame.name);

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    dragOrigin.current = { x: e.clientX, y: e.clientY, fx: frame.x, fy: frame.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragOrigin.current) return;
    const dx = (e.clientX - dragOrigin.current.x) / zoom;
    const dy = (e.clientY - dragOrigin.current.y) / zoom;
    onMove(frame.id, dragOrigin.current.fx + dx, dragOrigin.current.fy + dy);
  }

  function handlePointerUp() {
    dragOrigin.current = null;
  }

  function handleResizeDown(e: React.PointerEvent) {
    e.stopPropagation();
    resizeOrigin.current = { x: e.clientX, y: e.clientY, w: frame.width, h: frame.height };
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handleResizeMove(e: React.PointerEvent) {
    if (!resizeOrigin.current) return;
    const dx = (e.clientX - resizeOrigin.current.x) / zoom;
    const dy = (e.clientY - resizeOrigin.current.y) / zoom;
    onResize(
      frame.id,
      Math.max(240, resizeOrigin.current.w + dx),
      Math.max(180, resizeOrigin.current.h + dy)
    );
  }

  return (
    <div
      className="absolute rounded-xl border-2 border-dashed"
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
        borderColor: `${frame.color}80`,
        backgroundColor: `${frame.color}0d`,
        zIndex: 0,
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="group/frame absolute -top-7 left-0 flex cursor-grab items-center gap-2 active:cursor-grabbing"
      >
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onBlur={() => {
              setEditing(false);
              onRename(frame.id, name || "Frame");
            }}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="rounded bg-transparent text-sm font-medium outline-none"
            style={{ color: frame.color }}
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            className="text-sm font-medium"
            style={{ color: frame.color }}
          >
            {frame.name}
          </span>
        )}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(frame.id)}
          className="opacity-0 transition-opacity group-hover/frame:opacity-60 hover:!opacity-100"
        >
          <Trash2 className="size-3.5" style={{ color: frame.color }} />
        </button>
      </div>

      <div
        onPointerDown={handleResizeDown}
        onPointerMove={handleResizeMove}
        onPointerUp={() => (resizeOrigin.current = null)}
        className="absolute right-0 bottom-0 size-4 cursor-se-resize opacity-40 hover:opacity-80"
      >
        <div
          className="absolute right-1 bottom-1 size-2 rounded-sm border-r-2 border-b-2"
          style={{ borderColor: frame.color }}
        />
      </div>
    </div>
  );
}
