import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cardClasses, cn } from "@/lib/styles";
import { formatDate, formatEnumLabel } from "@/lib/format";

export interface PostCardData {
  slug: string;
  title: string;
  excerpt?: string | null;
  type: string;
  publishedAt?: Date | string | null;
  categoryName?: string;
  tagNames?: string[];
}

interface PostLike {
  slug: string;
  title: string;
  excerpt?: string | null;
  type: string;
  publishedAt?: Date | null;
  category?: unknown;
  tags?: unknown[];
}

/** Listing routes (and therefore detail routes) only exist for these post types so far. */
const DETAIL_PATH_BY_TYPE: Record<string, string> = {
  BLOG: "/blog",
  INTERVIEW_PREP: "/interview-prep",
  SYSTEM_DESIGN: "/system-design",
};

export function postDetailHref(post: { type: string; slug: string }): string | null {
  const basePath = DETAIL_PATH_BY_TYPE[post.type];
  return basePath ? `${basePath}/${post.slug}` : null;
}

/**
 * Builds PostCardData explicitly instead of spreading the Mongoose document —
 * hydrated documents only expose schema fields through getters, not as
 * own-enumerable properties, so `{...doc}` silently drops them.
 */
export function toPostCardData(
  post: PostLike,
  categoryNameById: Map<string, string>,
  tagNameById?: Map<string, string>
): PostCardData {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    type: post.type,
    publishedAt: post.publishedAt,
    categoryName: post.category ? categoryNameById.get(String(post.category)) : undefined,
    tagNames: tagNameById
      ? post.tags?.map((tag) => tagNameById.get(String(tag))).filter((name): name is string => Boolean(name))
      : undefined,
  };
}

export function PostCard({ post, showType = false }: { post: PostCardData; showType?: boolean }) {
  const publishedLabel = formatDate(post.publishedAt);
  const href = postDetailHref(post);

  const body = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {showType && <Badge tone="accent">{formatEnumLabel(post.type)}</Badge>}
        {post.categoryName && <Badge>{post.categoryName}</Badge>}
      </div>

      <h3 className="mt-3 text-lg font-semibold text-zinc-950 dark:text-zinc-50">{post.title}</h3>

      {post.excerpt && (
        <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        {publishedLabel && <span>{publishedLabel}</span>}
        {post.tagNames && post.tagNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tagNames.map((tag) => (
              <span key={tag} className="text-zinc-400 dark:text-zinc-500">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (!href) {
    return <article className={cardClasses}>{body}</article>;
  }

  return (
    <Link href={href} className={cn(cardClasses, "block")}>
      {body}
    </Link>
  );
}
