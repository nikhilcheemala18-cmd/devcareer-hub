import Link from "next/link";
import { cardClasses, cn } from "@/lib/styles";

/**
 * No per-category browsing route exists yet, so every category links to the
 * general Blog hub rather than a filtered view.
 */
export function CategoryCard({
  name,
  description,
}: {
  name: string;
  description?: string | null;
}) {
  return (
    <Link href="/blog" className={cn(cardClasses, "block")}>
      <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{name}</h3>
      {description && (
        <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      )}
    </Link>
  );
}
