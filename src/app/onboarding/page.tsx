"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Logo } from "@/components/shared/Logo";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDemoStore } from "@/lib/store/demo-store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const AVATAR_EMOJIS = ["🦊", "🐙", "🐧", "🦖", "🐝", "🦉", "🐼", "🦄", "🐢", "🦋", "🐯", "🐸"];

export default function OnboardingPage() {
  const configured = isSupabaseConfigured();
  const router = useRouter();
  const { profile, loading } = useCurrentUser();
  const updateDemoProfile = useDemoStore((s) => s.updateProfile);

  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState(AVATAR_EMOJIS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from async-loaded profile into the edit form
      setDisplayName(profile.displayName ?? "");
      setStatus(profile.status ?? "");
      if (profile.avatarUrl?.startsWith("emoji:")) {
        setAvatarEmoji(profile.avatarUrl.slice("emoji:".length));
      }
    }
  }, [profile]);

  async function handleSave() {
    if (!displayName.trim()) {
      toast.error("Escolhe um nome pra aparecer pros seus amigos");
      return;
    }
    setSaving(true);
    const avatarUrl = `emoji:${avatarEmoji}`;

    if (!configured) {
      updateDemoProfile({ displayName: displayName.trim(), status: status.trim() || null, avatarUrl, onboarded: true });
      setSaving(false);
      router.push("/dashboard");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        status: status.trim() || null,
        avatar_url: avatarUrl,
        onboarded: true,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.push("/dashboard");
  }

  if (loading) return null;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo className="text-lg" href={null} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-6 flex flex-col items-center gap-3">
            <UserAvatar
              profile={{
                id: profile?.id ?? "preview",
                displayName: displayName || "Você",
                avatarUrl: `emoji:${avatarEmoji}`,
                status: null,
              }}
              size="lg"
              showTooltip={false}
            />
            <div className="flex flex-wrap justify-center gap-1.5">
              {AVATAR_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setAvatarEmoji(e)}
                  className={`grid size-8 place-items-center rounded-lg border text-base transition-colors ${
                    avatarEmoji === e
                      ? "border-accent-violet bg-accent-violet/15"
                      : "border-transparent bg-secondary hover:bg-accent"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Como te chamam?</Label>
              <Input
                id="name"
                placeholder="Seu nome"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status (opcional)</Label>
              <Input
                id="status"
                placeholder="ex: sempre com uma ideia terrível"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                maxLength={60}
              />
            </div>
          </div>

          <Button className="mt-6 w-full" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando…" : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
