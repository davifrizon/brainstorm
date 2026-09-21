import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ActivityItem,
  ActivityType,
  BoardMember,
  Comment,
  Connection,
  Frame,
  Note,
  Profile,
} from "@/types";

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

export interface BoardContent {
  notes: Note[];
  frames: Frame[];
  connections: Connection[];
  members: BoardMember[];
}

export async function fetchBoardContent(
  supabase: SupabaseClient,
  boardId: string,
  userId: string
): Promise<BoardContent> {
  const [
    { data: notesRows },
    { data: frameRows },
    { data: connRows },
    { data: memberRows },
    { data: voteRows },
    { data: starRows },
    { data: reactionRows },
    { data: commentCountRows },
  ] = await Promise.all([
    supabase.from("notes").select("*, profiles(*)").eq("board_id", boardId),
    supabase.from("frames").select("*").eq("board_id", boardId),
    supabase.from("connections").select("*").eq("board_id", boardId),
    supabase
      .from("board_members")
      .select("*, profiles(*)")
      .eq("board_id", boardId),
    supabase.from("votes").select("note_id, user_id, value"),
    supabase.from("stars").select("note_id, user_id"),
    supabase.from("reactions").select("note_id, user_id, emoji"),
    supabase.from("comments").select("id, note_id"),
  ]);

  const notes: Note[] = (notesRows ?? []).map((n) => {
    const noteVotes = (voteRows ?? []).filter((v) => v.note_id === n.id);
    const upvotes = noteVotes.filter((v) => v.value === 1).length;
    const downvotes = noteVotes.filter((v) => v.value === -1).length;
    const myVoteRow = noteVotes.find((v) => v.user_id === userId);
    const noteReactions = (reactionRows ?? []).filter((r) => r.note_id === n.id);
    const reactions: Record<string, number> = {};
    for (const r of noteReactions) reactions[r.emoji] = (reactions[r.emoji] ?? 0) + 1;
    const myReactions = noteReactions
      .filter((r) => r.user_id === userId)
      .map((r) => r.emoji);
    const starCount = (starRows ?? []).filter((s) => s.note_id === n.id).length;
    const starred = (starRows ?? []).some(
      (s) => s.note_id === n.id && s.user_id === userId
    );
    const commentCount = (commentCountRows ?? []).filter(
      (c) => c.note_id === n.id
    ).length;

    return {
      id: n.id,
      boardId: n.board_id,
      authorId: n.author_id,
      frameId: n.frame_id,
      text: n.text,
      color: n.color,
      x: n.x,
      y: n.y,
      width: n.width,
      height: n.height,
      rotation: n.rotation,
      zIndex: n.z_index,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
      author: n.profiles ? mapProfile(n.profiles) : null,
      upvotes,
      downvotes,
      myVote: myVoteRow ? (myVoteRow.value as 1 | -1) : 0,
      starred,
      starCount,
      reactions,
      myReactions,
      commentCount,
    } satisfies Note;
  });

  const frames: Frame[] = (frameRows ?? []).map((f) => ({
    id: f.id,
    boardId: f.board_id,
    name: f.name,
    color: f.color,
    x: f.x,
    y: f.y,
    width: f.width,
    height: f.height,
  }));

  const connections: Connection[] = (connRows ?? []).map((c) => ({
    id: c.id,
    boardId: c.board_id,
    fromNoteId: c.from_note_id,
    toNoteId: c.to_note_id,
  }));

  const members: BoardMember[] = (memberRows ?? []).map((m) => ({
    boardId: m.board_id,
    userId: m.user_id,
    role: m.role,
    joinedAt: m.joined_at,
    profile: m.profiles ? mapProfile(m.profiles) : undefined,
  }));

  return { notes, frames, connections, members };
}

export async function fetchComments(
  supabase: SupabaseClient,
  noteId: string
): Promise<Comment[]> {
  const { data } = await supabase
    .from("comments")
    .select("*, profiles(*)")
    .eq("note_id", noteId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((c) => ({
    id: c.id,
    noteId: c.note_id,
    authorId: c.author_id,
    author: c.profiles ? mapProfile(c.profiles) : null,
    text: c.text,
    createdAt: c.created_at,
  }));
}

export async function fetchActivity(
  supabase: SupabaseClient,
  boardId: string
): Promise<ActivityItem[]> {
  const { data } = await supabase
    .from("activity")
    .select("*, profiles(*)")
    .eq("board_id", boardId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((a) => ({
    id: a.id,
    boardId: a.board_id,
    userId: a.user_id,
    actor: a.profiles ? mapProfile(a.profiles) : null,
    type: a.type,
    payload: a.payload,
    createdAt: a.created_at,
  }));
}

export async function postActivity(
  supabase: SupabaseClient,
  boardId: string,
  userId: string,
  type: ActivityType,
  payload: Record<string, unknown>
) {
  await supabase
    .from("activity")
    .insert({ board_id: boardId, user_id: userId, type, payload });
}

export function subscribeBoard(
  supabase: SupabaseClient,
  boardId: string,
  onChange: () => void
) {
  const channel = supabase
    .channel(`board-content:${boardId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notes", filter: `board_id=eq.${boardId}` },
      onChange
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "frames", filter: `board_id=eq.${boardId}` },
      onChange
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "connections", filter: `board_id=eq.${boardId}` },
      onChange
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "board_members", filter: `board_id=eq.${boardId}` },
      onChange
    )
    .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "stars" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "reactions" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeActivity(
  supabase: SupabaseClient,
  boardId: string,
  onChange: () => void
) {
  const channel = supabase
    .channel(`board-activity:${boardId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "activity", filter: `board_id=eq.${boardId}` },
      onChange
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
