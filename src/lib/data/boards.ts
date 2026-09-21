import type { SupabaseClient } from "@supabase/supabase-js";
import type { Board, BoardRole, BoardSummary, Profile } from "@/types";

function mapProfile(row: {
  id: string;
  username: string | null;
  display_name: string;
  avatar_url: string | null;
  status: string | null;
  onboarded: boolean;
}): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    status: row.status,
    onboarded: row.onboarded,
  };
}

export async function fetchBoardSummaries(
  supabase: SupabaseClient,
  userId: string
): Promise<BoardSummary[]> {
  const { data: memberships, error } = await supabase
    .from("board_members")
    .select("role, boards(*)")
    .eq("user_id", userId);

  if (error || !memberships) return [];

  const boardIds = memberships
    .map((m: { boards: unknown }) => (m.boards as Board & { id: string })?.id)
    .filter(Boolean);

  if (boardIds.length === 0) return [];

  const [{ data: allMembers }, { data: noteCounts }] = await Promise.all([
    supabase
      .from("board_members")
      .select("board_id, profiles(*)")
      .in("board_id", boardIds),
    supabase.from("notes").select("id, board_id").in("board_id", boardIds),
  ]);

  return memberships
    .map((m: { role: BoardRole; boards: unknown }) => {
      const board = m.boards as
        | {
            id: string;
            name: string;
            emoji: string;
            owner_id: string;
            is_demo: boolean;
            created_at: string;
            updated_at: string;
          }
        | null;
      if (!board) return null;
      const members = (allMembers ?? []).filter(
        (mm: { board_id: string }) => mm.board_id === board.id
      );
      const avatars = members
        .slice(0, 5)
        .map((mm: { profiles: unknown }) => mm.profiles)
        .filter(Boolean)
        .map((p) => mapProfile(p as Parameters<typeof mapProfile>[0]));
      const noteCount = (noteCounts ?? []).filter(
        (n: { board_id: string }) => n.board_id === board.id
      ).length;

      return {
        id: board.id,
        name: board.name,
        emoji: board.emoji,
        ownerId: board.owner_id,
        isDemo: board.is_demo,
        createdAt: board.created_at,
        updatedAt: board.updated_at,
        memberCount: members.length,
        memberAvatars: avatars,
        noteCount,
        myRole: m.role,
      } satisfies BoardSummary;
    })
    .filter((b): b is BoardSummary => Boolean(b))
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export async function createBoardRemote(
  supabase: SupabaseClient,
  ownerId: string,
  name: string,
  emoji: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("boards")
    .insert({ name, emoji, owner_id: ownerId })
    .select("id")
    .single();
  if (error) return null;
  return data.id as string;
}

export async function joinBoardRemote(
  supabase: SupabaseClient,
  boardId: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("board_members")
    .insert({ board_id: boardId, user_id: userId, role: "member" });
  return !error;
}
