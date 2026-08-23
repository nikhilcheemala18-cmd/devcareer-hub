import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getAllPublishedPostsForSitemap } from "@/lib/services/posts";
import { getAllPublishedJobsForSitemap } from "@/lib/services/jobs";
import { postDetailHref } from "@/components/content/PostCard";

export const dynamic = "force-dynamic";

const STATIC_PAGES: Array<{
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/jobs", changeFrequency: "daily", priority: 0.9 },
  { path: "/blog", changeFrequency: "daily", priority: 0.8 },
  { path: "/interview-prep", changeFrequency: "weekly", priority: 0.8 },
  { path: "/system-design", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "yearly", priority: 0.3 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

/**
 * Draft/archived content, admin routes, login, preview routes, and /search
 * are intentionally never listed here — draft/archived because
 * getAllPublished*ForSitemap only queries PUBLISHED status, the rest because
 * this file simply never generates entries for them.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, jobs] = await Promise.all([
    getAllPublishedPostsForSitemap(),
    getAllPublishedJobsForSitemap(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(
    ({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path),
      changeFrequency,
      priority,
    })
  );

  // postDetailHref returns null for post types with no public route (GUIDE/
  // CAREER — see PostCard.tsx) — skipped rather than listing a broken URL.
  const postEntries: MetadataRoute.Sitemap = posts.flatMap((post) => {
    const href = postDetailHref({ type: post.type, slug: post.slug });
    if (!href) {
      return [];
    }
    return [
      {
        url: absoluteUrl(href),
        lastModified: post.updatedAt ?? post.publishedAt ?? undefined,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      },
    ];
  });

  const jobEntries: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: absoluteUrl(`/jobs/${job.slug}`),
    lastModified: job.updatedAt ?? job.publishedAt ?? undefined,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...postEntries, ...jobEntries];
}
