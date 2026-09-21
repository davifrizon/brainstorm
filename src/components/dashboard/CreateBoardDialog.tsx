"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
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

const EMOJIS = ["🧠", "💡", "🎲", "🛠️", "✈️", "🍕", "🎯", "🔥"];

export function CreateBoardDialog({
  onCreate,
}: {
  onCreate: (name: string, emoji: string) => Promise<string | null | undefined>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Dá um nome pro board primeiro");
      return;
    }
    setLoading(true);
    const id = await onCreate(name.trim(), emoji);
    setLoading(false);
    if (!id) {
      toast.error("Não rolou criar o board, tenta de novo");
      return;
    }
    setOpen(false);
    setName("");
    toast.success("Board criado!");
    router.push(`/board/${id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="size-4" />
        Criar board
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo board</DialogTitle>
          <DialogDescription>
            Um espaço em branco pra jogar ideia na parede com a galera.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="board-name">Nome</Label>
            <Input
              id="board-name"
              placeholder="Ex: Ideias pra viagem"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`grid size-10 place-items-center rounded-xl border text-xl transition-colors ${
                    emoji === e
                      ? "border-accent-violet bg-accent-violet/15"
                      : "border-border bg-secondary hover:bg-accent"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleCreate} disabled={loading} className="w-full">
            {loading ? "Criando…" : "Criar board"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
