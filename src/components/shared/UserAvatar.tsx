import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { colorForUser } from "@/lib/colors";
import type { Profile } from "@/types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function UserAvatar({
  profile,
  className,
  ringed = false,
  size = "md",
  showTooltip = true,
}: {
  profile: Pick<Profile, "id" | "displayName" | "avatarUrl" | "status"> | null | undefined;
  className?: string;
  ringed?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  showTooltip?: boolean;
}) {
  if (!profile) {
    return (
      <Avatar className={cn(sizeClass[size], className)}>
        <AvatarFallback className="bg-muted text-muted-foreground">?</AvatarFallback>
      </Avatar>
    );
  }

  const isEmoji = profile.avatarUrl?.startsWith("emoji:");
  const emoji = isEmoji ? profile.avatarUrl!.slice("emoji:".length) : null;
  const imageUrl = !isEmoji ? profile.avatarUrl : null;

  const avatar = (
    <Avatar
      className={cn(
        sizeClass[size],
        ringed && "ring-2 ring-background",
        className
      )}
      style={ringed ? { boxShadow: `0 0 0 2px ${colorForUser(profile.id)}` } : undefined}
    >
      {imageUrl && <AvatarImage src={imageUrl} alt={profile.displayName} />}
      <AvatarFallback
        className="text-white font-medium"
        style={{ backgroundColor: colorForUser(profile.id) }}
      >
        {emoji ?? initials(profile.displayName) ?? "?"}
      </AvatarFallback>
    </Avatar>
  );

  if (!showTooltip) return avatar;

  return (
    <Tooltip>
      <TooltipTrigger render={avatar} />
      <TooltipContent side="bottom" className="text-center">
        <p className="font-medium">{profile.displayName}</p>
        {profile.status && (
          <p className="text-muted-foreground text-xs">{profile.status}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

const sizeClass: Record<string, string> = {
  xs: "size-5 text-[10px]",
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
};
