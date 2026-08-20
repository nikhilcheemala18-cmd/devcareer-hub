import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchForm } from "@/components/ui/SearchForm";
import { PostCard, toPostCardData } from "@/components/content/PostCard";
import { JobCard } from "@/components/content/JobCard";
import { CategoryCard } from "@/components/content/CategoryCard";
import { getPublishedJobs } from "@/lib/services/jobs";
import { getPublishedPosts } from "@/lib/services/posts";
import { getCategories } from "@/lib/services/categories";
import { buildIdMap } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [latestJobs, latestBlogPosts, interviewPrepPosts, systemDesignPosts, featuredPosts, categories] =
    await Promise.all([
      getPublishedJobs({ limit: 4 }),
      getPublishedPosts({ type: "BLOG", limit: 4 }),
      getPublishedPosts({ type: "INTERVIEW_PREP", limit: 3 }),
      getPublishedPosts({ type: "SYSTEM_DESIGN", limit: 3 }),
      getPublishedPosts({ limit: 6 }),
      getCategories(),
    ]);

  const categoryNameById = buildIdMap(categories, "name");

  return (
    <>
      <section className="border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white dark:border-zinc-800 dark:from-zinc-950 dark:to-black">
        <Container className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl">
            Jobs, Interview Preparation &amp; Developer Resources
          </h1>
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Find software engineering roles, prepare for technical interviews, and learn system
            design and core programming concepts — all in one place.
          </p>
          <SearchForm size="lg" />
        </Container>
      </section>

      <Container className="flex flex-col gap-16 py-16 sm:py-20">
        <section className="flex flex-col gap-6">
          <SectionHeader
            title="Latest Jobs"
            description="Recently published software engineering opportunities."
            viewAllHref="/jobs"
          />
          {latestJobs.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {latestJobs.map((job) => (
                <JobCard key={String(job._id)} job={job} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No jobs available right now."
              description="Published job listings will appear here."
            />
          )}
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeader
            title="Latest Articles"
            description="Developer tutorials, career guidance, and technology deep dives."
            viewAllHref="/blog"
          />
          {latestBlogPosts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {latestBlogPosts.map((post) => (
                <PostCard key={String(post._id)} post={toPostCardData(post, categoryNameById)} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No articles have been published yet."
              description="New blog posts will appear here as soon as they're published."
            />
          )}
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeader
            title="Interview Preparation"
            description="Curated interview questions by topic."
            viewAllHref="/interview-prep"
          />
          {interviewPrepPosts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {interviewPrepPosts.map((post) => (
                <PostCard key={String(post._id)} post={toPostCardData(post, categoryNameById)} />
              ))}
            </div>
          ) : (
            <EmptyState title="No interview preparation resources have been published yet." />
          )}
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeader
            title="System Design"
            description="Architecture, scalability, and system design walkthroughs."
            viewAllHref="/system-design"
          />
          {systemDesignPosts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {systemDesignPosts.map((post) => (
                <PostCard key={String(post._id)} post={toPostCardData(post, categoryNameById)} />
              ))}
            </div>
          ) : (
            <EmptyState title="No system design content has been published yet." />
          )}
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeader title="Featured Content" description="Recently published across the site." />
          {featuredPosts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.map((post) => (
                <PostCard
                  key={String(post._id)}
                  post={toPostCardData(post, categoryNameById)}
                  showType
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No content has been published yet." />
          )}
        </section>

        {categories.length > 0 && (
          <section className="flex flex-col gap-6">
            <SectionHeader title="Categories" description="Browse content by topic." />
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => (
                <CategoryCard
                  key={String(category._id)}
                  name={category.name}
                  description={category.description}
                />
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
