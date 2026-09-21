"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function extractBoardId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/\/board\/([a-zA-Z0-9-]+)/);
  if (match) return match[1];
  return trimmed;
}

export function JoinBoardDialog({
  onJoin,
}: {
  onJoin: (boardId: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleJoin() {
    const boardId = extractBoardId(value);
    if (!boardId) {
      toast.error("Cola o link ou o código do board");
      return;
    }
    setLoading(true);
    try {
      await onJoin(boardId);
      setOpen(false);
      setValue("");
      router.push(`/board/${boardId}`);
    } catch {
      toast.error("Não achei esse board");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="gap-2" />}>
        <LogIn className="size-4" />
        Entrar num board
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Entrar num board</DialogTitle>
          <DialogDescription>
            Cola o link que um amigo te mandou.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="board-link">Link ou código do board</Label>
          <Input
            id="board-link"
            placeholder="brainstorm.app/board/abc123"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button onClick={handleJoin} disabled={loading} className="w-full">
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
