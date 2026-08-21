import { cardClasses, cn } from "@/lib/styles";

export function AdminStatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "muted";
}) {
  return (
    <div className={cn(cardClasses, "p-4")}>
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold",
          tone === "muted" ? "text-zinc-500 dark:text-zinc-500" : "text-zinc-950 dark:text-zinc-50"
        )}
      >
        {value}
      </p>
    </div>
  );
}
