import "server-only";
import type { QueryFilter, HydratedDocument } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { Post, type PostDocument } from "@/lib/db/models/Post";
import type { PostType } from "@/lib/db/enums";
import { assertValidObjectId } from "@/lib/db/objectId";
import { NotFoundError, toAppError } from "@/lib/errors";
import { parseInput } from "@/lib/validation/shared";
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

/** Returns null if no post matches — callers decide how to render "not found". */
export async function getPostBySlug(slug: string) {
  await connectToDatabase();
  return Post.findOne({ slug: slug.trim().toLowerCase() });
}

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
