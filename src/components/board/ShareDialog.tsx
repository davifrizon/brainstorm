"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, LogOut, Share2, UserMinus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { BoardMember, BoardRole } from "@/types";

export function ShareDialog({
  boardId,
  members,
  myRole,
  currentUserId,
  onRemoveMember,
  onLeave,
}: {
  boardId: string;
  members: BoardMember[];
  myRole: BoardRole;
  currentUserId: string | null;
  onRemoveMember: (userId: string) => void;
  onLeave: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/board/${boardId}`
      : `/board/${boardId}`;

  function copyLink() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
        <Share2 className="size-3.5" />
        Compartilhar
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar board</DialogTitle>
          <DialogDescription>
            Qualquer amigo com esse link pode entrar no board.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input readOnly value={link} className="font-mono text-xs" />
          <Button onClick={copyLink} variant="secondary" size="icon" className="shrink-0">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </Button>
        </div>

        <div className="mt-2">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {members.length} {members.length === 1 ? "membro" : "membros"}
          </p>
          <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
            {members.map((m) => (
              <div
                key={m.userId}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <UserAvatar profile={m.profile ?? null} size="sm" showTooltip={false} />
                  <div>
                    <p className="text-sm font-medium">
                      {m.profile?.displayName ?? "…"}
                      {m.userId === currentUserId && (
                        <span className="text-muted-foreground"> (você)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{roleLabel(m.role)}</p>
                  </div>
                </div>
                {myRole === "owner" && m.role !== "owner" && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember(m.userId)}
                    className="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <UserMinus className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {myRole !== "owner" && (
          <Button variant="outline" className="mt-2 gap-2 text-destructive" onClick={onLeave}>
            <LogOut className="size-4" />
            Sair do board
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

function roleLabel(role: BoardRole) {
  if (role === "owner") return "dono";
  if (role === "viewer") return "visitante";
  return "membro";
}
