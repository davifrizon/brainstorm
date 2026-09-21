import type { SupabaseClient } from "@supabase/supabase-js";
import { randomNoteColor } from "@/lib/colors";

export async function createNoteRemote(
  supabase: SupabaseClient,
  boardId: string,
  authorId: string,
  partial: Partial<{ x: number; y: number; text: string; color: string }>
) {
  const { data } = await supabase
    .from("notes")
    .insert({
      board_id: boardId,
      author_id: authorId,
      x: partial.x ?? 200,
      y: partial.y ?? 200,
      text: partial.text ?? "",
      color: partial.color ?? randomNoteColor(),
      width: 220,
      height: 190,
      rotation: Math.random() * 6 - 3,
    })
    .select("id")
    .single();
  return data?.id as string | undefined;
}

export async function updateNoteRemote(
  supabase: SupabaseClient,
  noteId: string,
  patch: Record<string, unknown>
) {
  await supabase
    .from("notes")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", noteId);
}

export async function deleteNoteRemote(supabase: SupabaseClient, noteId: string) {
  await supabase.from("notes").delete().eq("id", noteId);
}

export async function createFrameRemote(
  supabase: SupabaseClient,
  boardId: string,
  partial: Partial<{ name: string; color: string; x: number; y: number; width: number; height: number }>
) {
  const { data } = await supabase
    .from("frames")
    .insert({ board_id: boardId, ...partial })
    .select("id")
    .single();
  return data?.id as string | undefined;
}

export async function updateFrameRemote(
  supabase: SupabaseClient,
  frameId: string,
  patch: Record<string, unknown>
) {
  await supabase.from("frames").update(patch).eq("id", frameId);
}

export async function deleteFrameRemote(supabase: SupabaseClient, frameId: string) {
  await supabase.from("frames").delete().eq("id", frameId);
}

export async function createConnectionRemote(
  supabase: SupabaseClient,
  boardId: string,
  fromNoteId: string,
  toNoteId: string
) {
  await supabase
    .from("connections")
    .insert({ board_id: boardId, from_note_id: fromNoteId, to_note_id: toNoteId });
}

export async function deleteConnectionRemote(supabase: SupabaseClient, id: string) {
  await supabase.from("connections").delete().eq("id", id);
}

export async function castVoteRemote(
  supabase: SupabaseClient,
  noteId: string,
  userId: string,
  value: 1 | -1,
  currentValue: 1 | -1 | 0
) {
  if (currentValue === value) {
    await supabase.from("votes").delete().eq("note_id", noteId).eq("user_id", userId);
  } else {
    await supabase
      .from("votes")
      .upsert({ note_id: noteId, user_id: userId, value }, { onConflict: "note_id,user_id" });
  }
}

export async function toggleStarRemote(
  supabase: SupabaseClient,
  noteId: string,
  userId: string,
  starred: boolean
) {
  if (starred) {
    await supabase.from("stars").delete().eq("note_id", noteId).eq("user_id", userId);
  } else {
    await supabase.from("stars").insert({ note_id: noteId, user_id: userId });
  }
}

export async function toggleReactionRemote(
  supabase: SupabaseClient,
  noteId: string,
  userId: string,
  emoji: string,
  has: boolean
) {
  if (has) {
    await supabase
      .from("reactions")
      .delete()
      .eq("note_id", noteId)
      .eq("user_id", userId)
      .eq("emoji", emoji);
  } else {
    await supabase.from("reactions").insert({ note_id: noteId, user_id: userId, emoji });
  }
}

export async function addCommentRemote(
  supabase: SupabaseClient,
  noteId: string,
  authorId: string,
  text: string
) {
  await supabase.from("comments").insert({ note_id: noteId, author_id: authorId, text });
}

export async function deleteCommentRemote(supabase: SupabaseClient, id: string) {
  await supabase.from("comments").delete().eq("id", id);
}

export async function removeMemberRemote(
  supabase: SupabaseClient,
  boardId: string,
  userId: string
) {
  await supabase
    .from("board_members")
    .delete()
    .eq("board_id", boardId)
    .eq("user_id", userId);
}
