"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";
import type { Note, SortMode } from "@/types";

export function VotingPanel({
  notes,
  open,
  onOpenChange,
  onVote,
}: {
  notes: Note[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVote: (id: string, value: 1 | -1) => void;
}) {
  const [sort, setSort] = useState<SortMode>("votes");

  const sorted = useMemo(() => {
    const list = [...notes];
    if (sort === "votes") {
      list.sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes));
    } else if (sort === "newest") {
      list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    } else if (sort === "discussed") {
      list.sort((a, b) => b.commentCount - a.commentCount);
    }
    return list;
  }, [notes, sort]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Ranking</SheetTitle>
          <SheetDescription>Vê quais ideias tão bombando</SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="votes">Mais votadas</SelectItem>
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="discussed">Mais comentadas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
          {sorted.map((n, i) => {
            const net = n.upvotes - n.downvotes;
            return (
              <div
                key={n.id}
                className="flex items-center gap-3 rounded-xl border border-border p-3"
              >
                <span className="w-4 text-center text-xs font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: n.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{n.text || "(sem texto)"}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <UserAvatar profile={n.author} size="xs" showTooltip={false} />
                    {n.author?.displayName}
                    {n.commentCount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="size-3" /> {n.commentCount}
                      </span>
                    )}
                    {n.starred && <Star className="size-3 fill-amber-500 text-amber-500" />}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onVote(n.id, 1)}
                    className={cn(
                      "grid size-6 place-items-center rounded hover:bg-accent",
                      n.myVote === 1 && "text-emerald-500"
                    )}
                  >
                    <ThumbsUp className="size-3.5" />
                  </button>
                  <span className="w-5 text-center text-xs font-semibold">{net}</span>
                  <button
                    type="button"
                    onClick={() => onVote(n.id, -1)}
                    className={cn(
                      "grid size-6 place-items-center rounded hover:bg-accent",
                      n.myVote === -1 && "text-red-500"
                    )}
                  >
                    <ThumbsDown className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
