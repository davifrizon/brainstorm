"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useDemoStore, DEMO_USER_ID } from "@/lib/store/demo-store";
import { deriveNotes } from "@/lib/demo/derive";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  fetchBoardContent,
  subscribeBoard,
  type BoardContent,
} from "@/lib/data/board-content";
import {
  castVoteRemote,
  createConnectionRemote,
  createFrameRemote,
  createNoteRemote,
  deleteConnectionRemote,
  deleteFrameRemote,
  deleteNoteRemote,
  toggleReactionRemote,
  toggleStarRemote,
  updateFrameRemote,
  updateNoteRemote,
} from "@/lib/data/mutations";
import { postActivity } from "@/lib/data/board-content";
import type { Board } from "@/types";

export function useBoardData(boardId: string) {
  const configured = isSupabaseConfigured();
  const { userId, profile } = useCurrentUser();

  // ---- demo mode ----
  const rawNotes = useDemoStore((s) => s.notes);
  const rawFrames = useDemoStore((s) => s.frames);
  const rawConnections = useDemoStore((s) => s.connections);
  const rawBoardMembers = useDemoStore((s) => s.boardMembers);
  const rawBoards = useDemoStore((s) => s.boards);
  const rawVotes = useDemoStore((s) => s.votes);
  const rawStars = useDemoStore((s) => s.stars);
  const rawReactions = useDemoStore((s) => s.reactions);
  const rawComments = useDemoStore((s) => s.comments);
  const demoProfiles = useDemoStore((s) => s.profiles);
  const demo = useDemoStore((s) => s);

  const demoNotes = useMemo(
    () =>
      deriveNotes(
        {
          notes: rawNotes,
          votes: rawVotes,
          stars: rawStars,
          reactions: rawReactions,
          comments: rawComments,
          profiles: demoProfiles,
          currentUserId: DEMO_USER_ID,
          boardMembers: rawBoardMembers,
          boards: rawBoards,
        },
        boardId
      ),
    [rawNotes, rawVotes, rawStars, rawReactions, rawComments, demoProfiles, rawBoardMembers, rawBoards, boardId]
  );
  const demoFrames = useMemo(
    () => rawFrames.filter((f) => f.boardId === boardId),
    [rawFrames, boardId]
  );
  const demoConnections = useMemo(
    () => rawConnections.filter((c) => c.boardId === boardId),
    [rawConnections, boardId]
  );
  const demoMembersRaw = useMemo(
    () => rawBoardMembers.filter((m) => m.boardId === boardId),
    [rawBoardMembers, boardId]
  );
  const demoBoard = useMemo(
    () => rawBoards.find((b) => b.id === boardId),
    [rawBoards, boardId]
  );

  useEffect(() => {
    if (configured || !demoBoard) return;
    demo.joinBoard(boardId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, boardId, Boolean(demoBoard)]);

  const demoMembers = useMemo(
    () =>
      demoMembersRaw.map((m) => ({
        ...m,
        profile: demoProfiles.find((p) => p.id === m.userId),
      })),
    [demoMembersRaw, demoProfiles]
  );

  // ---- remote mode ----
  const [remote, setRemote] = useState<BoardContent>({
    notes: [],
    frames: [],
    connections: [],
    members: [],
  });
  const [remoteBoard, setRemoteBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(configured);
  const supabaseRef = useRef(configured ? createClient() : null);

  const joinedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!configured || !userId) return;
    const supabase = supabaseRef.current!;
    if (!joinedRef.current) {
      joinedRef.current = true;
      await supabase
        .from("board_members")
        .upsert(
          { board_id: boardId, user_id: userId, role: "member" },
          { onConflict: "board_id,user_id", ignoreDuplicates: true }
        );
    }
    const [content, boardRow] = await Promise.all([
      fetchBoardContent(supabase, boardId, userId),
      supabase.from("boards").select("*").eq("id", boardId).single(),
    ]);
    setRemote(content);
    if (boardRow.data) {
      setRemoteBoard({
        id: boardRow.data.id,
        name: boardRow.data.name,
        emoji: boardRow.data.emoji,
        ownerId: boardRow.data.owner_id,
        isDemo: boardRow.data.is_demo,
        createdAt: boardRow.data.created_at,
        updatedAt: boardRow.data.updated_at,
      });
    }
    setLoading(false);
  }, [configured, userId, boardId]);

  useEffect(() => {
    if (!configured || !userId) return;
    refresh();
    const unsub = subscribeBoard(supabaseRef.current!, boardId, refresh);
    return unsub;
  }, [configured, userId, boardId, refresh]);

  const notes = configured ? remote.notes : demoNotes;
  const frames = configured ? remote.frames : demoFrames;
  const connections = configured ? remote.connections : demoConnections;
  const members = configured ? remote.members : demoMembers;
  const board = configured ? remoteBoard : demoBoard;
  const myRole = members.find((m) => m.userId === userId)?.role ?? "member";

  const log = useCallback(
    (type: Parameters<typeof postActivity>[3], payload: Record<string, unknown>) => {
      if (!configured || !userId) return;
      postActivity(supabaseRef.current!, boardId, userId, type, payload);
    },
    [configured, userId, boardId]
  );

  const lastMoveSent = useRef<Record<string, number>>({});

  const actions = {
    addNote: async (partial?: { x?: number; y?: number; text?: string; color?: string }) => {
      if (!configured) return demo.addNote(boardId, partial);
      if (!userId) return;
      const id = await createNoteRemote(supabaseRef.current!, boardId, userId, partial ?? {});
      log("note_created", {});
      await refresh();
      return id;
    },
    updateNoteText: async (id: string, text: string) => {
      if (!configured) return demo.updateNote(id, { text });
      await updateNoteRemote(supabaseRef.current!, id, { text });
      await refresh();
    },
    moveNote: async (id: string, x: number, y: number) => {
      if (!configured) return demo.moveNote(id, x, y);
      const now = Date.now();
      if (now - (lastMoveSent.current[id] ?? 0) < 120) return;
      lastMoveSent.current[id] = now;
      await updateNoteRemote(supabaseRef.current!, id, { x, y });
      // Optimistic — avoid full refetch storms while dragging; realtime will reconcile.
    },
    commitNoteMove: async (id: string, x: number, y: number) => {
      if (!configured) return demo.moveNote(id, x, y);
      lastMoveSent.current[id] = Date.now();
      await updateNoteRemote(supabaseRef.current!, id, { x, y });
    },
    resizeNote: async (id: string, width: number, height: number) => {
      if (!configured) return demo.resizeNote(id, width, height);
      await updateNoteRemote(supabaseRef.current!, id, { width, height });
    },
    setNoteColor: async (id: string, color: string) => {
      if (!configured) return demo.updateNote(id, { color });
      await updateNoteRemote(supabaseRef.current!, id, { color });
      await refresh();
    },
    setNoteFrame: async (id: string, frameId: string | null) => {
      if (!configured) return demo.updateNote(id, { frameId });
      await updateNoteRemote(supabaseRef.current!, id, { frame_id: frameId });
      await refresh();
    },
    bringToFront: async (id: string) => {
      if (!configured) return demo.bringToFront(id);
      const z = Math.max(0, ...remote.notes.map((n) => n.zIndex)) + 1;
      await updateNoteRemote(supabaseRef.current!, id, { z_index: z });
    },
    deleteNote: async (id: string) => {
      if (!configured) return demo.deleteNote(id);
      await deleteNoteRemote(supabaseRef.current!, id);
      await refresh();
    },
    addFrame: async (partial?: Partial<{ name: string; color: string; x: number; y: number; width: number; height: number }>) => {
      if (!configured) return demo.addFrame(boardId, partial);
      const id = await createFrameRemote(supabaseRef.current!, boardId, partial ?? {});
      log("frame_created", { name: partial?.name ?? "New frame" });
      await refresh();
      return id;
    },
    updateFrame: async (id: string, patch: Partial<{ name: string; color: string; x: number; y: number; width: number; height: number }>) => {
      if (!configured) return demo.updateFrame(id, patch);
      await updateFrameRemote(supabaseRef.current!, id, patch);
      await refresh();
    },
    deleteFrame: async (id: string) => {
      if (!configured) return demo.deleteFrame(id);
      await deleteFrameRemote(supabaseRef.current!, id);
      await refresh();
    },
    addConnection: async (fromId: string, toId: string) => {
      if (!configured) return demo.addConnection(boardId, fromId, toId);
      await createConnectionRemote(supabaseRef.current!, boardId, fromId, toId);
      await refresh();
    },
    deleteConnection: async (id: string) => {
      if (!configured) return demo.deleteConnection(id);
      await deleteConnectionRemote(supabaseRef.current!, id);
      await refresh();
    },
    vote: async (id: string, value: 1 | -1) => {
      if (!configured) return demo.vote(id, value);
      if (!userId) return;
      const note = remote.notes.find((n) => n.id === id);
      await castVoteRemote(supabaseRef.current!, id, userId, value, note?.myVote ?? 0);
      log("vote_cast", {});
      await refresh();
    },
    toggleStar: async (id: string) => {
      if (!configured) return demo.toggleStar(id);
      if (!userId) return;
      const note = remote.notes.find((n) => n.id === id);
      await toggleStarRemote(supabaseRef.current!, id, userId, note?.starred ?? false);
      await refresh();
    },
    toggleReaction: async (id: string, emoji: string) => {
      if (!configured) return demo.toggleReaction(id, emoji);
      if (!userId) return;
      const note = remote.notes.find((n) => n.id === id);
      const has = note?.myReactions.includes(emoji) ?? false;
      await toggleReactionRemote(supabaseRef.current!, id, userId, emoji, has);
      if (!has) log("reaction_added", { emoji });
      await refresh();
    },
  };

  return {
    configured,
    userId,
    profile,
    board,
    notes,
    frames,
    connections,
    members,
    myRole,
    loading: configured ? loading : false,
    actions,
  };
}
