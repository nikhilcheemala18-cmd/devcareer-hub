import { Badge } from "@/components/ui/Badge";
import { formatDate, formatEnumLabel } from "@/lib/format";

export interface ArticleHeaderData {
  title: string;
  excerpt?: string | null;
  type: string;
  publishedAt?: Date | string | null;
  categoryName?: string;
  tagNames?: string[];
  authorName?: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
}

export function ArticleHeader({ article }: { article: ArticleHeaderData }) {
  const publishedLabel = formatDate(article.publishedAt);

  return (
    <header className="flex flex-col gap-4">
      {article.featuredImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- source host isn't known ahead of time (no media storage provider configured yet)
        <img
          src={article.featuredImageUrl}
          alt={article.featuredImageAlt ?? ""}
          className="w-full rounded-lg"
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{formatEnumLabel(article.type)}</Badge>
        {article.categoryName && <Badge>{article.categoryName}</Badge>}
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
        {article.title}
      </h1>

      {article.excerpt && (
        <p className="text-lg text-zinc-600 dark:text-zinc-400">{article.excerpt}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
        {article.authorName && <span>{article.authorName}</span>}
        {article.authorName && publishedLabel && <span aria-hidden>·</span>}
        {publishedLabel && <span>{publishedLabel}</span>}
      </div>

      {article.tagNames && article.tagNames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.tagNames.map((tag) => (
            <span key={tag} className="text-sm text-zinc-400 dark:text-zinc-500">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
