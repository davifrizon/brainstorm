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

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
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

            <Button
              variant="outline"
              className="mb-4 w-full gap-2"
              onClick={handleGoogle}
            >
              <GoogleIcon />
              Continuar com Google
            </Button>

            <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              ou
              <div className="h-px flex-1 bg-border" />
            </div>

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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
