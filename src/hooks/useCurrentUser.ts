"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useDemoStore, DEMO_USER_ID } from "@/lib/store/demo-store";
import type { Profile } from "@/types";

export function useCurrentUser() {
  const configured = isSupabaseConfigured();
  const demoProfile = useDemoStore((s) =>
    s.profiles.find((p) => p.id === s.currentUserId)
  );
  const [remote, setRemote] = useState<{ profile: Profile | null; loading: boolean }>({
    profile: null,
    loading: configured,
  });

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setRemote({ profile: null, loading: false });
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!cancelled) {
        setRemote({
          profile: data
            ? {
                id: data.id,
                username: data.username,
                displayName: data.display_name,
                avatarUrl: data.avatar_url,
                status: data.status,
                onboarded: data.onboarded,
                email: user.email ?? null,
              }
            : null,
          loading: false,
        });
      }
    }

    load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [configured]);

  if (!configured) {
    return {
      configured: false as const,
      userId: DEMO_USER_ID,
      profile: demoProfile ?? null,
      loading: false,
    };
  }

  return {
    configured: true as const,
    userId: remote.profile?.id ?? null,
    profile: remote.profile,
    loading: remote.loading,
  };
}
