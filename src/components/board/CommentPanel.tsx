"use client";

import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/format";
import { useComments } from "@/hooks/useComments";
import type { Note } from "@/types";

export function CommentPanel({
  note,
  currentUserId,
  onOpenChange,
}: {
  note: Note | null;
  currentUserId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { comments, addComment, deleteComment } = useComments(note?.id ?? null);
  const [text, setText] = useState("");

  async function submit() {
    if (!text.trim()) return;
    await addComment(text);
    setText("");
  }

  return (
    <Sheet open={Boolean(note)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Comentários</SheetTitle>
          <SheetDescription className="line-clamp-2">{note?.text || "Nota sem texto"}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          {comments.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum comentário ainda. Bora começar a conversa.
            </p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="group flex gap-2.5">
              <UserAvatar profile={c.author} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{c.author?.displayName ?? "…"}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground/90">{c.text}</p>
              </div>
              {c.authorId === currentUserId && (
                <button
                  type="button"
                  onClick={() => deleteComment(c.id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-end gap-2 border-t border-border p-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Escreve um comentário…"
            className="min-h-10 flex-1 resize-none"
            rows={1}
          />
          <Button size="icon" onClick={submit} disabled={!text.trim()}>
            <Send className="size-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
