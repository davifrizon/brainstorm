import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8 flex justify-center">
          <Logo className="text-lg" href={null} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <Compass className="mx-auto mb-3 size-8 text-accent-violet" />
          <h1 className="mb-1 font-semibold">Essa página se perdeu</h1>
          <p className="mb-5 text-sm text-muted-foreground">
            Não achamos nada por aqui. Talvez o link esteja errado ou o board
            não exista mais.
          </p>
          <Button className="w-full" nativeButton={false} render={<Link href="/dashboard" />}>
            Voltar pro dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
