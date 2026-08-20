import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { PostCard, toPostCardData } from "@/components/content/PostCard";
import { getPublishedPosts } from "@/lib/services/posts";
import { getCategories } from "@/lib/services/categories";
import { getTags } from "@/lib/services/tags";
import { buildIdMap } from "@/lib/format";

export const metadata: Metadata = {
  title: "System Design",
  description: "System design fundamentals, architecture, and scalability walkthroughs.",
};

const PAGE_SIZE = 12;

export default async function SystemDesignPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Number(pageParam) || 1);

  const [posts, categories, tags] = await Promise.all([
    getPublishedPosts({ type: "SYSTEM_DESIGN", page, limit: PAGE_SIZE }),
    getCategories(),
    getTags(),
  ]);

  const categoryNameById = buildIdMap(categories, "name");
  const tagNameById = buildIdMap(tags, "name");

  return (
    <Container className="flex flex-col gap-8 py-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          System Design
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Architecture, scalability, databases, caching, and system design interview
          walkthroughs.
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={String(post._id)}
              post={toPostCardData(post, categoryNameById, tagNameById)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No system design content has been published yet."
          description="Check back soon — new articles will appear here as they're published."
        />
      )}

      <Pagination
        basePath="/system-design"
        currentPage={page}
        hasNextPage={posts.length === PAGE_SIZE}
      />
    </Container>
  );
}
