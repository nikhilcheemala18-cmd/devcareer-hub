import "server-only";
import { cache } from "react";
import type { QueryFilter, HydratedDocument } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { Post, type PostDocument } from "@/lib/db/models/Post";
import type { PostType, ContentStatus } from "@/lib/db/enums";
import { assertValidObjectId } from "@/lib/db/objectId";
import { NotFoundError, toAppError } from "@/lib/errors";
import { parseInput } from "@/lib/validation/shared";
import { escapeRegExp } from "@/lib/format";
import {
  createPostInputSchema,
  updatePostInputSchema,
  type CreatePostInput,
  type UpdatePostInput,
} from "@/lib/validation/post";

export async function createPost(input: CreatePostInput) {
  const data = parseInput(createPostInputSchema, input);
  await connectToDatabase();

  try {
    return await Post.create({
      ...data,
      publishedAt: data.status === "PUBLISHED" ? new Date() : undefined,
    });
  } catch (error) {
    throw toAppError(error, data.slug);
  }
}

export async function updatePost(id: string, input: UpdatePostInput) {
  assertValidObjectId(id);
  const data = parseInput(updatePostInputSchema, input);
  await connectToDatabase();

  try {
    const existing = await Post.findById(id);

    if (!existing) {
      throw new NotFoundError(`Post not found: ${id}`);
    }

    if (data.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      existing.publishedAt = new Date();
    }

    Object.assign(existing, data);
    await existing.save();
    return existing;
  } catch (error) {
    throw toAppError(error, data.slug);
  }
}

export async function deletePost(id: string): Promise<void> {
  assertValidObjectId(id);
  await connectToDatabase();

  const deleted = await Post.findByIdAndDelete(id);

  if (!deleted) {
    throw new NotFoundError(`Post not found: ${id}`);
  }
}

export async function getPostById(id: string) {
  assertValidObjectId(id);
  await connectToDatabase();
  return Post.findById(id);
}

/**
 * Returns null if no post matches — callers decide how to render "not found".
 * Wrapped in React's cache() so generateMetadata and the page body's own
 * fetch (same slug, same request) resolve to a single DB query, not two.
 */
export const getPostBySlug = cache(async function getPostBySlug(slug: string) {
  await connectToDatabase();
  return Post.findOne({ slug: slug.trim().toLowerCase() });
});

interface GetPublishedPostsOptions {
  type?: PostType;
  category?: string;
  tag?: string;
  limit?: number;
  page?: number;
}

export async function getPublishedPosts(options: GetPublishedPostsOptions = {}) {
  await connectToDatabase();

  const { type, category, tag, limit = 20, page = 1 } = options;
  const filter: QueryFilter<PostDocument> = { status: "PUBLISHED" };

  if (type) {
    filter.type = type;
  }
  if (category) {
    assertValidObjectId(category);
    filter.category = category;
  }
  if (tag) {
    assertValidObjectId(tag);
    filter.tags = tag;
  }

  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);

  return Post.find(filter)
    .sort({ publishedAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit);
}

export interface PostCounts {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

/** Admin-only: counts across all statuses, not just published. */
export async function getPostCounts(): Promise<PostCounts> {
  await connectToDatabase();

  const [total, published, draft, archived] = await Promise.all([
    Post.countDocuments({}),
    Post.countDocuments({ status: "PUBLISHED" }),
    Post.countDocuments({ status: "DRAFT" }),
    Post.countDocuments({ status: "ARCHIVED" }),
  ]);

  return { total, published, draft, archived };
}

/** Admin-only: most recently updated posts regardless of status. */
export async function getRecentPosts(limit = 5) {
  await connectToDatabase();
  return Post.find({}).sort({ updatedAt: -1 }).limit(limit);
}

interface GetAllPostsOptions {
  status?: ContentStatus;
  type?: PostType;
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
}

/** Admin-only: all posts regardless of status, for /admin/posts. */
export async function getAllPosts(options: GetAllPostsOptions = {}) {
  await connectToDatabase();

  const { status, type, category, search, limit = 20, page = 1 } = options;
  const filter: QueryFilter<PostDocument> = {};

  if (status) {
    filter.status = status;
  }
  if (type) {
    filter.type = type;
  }
  if (category) {
    assertValidObjectId(category);
    filter.category = category;
  }
  if (search?.trim()) {
    filter.title = { $regex: escapeRegExp(search.trim()), $options: "i" };
  }

  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);

  return Post.find(filter)
    .sort({ updatedAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit);
}

/**
 * Published posts sharing the same category, an overlapping tag, or the same
 * content type as `post`, most recent first. Intentionally simple — no
 * scoring/ranking beyond the query order.
 */
export async function getRelatedPosts(
  post: HydratedDocument<PostDocument>,
  limit = 4
) {
  await connectToDatabase();

  return Post.find({
    _id: { $ne: post._id },
    status: "PUBLISHED",
    $or: [
      ...(post.category ? [{ category: post.category }] : []),
      ...(post.tags?.length ? [{ tags: { $in: post.tags } }] : []),
      { type: post.type },
    ],
  })
    .sort({ publishedAt: -1 })
    .limit(limit);
}

/**
 * Admin/SEO-only: every published post's slug/type/dates for sitemap.xml —
 * not paginated (a sitemap must list everything), but projected down to the
 * few fields actually needed so it stays cheap as content grows.
 */
export async function getAllPublishedPostsForSitemap() {
  await connectToDatabase();
  return Post.find({ status: "PUBLISHED" })
    .select("slug type updatedAt publishedAt")
    .sort({ publishedAt: -1 });
}
