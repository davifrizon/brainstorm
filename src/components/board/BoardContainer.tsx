"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BoardHeader } from "@/components/board/BoardHeader";
import { BoardCanvas } from "@/components/board/BoardCanvas";
import { Toolbar } from "@/components/board/Toolbar";
import { CommentPanel } from "@/components/board/CommentPanel";
import { ActivityFeed } from "@/components/board/ActivityFeed";
import { VotingPanel } from "@/components/board/VotingPanel";
import { useBoardData } from "@/hooks/useBoardData";
import { usePresence, profileToSelf } from "@/hooks/usePresence";
import { useDemoStore } from "@/lib/store/demo-store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { randomIdeaPrompt } from "@/lib/ideas";
import { randomNoteColor } from "@/lib/colors";
import type { ToolId } from "@/types";

export function BoardContainer({ boardId }: { boardId: string }) {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const {
    userId,
    profile,
    board,
    notes,
    frames,
    connections,
    members,
    myRole,
    loading,
    actions,
  } = useBoardData(boardId);

  const self = profileToSelf(profile);
  const { peers, updateCursor } = usePresence(boardId, self);

  const [tool, setTool] = useState<ToolId>("select");
  const [votingMode, setVotingMode] = useState(false);
  const [commentNoteId, setCommentNoteId] = useState<string | null>(null);
  const [activityOpen, setActivityOpen] = useState(false);
  const [votingOpen, setVotingOpen] = useState(false);

  const demoSnapshot = useDemoStore((s) => s.snapshot);
  const demoUndo = useDemoStore((s) => s.undo);
  const demoRedo = useDemoStore((s) => s.redo);
  const canUndo = useDemoStore((s) => s.past.length > 0);
  const canRedo = useDemoStore((s) => s.future.length > 0);

  const snapshotBeforeEdit = useCallback(() => {
    if (!configured) demoSnapshot();
  }, [configured, demoSnapshot]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (configured) return;
        if (e.shiftKey) demoRedo();
        else demoUndo();
        return;
      }

      const map: Record<string, ToolId> = {
        v: "select",
        n: "sticky",
        t: "text",
        d: "draw",
        a: "arrow",
        f: "frame",
        c: "comment",
      };
      const t = map[e.key.toLowerCase()];
      if (t) setTool(t);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [configured, demoUndo, demoRedo]);

  function handleGenerateIdea() {
    const prompt = randomIdeaPrompt();
    actions.addNote({
      x: 400 + Math.random() * 200,
      y: 300 + Math.random() * 200,
      text: prompt,
      color: randomNoteColor(),
    });
    toast("Nova ideia jogada no board", { description: prompt });
  }

  function handleRemoveMember(userId: string) {
    if (!configured) {
      useDemoStore.getState().removeMember(boardId, userId);
      return;
    }
    // handled via server-side RLS-guarded mutation
    import("@/lib/data/mutations").then(({ removeMemberRemote }) => {
      import("@/lib/supabase/client").then(({ createClient }) =>
        removeMemberRemote(createClient(), boardId, userId)
      );
    });
  }

  function handleLeave() {
    if (!configured) {
      useDemoStore.getState().leaveBoard(boardId);
    } else if (userId) {
      import("@/lib/data/mutations").then(({ removeMemberRemote }) => {
        import("@/lib/supabase/client").then(({ createClient }) =>
          removeMemberRemote(createClient(), boardId, userId)
        );
      });
    }
    toast("Você saiu do board");
    router.push("/dashboard");
  }

  if (!loading && !board) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-medium">Esse board não existe (ou sumiu).</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-accent-violet hover:underline"
        >
          Voltar pro dashboard
        </button>
      </div>
    );
  }

  const commentNote = notes.find((n) => n.id === commentNoteId) ?? null;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <BoardHeader
        board={board ?? null}
        members={members}
        myRole={myRole}
        currentUserId={userId}
        peers={peers}
        connectionStatus={loading ? "connecting" : "live"}
        votingMode={votingMode}
        onToggleVotingMode={setVotingMode}
        onOpenActivity={() => setActivityOpen(true)}
        onOpenVoting={() => setVotingOpen(true)}
        onGenerateIdea={handleGenerateIdea}
        onRename={(name) => renameBoard(configured, boardId, name)}
        onRemoveMember={handleRemoveMember}
        onLeave={handleLeave}
      />

      <div className="relative flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Carregando board…
          </div>
        ) : (
          <BoardCanvas
            notes={notes}
            frames={frames}
            connections={connections}
            tool={tool}
            setTool={setTool}
            votingMode={votingMode}
            peers={peers}
            updateCursor={updateCursor}
            onOpenComments={setCommentNoteId}
            actions={actions}
            snapshotBeforeEdit={snapshotBeforeEdit}
          />
        )}

        <Toolbar
          tool={tool}
          setTool={setTool}
          onUndo={demoUndo}
          onRedo={demoRedo}
          canUndo={!configured && canUndo}
          canRedo={!configured && canRedo}
        />
      </div>

      <CommentPanel
        note={commentNote}
        currentUserId={userId}
        onOpenChange={(open) => !open && setCommentNoteId(null)}
      />
      <ActivityFeed boardId={boardId} open={activityOpen} onOpenChange={setActivityOpen} />
      <VotingPanel
        notes={notes}
        open={votingOpen}
        onOpenChange={setVotingOpen}
        onVote={actions.vote}
      />
    </div>
  );
}

function renameBoard(configured: boolean, boardId: string, name: string) {
  if (!configured) {
    useDemoStore.setState((s) => ({
      boards: s.boards.map((b) => (b.id === boardId ? { ...b, name } : b)),
    }));
    return;
  }
  import("@/lib/supabase/client").then(({ createClient }) => {
    createClient().from("boards").update({ name }).eq("id", boardId).then();
  });
}
