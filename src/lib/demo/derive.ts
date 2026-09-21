import { useDemoStore } from "@/lib/store/demo-store";
import type { BoardSummary, Comment, Note, Profile } from "@/types";

type FullState = ReturnType<typeof useDemoStore.getState>;

export type DemoSnapshot = Pick<
  FullState,
  | "profiles"
  | "boardMembers"
  | "currentUserId"
  | "boards"
  | "notes"
  | "votes"
  | "reactions"
  | "stars"
  | "comments"
>;

export function profileById(
  state: Pick<FullState, "profiles">,
  id: string | null
): Profile | null {
  if (!id) return null;
  const p = state.profiles.find((p) => p.id === id);
  return p ?? null;
}

export function deriveBoardSummaries(state: DemoSnapshot): BoardSummary[] {
  const myMemberships = state.boardMembers.filter(
    (m) => m.userId === state.currentUserId
  );
  return myMemberships
    .map((m) => {
      const board = state.boards.find((b) => b.id === m.boardId);
      if (!board) return null;
      const members = state.boardMembers.filter((mm) => mm.boardId === board.id);
      const avatars = members
        .slice(0, 5)
        .map((mm) => profileById(state, mm.userId))
        .filter((p): p is Profile => Boolean(p));
      const noteCount = state.notes.filter((n) => n.boardId === board.id).length;
      return {
        ...board,
        memberCount: members.length,
        memberAvatars: avatars,
        noteCount,
        myRole: m.role,
      } satisfies BoardSummary;
    })
    .filter((b): b is BoardSummary => Boolean(b))
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function deriveNotes(state: DemoSnapshot, boardId: string): Note[] {
  return state.notes
    .filter((n) => n.boardId === boardId)
    .map((n) => {
      const votes = state.votes.filter((v) => v.noteId === n.id);
      const upvotes = votes.filter((v) => v.value === 1).length;
      const downvotes = votes.filter((v) => v.value === -1).length;
      const myVoteEntry = votes.find((v) => v.userId === state.currentUserId);
      const noteReactions = state.reactions.filter((r) => r.noteId === n.id);
      const reactions: Record<string, number> = {};
      for (const r of noteReactions) {
        reactions[r.emoji] = (reactions[r.emoji] ?? 0) + 1;
      }
      const myReactions = noteReactions
        .filter((r) => r.userId === state.currentUserId)
        .map((r) => r.emoji);
      const starCount = state.stars.filter((s) => s.noteId === n.id).length;
      const starred = state.stars.some(
        (s) => s.noteId === n.id && s.userId === state.currentUserId
      );
      const commentCount = state.comments.filter((c) => c.noteId === n.id).length;

      return {
        id: n.id,
        boardId: n.boardId,
        authorId: n.authorId,
        frameId: n.frameId,
        text: n.text,
        color: n.color,
        x: n.x,
        y: n.y,
        width: n.width,
        height: n.height,
        rotation: n.rotation,
        zIndex: n.zIndex,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
        author: profileById(state, n.authorId),
        upvotes,
        downvotes,
        myVote: myVoteEntry ? myVoteEntry.value : 0,
        starred,
        starCount,
        reactions,
        myReactions,
        commentCount,
      } satisfies Note;
    });
}

export function deriveComments(
  state: Pick<FullState, "comments" | "profiles">,
  noteId: string
): Comment[] {
  return state.comments
    .filter((c) => c.noteId === noteId)
    .map((c) => ({ ...c, author: profileById(state, c.authorId) }))
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
}
