import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { getPostBySlug } from "@/lib/services/posts";
import { getJobBySlug } from "@/lib/services/jobs";
import type { PostType } from "@/lib/db/enums";

const SAFE_URL_PROTOCOLS = new Set(["http:", "https:"]);

/** True only for a well-formed, safe (http/https) absolute URL — mirrors the check in urlSchema without pulling zod parsing into metadata generation. */
export function isSafeAbsoluteUrl(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }
  try {
    return SAFE_URL_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

/** Absolute URL for `path`, resolved against the configured site URL. */
export function absoluteUrl(path: string): string {
  const base = env.siteUrl.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/** An explicitly configured `seo.canonicalUrl` when it's genuinely safe, else the site's own canonical for `path`. */
export function resolveCanonicalUrl(explicit: string | null | undefined, path: string): string {
  return isSafeAbsoluteUrl(explicit) ? explicit : absoluteUrl(path);
}

/**
 * Strips the hand-rolled Markdown subset (see ContentRenderer) down to plain
 * text, for a safe fallback description when no excerpt/seo.metaDescription
 * exists. Not a full Markdown parser — good enough for a derived summary,
 * not for display.
 */
export function plainTextFromContent(content: string, maxLength = 160): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[>*`_|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) {
    return plain;
  }
  return `${plain.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildMetadata({
  title,
  description,
  path,
  canonicalUrl,
  robots,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  canonicalUrl?: string;
  robots?: Metadata["robots"];
  type?: "website" | "article";
}): Metadata {
  const canonical = canonicalUrl ?? absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: env.siteName,
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    ...(robots ? { robots } : {}),
  };
}

interface PostSeoSource {
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
  };
}

/** Single source of truth for "prefer seo.X, else derive a fallback" — shared by generateMetadata and the rendered Article JSON-LD so both agree. */
export function derivePostSeoFields(post: PostSeoSource, basePath: string) {
  const title = post.seo?.metaTitle || post.title;
  const description =
    post.seo?.metaDescription || post.excerpt || plainTextFromContent(post.content);
  const path = `${basePath}/${post.slug}`;
  const canonicalUrl = resolveCanonicalUrl(post.seo?.canonicalUrl, path);

  return { title, description, path, canonicalUrl };
}

interface JobSeoSource {
  slug: string;
  title: string;
  company: string;
  location: string;
  description: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
  };
}

export function deriveJobSeoFields(job: JobSeoSource) {
  const title = job.seo?.metaTitle || `${job.title} at ${job.company}`;
  const description =
    job.seo?.metaDescription ||
    plainTextFromContent(`${job.title} at ${job.company} in ${job.location}. ${job.description}`, 160);
  const path = `/jobs/${job.slug}`;
  const canonicalUrl = resolveCanonicalUrl(job.seo?.canonicalUrl, path);

  return { title, description, path, canonicalUrl };
}

/**
 * generateMetadata for /blog/[slug], /interview-prep/[slug], /system-design/[slug].
 * getPostBySlug is request-deduped (see services/posts.ts), so this and the
 * page body's own fetch resolve to a single DB query per request.
 */
export async function buildPostDetailMetadata({
  slug,
  postType,
  basePath,
}: {
  slug: string;
  postType: PostType;
  basePath: string;
}): Promise<Metadata> {
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "PUBLISHED" || post.type !== postType) {
    notFound();
  }

  const { title, description, path, canonicalUrl } = derivePostSeoFields(post, basePath);
  return buildMetadata({ title, description, path, canonicalUrl, type: "article" });
}

/** generateMetadata for /jobs/[slug]. getJobBySlug is request-deduped (see services/jobs.ts). */
export async function buildJobDetailMetadata(slug: string): Promise<Metadata> {
  const job = await getJobBySlug(slug);

  if (!job || job.status !== "PUBLISHED") {
    notFound();
  }

  const { title, description, path, canonicalUrl } = deriveJobSeoFields(job);
  return buildMetadata({ title, description, path, canonicalUrl, type: "article" });
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: env.siteName,
    url: env.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: env.siteName,
    url: env.siteUrl,
  };
}

export function buildArticleJsonLd({
  title,
  description,
  canonicalUrl,
  publishedAt,
  updatedAt,
  authorName,
  imageUrl,
}: {
  title: string;
  description: string;
  canonicalUrl: string;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  authorName?: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    ...(publishedAt ? { datePublished: new Date(publishedAt).toISOString() } : {}),
    ...(updatedAt ? { dateModified: new Date(updatedAt).toISOString() } : {}),
    ...(authorName ? { author: { "@type": "Person", name: authorName } } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    publisher: { "@type": "Organization", name: env.siteName },
  };
}

// schema.org JobPosting employmentType enumeration values, mapped from our EMPLOYMENT_TYPES.
const JOB_POSTING_EMPLOYMENT_TYPE: Record<string, string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  INTERNSHIP: "INTERN",
  CONTRACT: "CONTRACTOR",
};

/** True once `deadline` has passed. A plain helper (not called inline in a component body) so the read of the current time doesn't trip the react-hooks purity rule. */
export function isJobExpired(deadline: Date | string | null | undefined): boolean {
  return deadline ? new Date(deadline).getTime() < Date.now() : false;
}

export function buildJobPostingJsonLd({
  title,
  description,
  canonicalUrl,
  company,
  location,
  employmentType,
  publishedAt,
  deadline,
}: {
  title: string;
  description: string;
  canonicalUrl: string;
  company: string;
  location: string;
  employmentType: string;
  publishedAt?: Date | string | null;
  deadline?: Date | string | null;
}) {
  // No structured address data exists (Job.location is free text) — omit
  // addressCountry/addressRegion rather than fabricate them. "Remote" is
  // treated as telecommute per schema.org's own recommendation for that case.
  const isRemote = /remote/i.test(location);

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    url: canonicalUrl,
    hiringOrganization: { "@type": "Organization", name: company },
    employmentType: [JOB_POSTING_EMPLOYMENT_TYPE[employmentType] ?? "OTHER"],
    ...(publishedAt ? { datePosted: new Date(publishedAt).toISOString() } : {}),
    ...(deadline ? { validThrough: new Date(deadline).toISOString() } : {}),
    ...(isRemote
      ? { jobLocationType: "TELECOMMUTE" }
      : {
          jobLocation: {
            "@type": "Place",
            address: { "@type": "PostalAddress", addressLocality: location },
          },
        }),
  };
}
