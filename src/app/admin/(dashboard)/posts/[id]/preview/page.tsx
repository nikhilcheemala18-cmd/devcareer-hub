import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleHeader, type ArticleHeaderData } from "@/components/content/ArticleHeader";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getPostById } from "@/lib/services/posts";
import { getUserById } from "@/lib/services/users";
import { getMediaById } from "@/lib/services/media";
import { getCategories } from "@/lib/services/categories";
import { getTags } from "@/lib/services/tags";
import { buildIdMap } from "@/lib/format";

// Protected by the admin layout's requireAdmin(); never linked publicly.
// noindex is defense-in-depth in case a URL ever leaks.
export const metadata: Metadata = {
  title: "Preview Post",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function loadPost(id: string) {
  try {
    return await getPostById(id);
  } catch {
    return null;
  }
}

export default async function PreviewPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await loadPost(id);

  if (!post) {
    notFound();
  }

  const [author, media, categories, tags] = await Promise.all([
    getUserById(String(post.author)),
    post.featuredImage ? getMediaById(String(post.featuredImage)) : Promise.resolve(null),
    getCategories(),
    getTags(),
  ]);

  const categoryNameById = buildIdMap(categories, "name");
  const tagNameById = buildIdMap(tags, "name");

  const articleData: ArticleHeaderData = {
    title: post.title,
    excerpt: post.excerpt,
    type: post.type,
    publishedAt: post.publishedAt,
    categoryName: post.category ? categoryNameById.get(String(post.category)) : undefined,
    tagNames: post.tags
      ?.map((tag) => tagNameById.get(String(tag)))
      .filter((name): name is string => Boolean(name)),
    authorName: author?.name,
    featuredImageUrl: media?.url,
    featuredImageAlt: media?.altText ?? undefined,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-indigo-300 bg-indigo-50 px-4 py-3 text-sm dark:border-indigo-800 dark:bg-indigo-950">
        <span className="text-indigo-800 dark:text-indigo-200">
          Admin preview — not the public URL. <StatusBadge status={post.status} />
        </span>
        <Link
          href={`/admin/posts/${id}/edit`}
          className="font-medium text-indigo-700 hover:underline dark:text-indigo-300"
        >
          ← Back to edit
        </Link>
      </div>

      <div className="flex flex-col gap-8">
        <ArticleHeader article={articleData} />
        <ContentRenderer content={post.content} />
      </div>
    </div>
  );
}
