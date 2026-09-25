export type BoardRole = "owner" | "member" | "viewer";

export interface Profile {
  id: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  status: string | null;
  onboarded: boolean;
  email?: string | null;
}

export interface Board {
  id: string;
  name: string;
  emoji: string;
  ownerId: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BoardMember {
  boardId: string;
  userId: string;
  role: BoardRole;
  joinedAt: string;
  profile?: Profile;
}

export interface BoardSummary extends Board {
  memberCount: number;
  memberAvatars: Profile[];
  noteCount: number;
  myRole: BoardRole;
}

export interface Frame {
  id: string;
  boardId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Note {
  id: string;
  boardId: string;
  authorId: string | null;
  frameId: string | null;
  text: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  createdAt: string;
  updatedAt: string;
  author?: Profile | null;
  upvotes: number;
  downvotes: number;
  myVote: 1 | -1 | 0;
  starred: boolean;
  starCount: number;
  reactions: Record<string, number>;
  myReactions: string[];
  commentCount: number;
}

export interface Connection {
  id: string;
  boardId: string;
  fromNoteId: string;
  toNoteId: string;
}

export interface Comment {
  id: string;
  noteId: string;
  authorId: string | null;
  author?: Profile | null;
  text: string;
  createdAt: string;
}

export type ActivityType =
  | "note_created"
  | "note_moved"
  | "note_deleted"
  | "note_edited"
  | "reaction_added"
  | "vote_cast"
  | "comment_added"
  | "frame_created"
  | "member_joined";

export interface ActivityItem {
  id: string;
  boardId: string;
  userId: string | null;
  actor?: Profile | null;
  type: ActivityType;
  payload: Record<string, unknown>;
  createdAt: string;
}

export type ToolId =
  | "select"
  | "sticky"
  | "text"
  | "draw"
  | "arrow"
  | "frame"
  | "comment";

export interface CursorPresence {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  color: string;
  x: number;
  y: number;
  updatedAt: number;
}

export type SortMode = "recent" | "votes" | "newest" | "discussed";
