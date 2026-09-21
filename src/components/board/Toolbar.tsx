"use client";

import {
  ArrowUpRight,
  Frame as FrameIcon,
  MessageSquare,
  MousePointer2,
  Pencil,
  Redo2,
  StickyNote as StickyNoteIcon,
  Type,
  Undo2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ToolId } from "@/types";

const TOOLS: Array<{ id: ToolId; icon: typeof MousePointer2; label: string; shortcut: string }> = [
  { id: "select", icon: MousePointer2, label: "Selecionar", shortcut: "V" },
  { id: "sticky", icon: StickyNoteIcon, label: "Nota adesiva", shortcut: "N" },
  { id: "text", icon: Type, label: "Texto", shortcut: "T" },
  { id: "draw", icon: Pencil, label: "Desenhar", shortcut: "D" },
  { id: "arrow", icon: ArrowUpRight, label: "Conectar", shortcut: "A" },
  { id: "frame", icon: FrameIcon, label: "Frame", shortcut: "F" },
  { id: "comment", icon: MessageSquare, label: "Comentar", shortcut: "C" },
];

export function Toolbar({
  tool,
  setTool,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: {
  tool: ToolId;
  setTool: (t: ToolId) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-border bg-card/90 p-1.5 shadow-xl backdrop-blur">
      <div className="pointer-events-auto flex items-center gap-1">
        {TOOLS.map((t) => (
          <Tooltip key={t.id}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => setTool(t.id)}
                  className={cn(
                    "grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                    tool === t.id && "bg-accent-violet/15 text-accent-violet"
                  )}
                />
              }
            >
              <t.icon className="size-4" />
            </TooltipTrigger>
            <TooltipContent>
              {t.label} <span className="text-background/60">· {t.shortcut}</span>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <div className="mx-1 h-6 w-px bg-border" />

      <div className="pointer-events-auto flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                disabled={!canUndo}
                onClick={onUndo}
                className="grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-30"
              />
            }
          >
            <Undo2 className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Desfazer · Ctrl+Z</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                disabled={!canRedo}
                onClick={onRedo}
                className="grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-30"
              />
            }
          >
            <Redo2 className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Refazer · Ctrl+Shift+Z</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
