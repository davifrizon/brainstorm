"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useDemoStore } from "@/lib/store/demo-store";
import { deriveComments } from "@/lib/demo/derive";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { fetchComments } from "@/lib/data/board-content";
import { addCommentRemote, deleteCommentRemote } from "@/lib/data/mutations";
import type { Comment } from "@/types";

const EMPTY: Comment[] = [];

export function useComments(noteId: string | null) {
  const configured = isSupabaseConfigured();
  const { userId } = useCurrentUser();
  const rawComments = useDemoStore((s) => s.comments);
  const demoProfiles = useDemoStore((s) => s.profiles);
  const addDemoComment = useDemoStore((s) => s.addComment);
  const deleteDemoComment = useDemoStore((s) => s.deleteComment);

  const demoComments = useMemo(
    () =>
      noteId
        ? deriveComments({ comments: rawComments, profiles: demoProfiles }, noteId)
        : EMPTY,
    [rawComments, demoProfiles, noteId]
  );

  const [remote, setRemote] = useState<Comment[]>([]);

  const refresh = useCallback(async () => {
    if (!configured || !noteId) return;
    const supabase = createClient();
    setRemote(await fetchComments(supabase, noteId));
  }, [configured, noteId]);

  useEffect(() => {
    if (!configured || !noteId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    refresh();
    const supabase = createClient();
    const channel = supabase
      .channel(`comments:${noteId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `note_id=eq.${noteId}` },
        refresh
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [configured, noteId, refresh]);

  const comments = configured ? remote : demoComments;

  async function addComment(text: string) {
    if (!noteId || !text.trim()) return;
    if (!configured) return addDemoComment(noteId, text);
    if (!userId) return;
    await addCommentRemote(createClient(), noteId, userId, text.trim());
    await refresh();
  }

  async function deleteComment(id: string) {
    if (!configured) return deleteDemoComment(id);
    await deleteCommentRemote(createClient(), id);
    await refresh();
  }

  return { comments, addComment, deleteComment };
}
