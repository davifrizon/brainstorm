import { cn } from "@/lib/utils";

export function ConnectionStatus({ status }: { status: "live" | "connecting" }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "live" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
        )}
      />
      {status === "live" ? "Live" : "Conectando…"}
    </span>
  );
}
