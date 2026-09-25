"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type {
  ActivityItem,
  ActivityType,
  Board,
  BoardMember,
  Comment,
  Connection,
  Frame,
} from "@/types";
import {
  DEMO_USER_ID,
  demoActivity,
  demoBoardMembers,
  demoBoards,
  demoComments,
  demoConnections,
  demoFrames,
  demoNotes,
  demoProfiles,
  demoReactions,
  demoStars,
  demoVotes,
} from "@/lib/demo/seed";
import { randomNoteColor } from "@/lib/colors";

export { DEMO_USER_ID };

interface RawNote {
  id: string;
  boardId: string;
  authorId: string;
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
}

interface DemoProfile {
  id: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  status: string | null;
  onboarded: boolean;
  email?: string | null;
}

interface HistorySlice {
  notes: RawNote[];
  frames: Frame[];
  connections: Connection[];
}

interface DemoState {
  currentUserId: string;
  profiles: DemoProfile[];
  boards: Board[];
  boardMembers: BoardMember[];
  frames: Frame[];
  notes: RawNote[];
  votes: Array<{ noteId: string; userId: string; value: 1 | -1 }>;
  stars: Array<{ noteId: string; userId: string }>;
  reactions: Array<{ id: string; noteId: string; userId: string; emoji: string }>;
  comments: Comment[];
  connections: Connection[];
  activity: ActivityItem[];
  maxZIndex: number;
  past: HistorySlice[];
  future: HistorySlice[];

  snapshot: () => void;
  undo: () => void;
  redo: () => void;

  updateProfile: (patch: Partial<DemoProfile>) => void;
  createBoard: (name: string, emoji: string) => string;
  joinBoard: (boardId: string) => void;
  leaveBoard: (boardId: string) => void;
  removeMember: (boardId: string, userId: string) => void;

  addNote: (boardId: string, partial?: Partial<RawNote>) => string;
  updateNote: (id: string, patch: Partial<RawNote>) => void;
  moveNote: (id: string, x: number, y: number) => void;
  resizeNote: (id: string, width: number, height: number) => void;
  deleteNote: (id: string) => void;
  bringToFront: (id: string) => void;

  addFrame: (boardId: string, partial?: Partial<Frame>) => string;
  updateFrame: (id: string, patch: Partial<Frame>) => void;
  deleteFrame: (id: string) => void;

  addConnection: (boardId: string, fromNoteId: string, toNoteId: string) => void;
  deleteConnection: (id: string) => void;

  vote: (noteId: string, value: 1 | -1) => void;
  toggleStar: (noteId: string) => void;
  toggleReaction: (noteId: string, emoji: string) => void;

  addComment: (noteId: string, text: string) => void;
  deleteComment: (id: string) => void;

  logActivity: (boardId: string, type: ActivityType, payload: Record<string, unknown>) => void;
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "brainstorm-demo-store") {
      useDemoStore.persist.rehydrate();
    }
  });
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      currentUserId: DEMO_USER_ID,
      profiles: demoProfiles,
      boards: demoBoards,
      boardMembers: demoBoardMembers,
      frames: demoFrames,
      notes: demoNotes,
      votes: demoVotes,
      stars: demoStars,
      reactions: demoReactions,
      comments: demoComments,
      connections: demoConnections,
      activity: demoActivity,
      maxZIndex: 10,
      past: [],
      future: [],

      snapshot: () =>
        set((s) => ({
          past: [
            ...s.past,
            { notes: s.notes, frames: s.frames, connections: s.connections },
          ].slice(-50),
          future: [],
        })),

      undo: () => {
        const s = get();
        const prev = s.past[s.past.length - 1];
        if (!prev) return;
        set({
          notes: prev.notes,
          frames: prev.frames,
          connections: prev.connections,
          past: s.past.slice(0, -1),
          future: [
            { notes: s.notes, frames: s.frames, connections: s.connections },
            ...s.future,
          ].slice(0, 50),
        });
      },

      redo: () => {
        const s = get();
        const next = s.future[0];
        if (!next) return;
        set({
          notes: next.notes,
          frames: next.frames,
          connections: next.connections,
          future: s.future.slice(1),
          past: [
            ...s.past,
            { notes: s.notes, frames: s.frames, connections: s.connections },
          ].slice(-50),
        });
      },

      updateProfile: (patch) =>
        set((s) => ({
          profiles: s.profiles.map((p) =>
            p.id === s.currentUserId ? { ...p, ...patch } : p
          ),
        })),

      createBoard: (name, emoji) => {
        const id = nanoid(10);
        const nowIso = new Date().toISOString();
        set((s) => ({
          boards: [
            ...s.boards,
            {
              id,
              name,
              emoji,
              ownerId: s.currentUserId,
              isDemo: false,
              createdAt: nowIso,
              updatedAt: nowIso,
            },
          ],
          boardMembers: [
            ...s.boardMembers,
            { boardId: id, userId: s.currentUserId, role: "owner", joinedAt: nowIso },
          ],
        }));
        return id;
      },

      joinBoard: (boardId) => {
        const s = get();
        if (s.boardMembers.some((m) => m.boardId === boardId && m.userId === s.currentUserId)) {
          return;
        }
        set((st) => ({
          boardMembers: [
            ...st.boardMembers,
            {
              boardId,
              userId: st.currentUserId,
              role: "member",
              joinedAt: new Date().toISOString(),
            },
          ],
        }));
      },

      leaveBoard: (boardId) =>
        set((s) => ({
          boardMembers: s.boardMembers.filter(
            (m) => !(m.boardId === boardId && m.userId === s.currentUserId)
          ),
        })),

      removeMember: (boardId, userId) =>
        set((s) => ({
          boardMembers: s.boardMembers.filter(
            (m) => !(m.boardId === boardId && m.userId === userId)
          ),
        })),

      addNote: (boardId, partial) => {
        get().snapshot();
        const id = nanoid(10);
        const nowIso = new Date().toISOString();
        const z = get().maxZIndex + 1;
        set((s) => ({
          notes: [
            ...s.notes,
            {
              id,
              boardId,
              authorId: s.currentUserId,
              frameId: null,
              text: "",
              color: randomNoteColor(),
              x: 200,
              y: 200,
              width: 220,
              height: 190,
              rotation: (Math.random() * 6 - 3),
              zIndex: z,
              createdAt: nowIso,
              updatedAt: nowIso,
              ...partial,
            },
          ],
          maxZIndex: z,
          boards: s.boards.map((b) => (b.id === boardId ? { ...b, updatedAt: nowIso } : b)),
        }));
        get().logActivity(boardId, "note_created", {});
        return id;
      },

      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n
          ),
        })),

      moveNote: (id, x, y) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, x, y } : n)),
        })),

      resizeNote: (id, width, height) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, width, height } : n)),
        })),

      deleteNote: (id) => {
        get().snapshot();
        set((s) => ({
          notes: s.notes.filter((n) => n.id !== id),
          votes: s.votes.filter((v) => v.noteId !== id),
          stars: s.stars.filter((v) => v.noteId !== id),
          reactions: s.reactions.filter((v) => v.noteId !== id),
          comments: s.comments.filter((v) => v.noteId !== id),
          connections: s.connections.filter(
            (c) => c.fromNoteId !== id && c.toNoteId !== id
          ),
        }));
      },

      bringToFront: (id) => {
        const z = get().maxZIndex + 1;
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, zIndex: z } : n)),
          maxZIndex: z,
        }));
      },

      addFrame: (boardId, partial) => {
        get().snapshot();
        const id = nanoid(10);
        set((s) => ({
          frames: [
            ...s.frames,
            {
              id,
              boardId,
              name: "New frame",
              color: "#8b8fa3",
              x: 120,
              y: 120,
              width: 480,
              height: 360,
              ...partial,
            },
          ],
        }));
        get().logActivity(boardId, "frame_created", { name: partial?.name ?? "New frame" });
        return id;
      },

      updateFrame: (id, patch) =>
        set((s) => ({
          frames: s.frames.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),

      deleteFrame: (id) => {
        get().snapshot();
        set((s) => ({
          frames: s.frames.filter((f) => f.id !== id),
          notes: s.notes.map((n) => (n.frameId === id ? { ...n, frameId: null } : n)),
        }));
      },

      addConnection: (boardId, fromNoteId, toNoteId) => {
        if (fromNoteId === toNoteId) return;
        get().snapshot();
        set((s) => ({
          connections: [
            ...s.connections,
            { id: nanoid(10), boardId, fromNoteId, toNoteId },
          ],
        }));
      },

      deleteConnection: (id) => {
        get().snapshot();
        set((s) => ({ connections: s.connections.filter((c) => c.id !== id) }));
      },

      vote: (noteId, value) => {
        const s = get();
        const existing = s.votes.find(
          (v) => v.noteId === noteId && v.userId === s.currentUserId
        );
        if (existing && existing.value === value) {
          set((st) => ({
            votes: st.votes.filter(
              (v) => !(v.noteId === noteId && v.userId === st.currentUserId)
            ),
          }));
        } else {
          set((st) => ({
            votes: [
              ...st.votes.filter(
                (v) => !(v.noteId === noteId && v.userId === st.currentUserId)
              ),
              { noteId, userId: st.currentUserId, value },
            ],
          }));
        }
        const note = s.notes.find((n) => n.id === noteId);
        get().logActivity(note?.boardId ?? "", "vote_cast", {});
      },

      toggleStar: (noteId) => {
        const s = get();
        const exists = s.stars.some(
          (v) => v.noteId === noteId && v.userId === s.currentUserId
        );
        set((st) => ({
          stars: exists
            ? st.stars.filter((v) => !(v.noteId === noteId && v.userId === st.currentUserId))
            : [...st.stars, { noteId, userId: st.currentUserId }],
        }));
      },

      toggleReaction: (noteId, emoji) => {
        const s = get();
        const exists = s.reactions.find(
          (r) => r.noteId === noteId && r.userId === s.currentUserId && r.emoji === emoji
        );
        if (exists) {
          set((st) => ({
            reactions: st.reactions.filter((r) => r.id !== exists.id),
          }));
        } else {
          set((st) => ({
            reactions: [
              ...st.reactions,
              { id: nanoid(8), noteId, userId: st.currentUserId, emoji },
            ],
          }));
          const note = s.notes.find((n) => n.id === noteId);
          get().logActivity(note?.boardId ?? "", "reaction_added", { emoji });
        }
      },

      addComment: (noteId, text) => {
        if (!text.trim()) return;
        const s = get();
        set((st) => ({
          comments: [
            ...st.comments,
            {
              id: nanoid(10),
              noteId,
              authorId: st.currentUserId,
              text: text.trim(),
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        const note = s.notes.find((n) => n.id === noteId);
        get().logActivity(note?.boardId ?? "", "comment_added", {});
      },

      deleteComment: (id) =>
        set((s) => ({ comments: s.comments.filter((c) => c.id !== id) })),

      logActivity: (boardId, type, payload) => {
        if (!boardId) return;
        set((st) => ({
          activity: [
            {
              id: nanoid(10),
              boardId,
              userId: st.currentUserId,
              type,
              payload,
              createdAt: new Date().toISOString(),
            },
            ...st.activity,
          ].slice(0, 100),
        }));
      },
    }),
    {
      name: "brainstorm-demo-store",
      version: 1,
      partialize: (s) => {
        const rest = { ...s };
        delete (rest as Partial<typeof rest>).past;
        delete (rest as Partial<typeof rest>).future;
        return rest;
      },
    }
  )
);
