import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchForm } from "@/components/ui/SearchForm";
import { PostCard, toPostCardData } from "@/components/content/PostCard";
import { JobCard } from "@/components/content/JobCard";
import { getPublishedPosts } from "@/lib/services/posts";
import { getPublishedJobs } from "@/lib/services/jobs";
import { getCategories } from "@/lib/services/categories";
import { getTags } from "@/lib/services/tags";
import { buildIdMap } from "@/lib/format";

export const metadata: Metadata = {
  title: "Search",
  description: "Search jobs, articles, interview preparation, and system design content.",
};

export const dynamic = "force-dynamic";

const RESULT_LIMIT = 10;
// Basic in-memory matching over recently published content — the full-text
// search system belongs to a later phase; this keeps the UI functional
// without adding search infrastructure.
const CANDIDATE_LIMIT = 100;

function matches(query: string, ...fields: (string | null | undefined)[]): boolean {
  const needle = query.toLowerCase();
  return fields.some((field) => field?.toLowerCase().includes(needle));
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const qParam = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = qParam?.trim() ?? "";

  if (!query) {
    return (
      <Container className="flex flex-col gap-8 py-12">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Search
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Search jobs, articles, interview preparation, and system design content.
          </p>
        </div>
        <SearchForm size="lg" />
        <EmptyState title="Enter a search term to get started." />
      </Container>
    );
  }

  const [allPosts, allJobs, categories, tags] = await Promise.all([
    getPublishedPosts({ limit: CANDIDATE_LIMIT }),
    getPublishedJobs({ limit: CANDIDATE_LIMIT }),
    getCategories(),
    getTags(),
  ]);

  const categoryNameById = buildIdMap(categories, "name");
  const tagNameById = buildIdMap(tags, "name");

  const matchedPosts = allPosts
    .filter((post) => matches(query, post.title, post.excerpt))
    .slice(0, RESULT_LIMIT);
  const matchedJobs = allJobs
    .filter((job) => matches(query, job.title, job.company, job.location))
    .slice(0, RESULT_LIMIT);

  const hasResults = matchedPosts.length > 0 || matchedJobs.length > 0;

  return (
    <Container className="flex flex-col gap-10 py-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Search
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Results for &ldquo;{query}&rdquo;
        </p>
      </div>

      <SearchForm defaultValue={query} size="lg" />

      {!hasResults && (
        <EmptyState
          title={`No results found for "${query}".`}
          description="Try a different search term."
        />
      )}

      {matchedJobs.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Jobs</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matchedJobs.map((job) => (
              <JobCard key={String(job._id)} job={job} />
            ))}
          </div>
        </section>
      )}

      {matchedPosts.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Content</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matchedPosts.map((post) => (
              <PostCard
                key={String(post._id)}
                post={toPostCardData(post, categoryNameById, tagNameById)}
                showType
              />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
