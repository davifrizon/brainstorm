"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { StickyNote as StickyNoteIcon, Users } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { timeAgo } from "@/lib/format";
import type { BoardSummary } from "@/types";

export function BoardCard({ board, index }: { board: BoardSummary; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.35 }}
    >
      <Link
        href={`/board/${board.id}`}
        className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-accent-violet/40 hover:shadow-lg hover:shadow-black/20"
      >
        <div>
          <div className="mb-3 flex items-start justify-between">
            <span className="grid size-11 place-items-center rounded-xl bg-accent text-2xl">
              {board.emoji}
            </span>
            {board.myRole === "owner" && (
              <span className="rounded-full bg-accent-violet/15 px-2 py-0.5 text-[11px] font-medium text-accent-violet">
                dono
              </span>
            )}
          </div>
          <h3 className="mb-1 font-semibold text-foreground group-hover:text-accent-violet transition-colors">
            {board.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            editado {timeAgo(board.updatedAt)}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex -space-x-2">
            {board.memberAvatars.map((m) => (
              <UserAvatar key={m.id} profile={m} size="xs" ringed />
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="size-3.5" /> {board.memberCount}
            </span>
            <span className="flex items-center gap-1">
              <StickyNoteIcon className="size-3.5" /> {board.noteCount}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
