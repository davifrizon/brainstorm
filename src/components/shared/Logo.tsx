import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const APP_NAME = "Brainstorm";

export function Logo({
  className,
  iconOnly = false,
  href = "/",
}: {
  className?: string;
  iconOnly?: boolean;
  href?: string | null;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="grid size-7 place-items-center rounded-xl bg-gradient-to-br from-accent-violet to-accent-blue text-white shadow-sm">
        <Sparkles className="size-4" strokeWidth={2.5} />
      </span>
      {!iconOnly && <span>{APP_NAME}</span>}
    </span>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
