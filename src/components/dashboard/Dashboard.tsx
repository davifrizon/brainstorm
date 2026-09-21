"use client";

import { useMemo, useState } from "react";
import { Search, LayoutGrid } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BoardCard } from "@/components/dashboard/BoardCard";
import { CreateBoardDialog } from "@/components/dashboard/CreateBoardDialog";
import { JoinBoardDialog } from "@/components/dashboard/JoinBoardDialog";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useBoardsData } from "@/hooks/useBoardsData";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type SortKey = "recent" | "name" | "members";

export function Dashboard() {
  const { boards, loading, createBoard, joinBoard } = useBoardsData();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const configured = isSupabaseConfigured();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q ? boards.filter((b) => b.name.toLowerCase().includes(q)) : boards;
    list = [...list];
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "members") list.sort((a, b) => b.memberCount - a.memberCount);
    if (sort === "recent")
      list.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    return list;
  }, [boards, query, sort]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {!configured && (
          <div className="mb-6 rounded-xl border border-accent-violet/30 bg-accent-violet/10 px-4 py-3 text-sm text-accent-violet">
            Modo demo ativo — os dados ficam só no seu navegador. Configure o
            Supabase (veja o <code>.env.local.example</code>) pra ativar
            contas reais e sincronização entre pessoas.
          </div>
        )}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Seus boards</h1>
            <p className="text-sm text-muted-foreground">
              {boards.length} {boards.length === 1 ? "board" : "boards"} • bora pensar junto
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <JoinBoardDialog onJoin={joinBoard} />
            <CreateBoardDialog onCreate={createBoard} />
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar board…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Editado recentemente</SelectItem>
              <SelectItem value="name">Nome (A-Z)</SelectItem>
              <SelectItem value="members">Mais membros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-border bg-card"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasQuery={query.length > 0} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((board, i) => (
              <BoardCard key={board.id} board={board} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-accent">
        <LayoutGrid className="size-6 text-accent-foreground" />
      </div>
      <h3 className="mb-1 font-medium">
        {hasQuery ? "Nenhum board encontrado" : "Nenhum board ainda"}
      </h3>
      <p className="max-w-xs text-sm text-muted-foreground">
        {hasQuery
          ? "Tenta buscar por outro nome."
          : "Crie o primeiro board pra começar a jogar ideia com a galera."}
      </p>
    </div>
  );
}
