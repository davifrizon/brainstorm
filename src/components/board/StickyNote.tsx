"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Palette,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { NOTE_COLORS } from "@/lib/colors";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Note, ToolId } from "@/types";

const QUICK_EMOJIS = ["🔥", "😂", "😍", "🤔", "😬", "👀"];

export function StickyNote({
  note,
  selected,
  zoom,
  tool,
  votingMode,
  isConnectSource,
  onSelect,
  onDragBy,
  onDragEnd,
  onResize,
  onOpenComments,
  onConnectClick,
  onBeforeEdit,
  onTextChange,
  onColorChange,
  onDelete,
  onVote,
  onToggleStar,
  onToggleReaction,
}: {
  note: Note;
  selected: boolean;
  zoom: number;
  tool: ToolId;
  votingMode: boolean;
  isConnectSource: boolean;
  onSelect: (id: string, additive: boolean) => void;
  onDragBy: (dx: number, dy: number) => void;
  onDragEnd: () => void;
  onResize: (id: string, width: number, height: number) => void;
  onOpenComments: (id: string) => void;
  onConnectClick: (id: string) => void;
  onBeforeEdit: () => void;
  onTextChange: (id: string, text: string) => void;
  onColorChange: (id: string, color: string) => void;
  onDelete: (id: string) => void;
  onVote: (id: string, value: 1 | -1) => void;
  onToggleStar: (id: string) => void;
  onToggleReaction: (id: string, emoji: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localText, setLocalText] = useState(note.text);
  const [showColors, setShowColors] = useState(false);
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);
  const didDrag = useRef(false);
  const resizeOrigin = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep local draft in sync with remote text while not actively editing
    if (!editing) setLocalText(note.text);
  }, [note.text, editing]);

  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [editing]);

  function handlePointerDown(e: React.PointerEvent) {
    if (editing) return;
    if (tool === "arrow") {
      e.stopPropagation();
      onConnectClick(note.id);
      return;
    }
    if (tool === "comment") {
      e.stopPropagation();
      onOpenComments(note.id);
      return;
    }
    if (tool !== "select") return;

    e.stopPropagation();
    onSelect(note.id, e.shiftKey);
    onBeforeEdit();
    didDrag.current = false;
    dragOrigin.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragOrigin.current) return;
    const dx = (e.clientX - dragOrigin.current.x) / zoom;
    const dy = (e.clientY - dragOrigin.current.y) / zoom;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag.current = true;
    dragOrigin.current = { x: e.clientX, y: e.clientY };
    onDragBy(dx, dy);
  }

  function handlePointerUp() {
    if (dragOrigin.current && didDrag.current) onDragEnd();
    dragOrigin.current = null;
  }

  function handleResizePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    onBeforeEdit();
    resizeOrigin.current = {
      x: e.clientX,
      y: e.clientY,
      w: note.width,
      h: note.height,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handleResizeMove(e: React.PointerEvent) {
    if (!resizeOrigin.current) return;
    const dx = (e.clientX - resizeOrigin.current.x) / zoom;
    const dy = (e.clientY - resizeOrigin.current.y) / zoom;
    onResize(
      note.id,
      Math.max(140, resizeOrigin.current.w + dx),
      Math.max(120, resizeOrigin.current.h + dy)
    );
  }

  function commitResize() {
    resizeOrigin.current = null;
  }

  const netVotes = note.upvotes - note.downvotes;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "group absolute flex select-none flex-col overflow-hidden rounded-md shadow-md transition-shadow",
        tool === "select" && "cursor-grab active:cursor-grabbing",
        tool === "arrow" && "cursor-crosshair",
        tool === "comment" && "cursor-pointer",
        selected && "ring-2 ring-accent-violet ring-offset-2 ring-offset-background",
        isConnectSource && "ring-2 ring-accent-blue"
      )}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        backgroundColor: note.color,
        rotate: selected ? 0 : note.rotation,
        zIndex: note.zIndex,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onBeforeEdit();
        setEditing(true);
      }}
    >
      <div className="flex items-start justify-between gap-1 px-2.5 pt-2">
        <UserAvatar profile={note.author} size="xs" />
        {votingMode && (
          <span
            className={cn(
              "rounded-full px-1.5 text-xs font-semibold",
              netVotes > 0 && "bg-black/10 text-emerald-900",
              netVotes < 0 && "bg-black/10 text-red-900",
              netVotes === 0 && "bg-black/10 text-black/50"
            )}
          >
            {netVotes > 0 ? `+${netVotes}` : netVotes}
          </span>
        )}
      </div>

      <div className="flex-1 px-2.5 py-1.5">
        {editing ? (
          <textarea
            ref={textareaRef}
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onBlur={() => {
              setEditing(false);
              onTextChange(note.id, localText);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setLocalText(note.text);
                setEditing(false);
              }
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            className="h-full w-full resize-none bg-transparent text-sm text-black/80 outline-none placeholder:text-black/40"
            placeholder="Escreve a ideia…"
          />
        ) : (
          <p className="line-clamp-6 whitespace-pre-wrap text-sm font-medium text-black/80">
            {note.text || (
              <span className="text-black/40">Clique duas vezes pra escrever…</span>
            )}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 px-2 pb-1.5">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onVote(note.id, 1)}
            className={cn(
              "grid size-5 place-items-center rounded text-black/50 hover:bg-black/10",
              note.myVote === 1 && "bg-black/15 text-emerald-900"
            )}
          >
            <ThumbsUp className="size-3" />
          </button>
          {!votingMode && (
            <span className="min-w-3 text-center text-[11px] font-medium text-black/60">
              {netVotes}
            </span>
          )}
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onVote(note.id, -1)}
            className={cn(
              "grid size-5 place-items-center rounded text-black/50 hover:bg-black/10",
              note.myVote === -1 && "bg-black/15 text-red-900"
            )}
          >
            <ThumbsDown className="size-3" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onToggleStar(note.id)}
            className={cn(
              "grid size-5 place-items-center rounded text-black/50 hover:bg-black/10",
              note.starred && "text-amber-600"
            )}
          >
            <Star className={cn("size-3", note.starred && "fill-current")} />
          </button>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onOpenComments(note.id)}
            className="flex items-center gap-0.5 rounded px-1 text-black/50 hover:bg-black/10"
          >
            <MessageCircle className="size-3" />
            {note.commentCount > 0 && (
              <span className="text-[11px]">{note.commentCount}</span>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1 border-t border-black/10 px-2.5 py-1 text-[10px] text-black/45">
        <span className="truncate">{note.author?.displayName ?? "…"}</span>
        <span>{timeAgo(note.updatedAt)}</span>
      </div>

      {Object.keys(note.reactions).length > 0 && (
        <div className="absolute -top-2.5 right-2 flex gap-0.5">
          {Object.entries(note.reactions).map(([emoji, count]) => (
            <span
              key={emoji}
              className="flex items-center gap-0.5 rounded-full border border-border bg-card px-1 text-[10px] shadow-sm"
            >
              {emoji}
              {count > 1 && <span className="text-muted-foreground">{count}</span>}
            </span>
          ))}
        </div>
      )}

      {/* Hover toolbar */}
      <div className="pointer-events-none absolute -top-9 left-0 flex items-center gap-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
        {QUICK_EMOJIS.slice(0, 3).map((e) => (
          <button
            key={e}
            type="button"
            onPointerDown={(ev) => ev.stopPropagation()}
            onClick={() => onToggleReaction(note.id, e)}
            className="grid size-6 place-items-center rounded-full border border-border bg-card text-xs shadow hover:scale-110"
          >
            {e}
          </button>
        ))}
        <div className="relative">
          <button
            type="button"
            onPointerDown={(ev) => ev.stopPropagation()}
            onClick={() => setShowColors((v) => !v)}
            className="grid size-6 place-items-center rounded-full border border-border bg-card shadow hover:scale-110"
          >
            <Palette className="size-3" />
          </button>
          {showColors && (
            <div
              onPointerDown={(ev) => ev.stopPropagation()}
              className="absolute top-7 left-0 flex gap-1 rounded-lg border border-border bg-card p-1.5 shadow-lg"
            >
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    onColorChange(note.id, c.value);
                    setShowColors(false);
                  }}
                  className="size-5 rounded-full border border-black/10"
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(note.id)}
          className="grid size-6 place-items-center rounded-full border border-border bg-card text-destructive shadow hover:scale-110"
        >
          <Trash2 className="size-3" />
        </button>
      </div>

      {tool === "select" && (
        <div
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizeMove}
          onPointerUp={commitResize}
          className="absolute right-0 bottom-0 size-3 cursor-se-resize opacity-0 group-hover:opacity-60"
        >
          <div className="absolute right-0.5 bottom-0.5 size-2 rounded-sm border-r-2 border-b-2 border-black/40" />
        </div>
      )}
    </motion.div>
  );
}
