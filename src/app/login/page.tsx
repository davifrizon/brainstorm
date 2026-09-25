"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/Logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

function LoginContent() {
  const configured = isSupabaseConfigured();
  const router = useRouter();
  const params = useSearchParams();
  const intent = params.get("next") ?? params.get("intent");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleMagicLink() {
    if (!email.includes("@")) {
      toast.error("Digita um e-mail válido");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          typeof intent === "string" && intent.startsWith("/") ? intent : "/dashboard"
        )}`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo className="text-lg" href={null} />
        </div>

        {!configured ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <Sparkles className="mx-auto mb-3 size-8 text-accent-violet" />
            <h1 className="mb-1 font-semibold">Modo demo</h1>
            <p className="mb-5 text-sm text-muted-foreground">
              O Supabase ainda não tá configurado neste ambiente, então tá
              rodando tudo local no seu navegador — sem precisar logar.
            </p>
            <Button className="w-full" onClick={() => router.push("/dashboard")}>
              Entrar no modo demo
            </Button>
          </div>
        ) : sent ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <Mail className="mx-auto mb-3 size-8 text-accent-violet" />
            <h1 className="mb-1 font-semibold">Cheque seu e-mail</h1>
            <p className="text-sm text-muted-foreground">
              Mandamos um link mágico pra <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h1 className="mb-1 text-center font-semibold">Bem-vindo de volta</h1>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Entre pra pensar junto com a galera.
            </p>

            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
              />
            </div>
            <Button
              className="mt-4 w-full"
              onClick={handleMagicLink}
              disabled={loading}
            >
              {loading ? "Enviando…" : "Enviar link mágico"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
