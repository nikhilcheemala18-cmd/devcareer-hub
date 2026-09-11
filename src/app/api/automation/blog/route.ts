import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { DuplicateSlugError, ValidationError } from "@/lib/errors";
import { slugify } from "@/lib/format";
import { getCategoryBySlug } from "@/lib/services/categories";
import { createPost } from "@/lib/services/posts";
import { getTags } from "@/lib/services/tags";
import { getFirstAdminUser } from "@/lib/services/users";
import { slugSchema, urlSchema } from "@/lib/validation/shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const automationBlogSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(200),
    slug: slugSchema,
    content: z.string().trim().min(1, "Content is required."),
    excerpt: z.string().trim().max(500).optional(),
    category: z.string().trim().max(100).optional(),
    tags: z.array(z.string().trim().min(1).max(50)).max(30).optional(),
    seo: z
      .object({
        metaTitle: z.string().trim().max(70).optional(),
        metaDescription: z.string().trim().max(160).optional(),
        canonicalUrl: z.union([urlSchema, z.literal("")]).optional(),
      })
      .optional(),
    status: z.unknown().optional(),
    type: z.unknown().optional(),
  })
  .strict();

function jsonResponse(body: object, status: number): NextResponse {
  return NextResponse.json(body, { status });
}

function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  const match = /^Bearer\s+(.+)$/i.exec(header ?? "");
  return match?.[1]?.trim() || null;
}

function safeEquals(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function authenticateAutomationRequest(request: NextRequest): NextResponse | null {
  const expectedKey = process.env.AUTOMATION_API_KEY;

  if (!expectedKey) {
    return jsonResponse({ success: false, error: "Automation API is not configured." }, 500);
  }

  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Missing bearer token." },
      {
        status: 401,
        headers: { "WWW-Authenticate": "Bearer" },
      }
    );
  }

  if (!safeEquals(token, expectedKey)) {
    return jsonResponse({ success: false, error: "Invalid bearer token." }, 403);
  }

  return null;
}

async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON.");
  }
}

async function resolveCategoryId(category: string | undefined): Promise<string | undefined> {
  if (!category?.trim()) {
    return undefined;
  }

  const slug = slugify(category);

  if (!slug) {
    throw new ValidationError("Category must contain at least one letter or number.");
  }

  const existing = await getCategoryBySlug(slug);

  if (!existing) {
    throw new ValidationError(`Category does not exist: ${category}`);
  }

  return String(existing._id);
}

async function resolveTagIds(tags: string[] | undefined): Promise<string[] | undefined> {
  if (!tags?.length) {
    return undefined;
  }

  const slugs = tags.map((tag) => slugify(tag));

  if (slugs.some((slug) => !slug)) {
    throw new ValidationError("Each tag must contain at least one letter or number.");
  }

  const requestedSlugs = [...new Set(slugs)];
  const existingTags = await getTags();
  const tagBySlug = new Map(existingTags.map((tag) => [tag.slug, tag]));
  const missing = requestedSlugs.filter((slug) => !tagBySlug.has(slug));

  if (missing.length > 0) {
    throw new ValidationError(`Tags do not exist: ${missing.join(", ")}`);
  }

  return requestedSlugs.map((slug) => String(tagBySlug.get(slug)!._id));
}

function normalizeSeo(seo: z.infer<typeof automationBlogSchema>["seo"]) {
  if (!seo) {
    return undefined;
  }

  const normalized = {
    metaTitle: seo.metaTitle || undefined,
    metaDescription: seo.metaDescription || undefined,
    canonicalUrl: seo.canonicalUrl || undefined,
  };

  return normalized.metaTitle || normalized.metaDescription || normalized.canonicalUrl
    ? normalized
    : undefined;
}

export async function POST(request: NextRequest) {
  const authError = authenticateAutomationRequest(request);

  if (authError) {
    return authError;
  }

  try {
    const body = await readJson(request);
    const parsed = automationBlogSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => (issue.path.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message))
        .join("; ");
      return jsonResponse({ success: false, error: message }, 400);
    }

    const [author, categoryId, tagIds] = await Promise.all([
      getFirstAdminUser(),
      resolveCategoryId(parsed.data.category),
      resolveTagIds(parsed.data.tags),
    ]);

    if (!author) {
      return jsonResponse({ success: false, error: "Automation author is not configured." }, 500);
    }

    const post = await createPost({
      title: parsed.data.title,
      slug: parsed.data.slug,
      type: "BLOG",
      excerpt: parsed.data.excerpt || undefined,
      content: parsed.data.content,
      category: categoryId,
      tags: tagIds,
      seo: normalizeSeo(parsed.data.seo),
      status: "DRAFT",
      author: String(author._id),
    });

    return jsonResponse(
      {
        success: true,
        postId: String(post._id),
        slug: post.slug,
        status: "draft",
      },
      201
    );
  } catch (error) {
    if (error instanceof DuplicateSlugError) {
      return jsonResponse({ success: false, error: error.message }, 409);
    }

    if (error instanceof ValidationError) {
      return jsonResponse({ success: false, error: error.message }, 400);
    }

    console.error("Automation blog creation failed.", error);
    return jsonResponse({ success: false, error: "Unexpected server error." }, 500);
  }
}
