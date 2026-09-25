"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8 flex justify-center">
          <Logo className="text-lg" href={null} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <AlertTriangle className="mx-auto mb-3 size-8 text-destructive" />
          <h1 className="mb-1 font-semibold">Deu ruim por aqui</h1>
          <p className="mb-5 text-sm text-muted-foreground">
            Alguma coisa quebrou nessa página. Tenta de novo — se continuar
            acontecendo, é bug mesmo.
          </p>
          <Button className="w-full" onClick={reset}>
            Tentar de novo
          </Button>
        </div>
      </div>
    </div>
  );
}
