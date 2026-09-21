"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function DashboardHeader() {
  const { profile } = useCurrentUser();
  const router = useRouter();
  const configured = isSupabaseConfigured();

  async function handleSignOut() {
    if (configured) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Logo href="/dashboard" />
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <UserAvatar profile={profile} size="sm" showTooltip={false} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{profile?.displayName ?? "Você"}</p>
              {profile?.status && (
                <p className="text-xs font-normal text-muted-foreground">
                  {profile.status}
                </p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/onboarding")}>
              <Settings className="size-4" />
              Editar perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} variant="destructive">
              <LogOut className="size-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
