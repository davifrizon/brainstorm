"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useDemoStore } from "@/lib/store/demo-store";
import { deriveBoardSummaries } from "@/lib/demo/derive";
import {
  createBoardRemote,
  fetchBoardSummaries,
  joinBoardRemote,
} from "@/lib/data/boards";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { BoardSummary } from "@/types";

export function useBoardsData() {
  const configured = isSupabaseConfigured();
  const { userId } = useCurrentUser();

  const demoBoardMembers = useDemoStore((s) => s.boardMembers);
  const demoBoards = useDemoStore((s) => s.boards);
  const demoNotes = useDemoStore((s) => s.notes);
  const demoProfiles = useDemoStore((s) => s.profiles);
  const demoCurrentUserId = useDemoStore((s) => s.currentUserId);
  const demoCreateBoard = useDemoStore((s) => s.createBoard);
  const demoJoinBoard = useDemoStore((s) => s.joinBoard);

  const demoSummaries = useMemo(
    () =>
      deriveBoardSummaries({
        boardMembers: demoBoardMembers,
        boards: demoBoards,
        notes: demoNotes,
        profiles: demoProfiles,
        currentUserId: demoCurrentUserId,
        votes: [],
        reactions: [],
        stars: [],
        comments: [],
      }),
    [demoBoardMembers, demoBoards, demoNotes, demoProfiles, demoCurrentUserId]
  );

  const [remoteBoards, setRemoteBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(configured);

  const refresh = useCallback(async () => {
    if (!configured || !userId) return;
    setLoading(true);
    const supabase = createClient();
    const boards = await fetchBoardSummaries(supabase, userId);
    setRemoteBoards(boards);
    setLoading(false);
  }, [configured, userId]);

  useEffect(() => {
    if (!configured) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    refresh();
  }, [configured, refresh]);

  const createBoard = useCallback(
    async (name: string, emoji: string) => {
      if (!configured) return demoCreateBoard(name, emoji);
      if (!userId) return null;
      const supabase = createClient();
      const id = await createBoardRemote(supabase, userId, name, emoji);
      await refresh();
      return id;
    },
    [configured, userId, demoCreateBoard, refresh]
  );

  const joinBoard = useCallback(
    async (boardId: string) => {
      if (!configured) return demoJoinBoard(boardId);
      if (!userId) return;
      const supabase = createClient();
      await joinBoardRemote(supabase, boardId, userId);
      await refresh();
    },
    [configured, userId, demoJoinBoard, refresh]
  );

  return {
    boards: configured ? remoteBoards : demoSummaries,
    loading: configured ? loading : false,
    createBoard,
    joinBoard,
  };
}
