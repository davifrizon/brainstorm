import Link from "next/link";
import { ArrowRight, Users, Zap, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { BoardPreview } from "@/components/landing/BoardPreview";

const FEATURES = [
  {
    icon: Zap,
    title: "Tempo real de verdade",
    body: "Cada nota, arrasto e reação aparece pra todo mundo na hora, sem F5.",
  },
  {
    icon: Users,
    title: "Feito pra grupo pequeno",
    body: "Sem hierarquia corporativa. Só você e a galera jogando ideia na parede.",
  },
  {
    icon: Vote,
    title: "Vote no caos",
    body: "Upvote, downvote e favoritos pra descobrir qual ideia sobrevive.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
            Entrar
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/login?intent=create" />}
            className="gap-1.5"
          >
            Criar um board
            <ArrowRight className="size-4" />
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 pt-16 pb-10 text-center sm:pt-24">
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            feito para um grupo de amigos, não uma empresa
          </span>
          <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
            Think together.
          </h1>
          <p className="max-w-xl text-balance text-lg text-muted-foreground sm:text-xl">
            A shared space for ideas, chaos and questionable decisions.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/login?intent=create" />}
              className="gap-1.5 text-base"
            >
              Create a board
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/login?intent=join" />}
              className="text-base"
            >
              Join a board
            </Button>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 pb-20 sm:pb-28">
          <BoardPreview />
        </section>

        <section className="mx-auto grid w-full max-w-5xl gap-6 px-6 pb-28 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-accent-violet/40"
            >
              <div className="mb-4 grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <f.icon className="size-5" />
              </div>
              <h3 className="mb-1.5 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-muted-foreground sm:flex-row">
          <Logo iconOnly={false} className="text-sm" href={null} />
          <p>feito pra quem gosta de jogar ideia bagunçada na parede.</p>
        </div>
      </footer>
    </div>
  );
}
