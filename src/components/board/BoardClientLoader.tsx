"use client";

import dynamic from "next/dynamic";

const BoardContainer = dynamic(
  () => import("@/components/board/BoardContainer").then((m) => m.BoardContainer),
  { ssr: false }
);

export function BoardClientLoader({ boardId }: { boardId: string }) {
  return <BoardContainer boardId={boardId} />;
}
