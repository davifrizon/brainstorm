import { UserAvatar } from "@/components/shared/UserAvatar";
import type { BoardMember, CursorPresence } from "@/types";

export function MemberAvatars({
  members,
  onlinePeerIds,
}: {
  members: BoardMember[];
  onlinePeerIds: Set<string>;
}) {
  return (
    <div className="flex -space-x-2">
      {members.slice(0, 6).map((m) => (
        <div key={m.userId} className="relative">
          <UserAvatar profile={m.profile ?? null} size="sm" ringed />
          {onlinePeerIds.has(m.userId) && (
            <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
          )}
        </div>
      ))}
      {members.length > 6 && (
        <div className="grid size-9 place-items-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
          +{members.length - 6}
        </div>
      )}
    </div>
  );
}

export function onlineIdSet(peers: CursorPresence[]): Set<string> {
  return new Set(peers.map((p) => p.userId));
}
