"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useDemoStore } from "@/lib/store/demo-store";
import { profileById } from "@/lib/demo/derive";
import { fetchActivity, subscribeActivity } from "@/lib/data/board-content";
import type { ActivityItem } from "@/types";

export function useActivity(boardId: string) {
  const configured = isSupabaseConfigured();
  const rawActivity = useDemoStore((s) => s.activity);
  const demoProfiles = useDemoStore((s) => s.profiles);
  const demoActivity = useMemo(
    () =>
      rawActivity
        .filter((a) => a.boardId === boardId)
        .map((a) => ({ ...a, actor: profileById({ profiles: demoProfiles }, a.userId) })),
    [rawActivity, demoProfiles, boardId]
  );

  const [remote, setRemote] = useState<ActivityItem[]>([]);

  const refresh = useCallback(async () => {
    if (!configured) return;
    setRemote(await fetchActivity(createClient(), boardId));
  }, [configured, boardId]);

  useEffect(() => {
    if (!configured) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    refresh();
    const unsub = subscribeActivity(createClient(), boardId, refresh);
    return unsub;
  }, [configured, boardId, refresh]);

  return configured ? remote : demoActivity;
}
