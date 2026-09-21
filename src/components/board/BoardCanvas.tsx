"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { StickyNote } from "@/components/board/StickyNote";
import { FrameBox } from "@/components/board/FrameBox";
import { ConnectionsLayer } from "@/components/board/ConnectionsLayer";
import { PresenceCursors } from "@/components/board/PresenceCursors";
import { ZoomControls } from "@/components/board/ZoomControls";
import { clampZoom, screenToWorld, type Viewport } from "@/lib/canvas-math";
import { randomNoteColor } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type { Connection, CursorPresence, Frame, Note, ToolId } from "@/types";

interface BoardCanvasActions {
  addNote: (partial?: Partial<{ x: number; y: number; text: string; color: string }>) => void;
  updateNoteText: (id: string, text: string) => void;
  moveNote: (id: string, x: number, y: number) => void;
  commitNoteMove: (id: string, x: number, y: number) => void;
  resizeNote: (id: string, width: number, height: number) => void;
  setNoteColor: (id: string, color: string) => void;
  bringToFront: (id: string) => void;
  deleteNote: (id: string) => void;
  addFrame: (partial?: Partial<Frame>) => void;
  updateFrame: (id: string, patch: Partial<Frame>) => void;
  deleteFrame: (id: string) => void;
  addConnection: (fromId: string, toId: string) => void;
  deleteConnection: (id: string) => void;
  vote: (id: string, value: 1 | -1) => void;
  toggleStar: (id: string) => void;
  toggleReaction: (id: string, emoji: string) => void;
}

export function BoardCanvas({
  notes,
  frames,
  connections,
  tool,
  setTool,
  votingMode,
  peers,
  updateCursor,
  onOpenComments,
  actions,
  snapshotBeforeEdit,
}: {
  notes: Note[];
  frames: Frame[];
  connections: Connection[];
  tool: ToolId;
  setTool: (t: ToolId) => void;
  votingMode: boolean;
  peers: CursorPresence[];
  updateCursor: (x: number, y: number) => void;
  onOpenComments: (noteId: string) => void;
  actions: BoardCanvasActions;
  snapshotBeforeEdit: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [marquee, setMarquee] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const panState = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const spaceHeldRef = useRef(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    function keydown(e: KeyboardEvent) {
      if (e.code === "Space") {
        spaceHeldRef.current = true;
        setSpaceHeld(true);
      }
    }
    function keyup(e: KeyboardEvent) {
      if (e.code === "Space") {
        spaceHeldRef.current = false;
        setSpaceHeld(false);
      }
    }
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
    };
  }, []);

  const getRect = useCallback(() => containerRef.current!.getBoundingClientRect(), []);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const rect = getRect();
      const cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setViewport((v) => {
        const nextZoom = clampZoom(v.zoom * (1 - e.deltaY * 0.0015));
        const worldX = (cursor.x - v.x) / v.zoom;
        const worldY = (cursor.y - v.y) / v.zoom;
        return {
          zoom: nextZoom,
          x: cursor.x - worldX * nextZoom,
          y: cursor.y - worldY * nextZoom,
        };
      });
    } else {
      setViewport((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (e.button === 1 || spaceHeldRef.current) {
      panState.current = { x: e.clientX, y: e.clientY, vx: viewport.x, vy: viewport.y };
      setIsPanning(true);
      return;
    }
    if (connectFrom) {
      setConnectFrom(null);
      return;
    }

    const rect = getRect();
    const world = screenToWorld(e.clientX, e.clientY, rect, viewport);

    if (tool === "sticky" || tool === "text") {
      snapshotBeforeEdit();
      actions.addNote({ x: world.x - 110, y: world.y - 95, color: randomNoteColor() });
      setTool("select");
      return;
    }

    if (tool === "frame") {
      snapshotBeforeEdit();
      actions.addFrame({ x: world.x - 240, y: world.y - 180 });
      setTool("select");
      return;
    }

    if (tool === "select") {
      setSelectedIds(new Set());
      setMarquee({ x0: world.x, y0: world.y, x1: world.x, y1: world.y });
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (panState.current) {
      const dx = e.clientX - panState.current.x;
      const dy = e.clientY - panState.current.y;
      setViewport((v) => ({ ...v, x: panState.current!.vx + dx, y: panState.current!.vy + dy }));
      return;
    }
    if (marquee) {
      const rect = getRect();
      const world = screenToWorld(e.clientX, e.clientY, rect, viewport);
      setMarquee((m) => (m ? { ...m, x1: world.x, y1: world.y } : m));
      return;
    }
    const rect = getRect();
    const world = screenToWorld(e.clientX, e.clientY, rect, viewport);
    updateCursor(world.x, world.y);
  }

  function handlePointerUp() {
    if (panState.current) {
      panState.current = null;
      setIsPanning(false);
      return;
    }
    if (marquee) {
      const x0 = Math.min(marquee.x0, marquee.x1);
      const x1 = Math.max(marquee.x0, marquee.x1);
      const y0 = Math.min(marquee.y0, marquee.y1);
      const y1 = Math.max(marquee.y0, marquee.y1);
      const inside = notes.filter(
        (n) => n.x < x1 && n.x + n.width > x0 && n.y < y1 && n.y + n.height > y0
      );
      if (inside.length) setSelectedIds(new Set(inside.map((n) => n.id)));
      setMarquee(null);
    }
  }

  function handleSelect(id: string, additive: boolean) {
    setSelectedIds((prev) => {
      if (additive) {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }
      if (prev.has(id) && prev.size > 1) return prev;
      return new Set([id]);
    });
    actions.bringToFront(id);
  }

  function handleDragBy(id: string, dx: number, dy: number) {
    const targets = selectedIds.has(id) && selectedIds.size > 1 ? Array.from(selectedIds) : [id];
    for (const tid of targets) {
      const n = notes.find((nn) => nn.id === tid);
      if (!n) continue;
      actions.moveNote(tid, n.x + dx, n.y + dy);
    }
  }

  function handleDragEnd() {
    const targets = Array.from(selectedIds);
    for (const tid of targets) {
      const n = notes.find((nn) => nn.id === tid);
      if (n) actions.commitNoteMove(tid, n.x, n.y);
    }
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.size === 0) return;
        snapshotBeforeEdit();
        selectedIds.forEach((id) => actions.deleteNote(id));
        setSelectedIds(new Set());
      }
      if (e.key === "Escape") {
        setSelectedIds(new Set());
        setConnectFrom(null);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIds, actions, snapshotBeforeEdit]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "canvas-grid relative h-full w-full touch-none overflow-hidden bg-background [background-size:24px_24px]",
        isPanning && "cursor-grabbing",
        spaceHeld && !isPanning && "cursor-grab",
        tool === "sticky" && "cursor-copy",
        tool === "frame" && "cursor-copy"
      )}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div
        className="absolute top-0 left-0 h-0 w-0"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {frames.map((f) => (
          <FrameBox
            key={f.id}
            frame={f}
            zoom={viewport.zoom}
            onMove={(id, x, y) => actions.updateFrame(id, { x, y })}
            onResize={(id, width, height) => actions.updateFrame(id, { width, height })}
            onRename={(id, name) => actions.updateFrame(id, { name })}
            onDelete={actions.deleteFrame}
          />
        ))}

        <ConnectionsLayer
          connections={connections}
          notes={notes}
          onDelete={actions.deleteConnection}
        />

        <AnimatePresence>
          {notes.map((note) => (
            <StickyNote
              key={note.id}
              note={note}
              selected={selectedIds.has(note.id)}
              zoom={viewport.zoom}
              tool={tool}
              votingMode={votingMode}
              isConnectSource={connectFrom === note.id}
              onSelect={handleSelect}
              onDragBy={(dx, dy) => handleDragBy(note.id, dx, dy)}
              onDragEnd={handleDragEnd}
              onResize={actions.resizeNote}
              onOpenComments={onOpenComments}
              onConnectClick={(id) => {
                if (!connectFrom) {
                  setConnectFrom(id);
                } else if (connectFrom === id) {
                  setConnectFrom(null);
                } else {
                  actions.addConnection(connectFrom, id);
                  setConnectFrom(null);
                }
              }}
              onBeforeEdit={snapshotBeforeEdit}
              onTextChange={actions.updateNoteText}
              onColorChange={actions.setNoteColor}
              onDelete={actions.deleteNote}
              onVote={actions.vote}
              onToggleStar={actions.toggleStar}
              onToggleReaction={actions.toggleReaction}
            />
          ))}
        </AnimatePresence>

        <PresenceCursors peers={peers} />

        {marquee && (
          <div
            className="absolute rounded border border-accent-violet bg-accent-violet/10"
            style={{
              left: Math.min(marquee.x0, marquee.x1),
              top: Math.min(marquee.y0, marquee.y1),
              width: Math.abs(marquee.x1 - marquee.x0),
              height: Math.abs(marquee.y1 - marquee.y0),
            }}
          />
        )}
      </div>

      {tool === "arrow" && connectFrom && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background shadow">
          Clica em outra nota pra conectar
        </div>
      )}

      <ZoomControls
        zoom={viewport.zoom}
        onZoomIn={() => setViewport((v) => ({ ...v, zoom: clampZoom(v.zoom * 1.2) }))}
        onZoomOut={() => setViewport((v) => ({ ...v, zoom: clampZoom(v.zoom / 1.2) }))}
        onReset={() => setViewport({ x: 0, y: 0, zoom: 1 })}
      />
    </div>
  );
}
