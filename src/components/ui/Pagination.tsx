import Link from "next/link";
import { buttonClasses } from "@/lib/styles";

function buildHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number
): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value);
    }
  }

  if (page > 1) {
    query.set("page", String(page));
  } else {
    query.delete("page");
  }

  const queryString = query.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Simple previous/next pagination. Whether "Next" is shown is a heuristic
 * (the current page came back full) rather than a total-count query, to
 * avoid adding a count query to the service layer for this.
 */
export function Pagination({
  basePath,
  currentPage,
  hasNextPage,
  searchParams = {},
}: {
  basePath: string;
  currentPage: number;
  hasNextPage: boolean;
  searchParams?: Record<string, string | undefined>;
}) {
  if (currentPage <= 1 && !hasNextPage) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      {currentPage > 1 ? (
        <Link href={buildHref(basePath, searchParams, currentPage - 1)} className={buttonClasses("secondary")}>
          ← Previous
        </Link>
      ) : (
        <span />
      )}

      <span className="text-sm text-zinc-500 dark:text-zinc-400">Page {currentPage}</span>

      {hasNextPage ? (
        <Link href={buildHref(basePath, searchParams, currentPage + 1)} className={buttonClasses("secondary")}>
          Next →
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
