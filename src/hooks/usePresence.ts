"use client";

import { useEffect, useRef, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { colorForUser } from "@/lib/colors";
import type { CursorPresence, Profile } from "@/types";

const STALE_MS = 12_000;

interface SelfInfo {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}

export function usePresence(boardId: string, self: SelfInfo | null) {
  const [peers, setPeers] = useState<Record<string, CursorPresence>>({});
  const channelRef = useRef<{
    send: (msg: Record<string, unknown>) => void;
  } | null>(null);

  useEffect(() => {
    if (!self || !boardId) return;
    const configured = isSupabaseConfigured();

    let cleanup = () => {};

    if (configured) {
      const supabase = createClient();
      const channel = supabase.channel(`presence:${boardId}`, {
        config: { presence: { key: self.userId } },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState<CursorPresence>();
          const next: Record<string, CursorPresence> = {};
          for (const key of Object.keys(state)) {
            const entry = state[key][0];
            if (entry && key !== self.userId) next[key] = entry;
          }
          setPeers(next);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({
              userId: self.userId,
              displayName: self.displayName,
              avatarUrl: self.avatarUrl,
              color: colorForUser(self.userId),
              x: 0,
              y: 0,
              updatedAt: Date.now(),
            } satisfies CursorPresence);
          }
        });

      channelRef.current = {
        send: (msg) => channel.track(msg),
      };
      cleanup = () => {
        supabase.removeChannel(channel);
      };
    } else {
      const bc = new BroadcastChannel(`brainstorm-presence-${boardId}`);
      const tabId =
        sessionStorage.getItem("brainstorm-tab-id") ??
        (() => {
          const id = Math.random().toString(36).slice(2, 10);
          sessionStorage.setItem("brainstorm-tab-id", id);
          return id;
        })();

      bc.onmessage = (event) => {
        const msg = event.data as CursorPresence & { type: string };
        if (msg.type === "bye") {
          setPeers((p) => {
            const next = { ...p };
            delete next[msg.userId];
            return next;
          });
          return;
        }
        if (msg.userId === tabId) return;
        setPeers((p) => ({ ...p, [msg.userId]: msg }));
      };

      bc.postMessage({
        type: "hello",
        userId: tabId,
        displayName: self.displayName,
        avatarUrl: self.avatarUrl,
        color: colorForUser(tabId),
        x: -100,
        y: -100,
        updatedAt: Date.now(),
      });

      channelRef.current = {
        send: (msg) =>
          bc.postMessage({
            type: "cursor",
            userId: tabId,
            displayName: self.displayName,
            avatarUrl: self.avatarUrl,
            color: colorForUser(tabId),
            updatedAt: Date.now(),
            ...msg,
          }),
      };

      cleanup = () => {
        bc.postMessage({ type: "bye", userId: tabId });
        bc.close();
      };
    }

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, self?.userId, self?.displayName, self?.avatarUrl]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPeers((p) => {
        const now = Date.now();
        const next: Record<string, CursorPresence> = {};
        for (const [k, v] of Object.entries(p)) {
          if (now - v.updatedAt < STALE_MS) next[k] = v;
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  function updateCursor(x: number, y: number) {
    channelRef.current?.send({ x, y, updatedAt: Date.now() });
  }

  return { peers: Object.values(peers), updateCursor };
}

export function profileToSelf(profile: Profile | null): SelfInfo | null {
  if (!profile) return null;
  return {
    userId: profile.id,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
  };
}
