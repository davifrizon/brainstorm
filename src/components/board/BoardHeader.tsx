"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  History,
  Sparkles,
  Vote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Logo } from "@/components/shared/Logo";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";
import { MemberAvatars, onlineIdSet } from "@/components/board/MemberAvatars";
import { ShareDialog } from "@/components/board/ShareDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Board, BoardMember, BoardRole, CursorPresence } from "@/types";

export function BoardHeader({
  board,
  members,
  myRole,
  currentUserId,
  peers,
  connectionStatus,
  votingMode,
  onToggleVotingMode,
  onOpenActivity,
  onOpenVoting,
  onGenerateIdea,
  onRename,
  onRemoveMember,
  onLeave,
}: {
  board: Board | null;
  members: BoardMember[];
  myRole: BoardRole;
  currentUserId: string | null;
  peers: CursorPresence[];
  connectionStatus: "live" | "connecting";
  votingMode: boolean;
  onToggleVotingMode: (v: boolean) => void;
  onOpenActivity: () => void;
  onOpenVoting: () => void;
  onGenerateIdea: () => void;
  onRename: (name: string) => void;
  onRemoveMember: (userId: string) => void;
  onLeave: () => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(board?.name ?? "");

  return (
    <header className="z-30 flex items-center justify-between gap-3 border-b border-border bg-card/60 px-4 py-2.5 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/dashboard"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <Logo iconOnly className="hidden sm:flex" href={null} />
        <div className="h-5 w-px bg-border" />
        {editingName ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              setEditingName(false);
              if (name.trim()) onRename(name.trim());
            }}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="min-w-0 rounded bg-transparent font-medium outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setName(board?.name ?? "");
              setEditingName(true);
            }}
            className="truncate rounded px-1 font-medium hover:bg-accent"
          >
            {board ? `${board.emoji} ${board.name}` : "Carregando…"}
          </button>
        )}
        <ConnectionStatus status={connectionStatus} />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon" onClick={onGenerateIdea} className="hidden sm:flex" />
            }
          >
            <Sparkles className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Me dá uma ideia aleatória</TooltipContent>
        </Tooltip>

        <div className="hidden items-center gap-1.5 rounded-lg border border-border px-2 py-1 sm:flex">
          <Vote className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Votação</span>
          <Switch checked={votingMode} onCheckedChange={onToggleVotingMode} />
        </div>

        <Button variant="ghost" size="icon" onClick={onOpenVoting} className="hidden sm:flex">
          <Vote className="size-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onOpenActivity}>
          <History className="size-4" />
        </Button>

        <MemberAvatars members={members} onlinePeerIds={onlineIdSet(peers)} />

        <ShareDialog
          boardId={board?.id ?? ""}
          members={members}
          myRole={myRole}
          currentUserId={currentUserId}
          onRemoveMember={onRemoveMember}
          onLeave={onLeave}
        />
      </div>
    </header>
  );
}
