import Link from "next/link";

export function SectionHeader({
  title,
  description,
  viewAllHref,
  viewAllLabel = "View all",
}: {
  title: string;
  description?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        )}
      </div>

      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {viewAllLabel} →
        </Link>
      )}
    </div>
  );
}
