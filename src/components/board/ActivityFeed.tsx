"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { timeAgo } from "@/lib/format";
import { useActivity } from "@/hooks/useActivity";
import type { ActivityItem } from "@/types";

function describe(a: ActivityItem): string {
  const noteText = typeof a.payload.noteText === "string" ? a.payload.noteText : null;
  switch (a.type) {
    case "note_created":
      return "adicionou uma ideia";
    case "note_moved":
      return `moveu uma nota${noteText ? ` — "${trim(noteText)}"` : ""}`;
    case "note_deleted":
      return "removeu uma nota";
    case "note_edited":
      return "editou uma nota";
    case "reaction_added":
      return `reagiu com ${a.payload.emoji ?? "🙂"}${noteText ? ` em "${trim(noteText)}"` : ""}`;
    case "vote_cast":
      return `votou${noteText ? ` em "${trim(noteText)}"` : ""}`;
    case "comment_added":
      return `comentou${noteText ? ` em "${trim(noteText)}"` : ""}`;
    case "frame_created":
      return `criou a categoria "${a.payload.name ?? "nova categoria"}"`;
    case "member_joined":
      return "entrou no board";
    default:
      return "fez uma alteração";
  }
}

function trim(s: string) {
  return s.length > 28 ? `${s.slice(0, 28)}…` : s;
}

export function ActivityFeed({
  boardId,
  open,
  onOpenChange,
}: {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const activity = useActivity(boardId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Atividade</SheetTitle>
          <SheetDescription>O que rolou nesse board</SheetDescription>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          {activity.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nada por aqui ainda.
            </p>
          )}
          {activity.map((a) => (
            <div key={a.id} className="flex items-start gap-2.5">
              <UserAvatar profile={a.actor} size="sm" />
              <div>
                <p className="text-sm">
                  <span className="font-medium">{a.actor?.displayName ?? "Alguém"}</span>{" "}
                  <span className="text-foreground/80">{describe(a)}</span>
                </p>
                <p className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
