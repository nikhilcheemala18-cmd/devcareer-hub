import "server-only";
import type { QueryFilter } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { Tag, type TagDocument } from "@/lib/db/models/Tag";
import { Post } from "@/lib/db/models/Post";
import { assertValidObjectId } from "@/lib/db/objectId";
import { InUseError, NotFoundError, toAppError } from "@/lib/errors";
import { parseInput } from "@/lib/validation/shared";
import { escapeRegExp } from "@/lib/format";
import {
  createTagInputSchema,
  updateTagInputSchema,
  type CreateTagInput,
  type UpdateTagInput,
} from "@/lib/validation/tag";

export async function createTag(input: CreateTagInput) {
  const data = parseInput(createTagInputSchema, input);
  await connectToDatabase();

  try {
    return await Tag.create(data);
  } catch (error) {
    throw toAppError(error, data.slug);
  }
}

export async function updateTag(id: string, input: UpdateTagInput) {
  assertValidObjectId(id);
  const data = parseInput(updateTagInputSchema, input);
  await connectToDatabase();

  try {
    const updated = await Tag.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updated) {
      throw new NotFoundError(`Tag not found: ${id}`);
    }

    return updated;
  } catch (error) {
    throw toAppError(error, data.slug);
  }
}

/**
 * Blocks deletion while any Post still references this tag — Job has no tags
 * field, so only Posts can hold a reference.
 */
export async function deleteTag(id: string): Promise<void> {
  assertValidObjectId(id);
  await connectToDatabase();

  const postCount = await Post.countDocuments({ tags: id });

  if (postCount > 0) {
    throw new InUseError(
      `Cannot delete this tag — it is used by ${postCount} post${postCount === 1 ? "" : "s"}. Remove it from those posts first.`
    );
  }

  const deleted = await Tag.findByIdAndDelete(id);

  if (!deleted) {
    throw new NotFoundError(`Tag not found: ${id}`);
  }
}

export async function getTagById(id: string) {
  assertValidObjectId(id);
  await connectToDatabase();
  return Tag.findById(id);
}

export async function getTagBySlug(slug: string) {
  await connectToDatabase();
  return Tag.findOne({ slug: slug.trim().toLowerCase() });
}

export async function getTags() {
  await connectToDatabase();
  return Tag.find().sort({ name: 1 });
}

interface GetAllTagsOptions {
  search?: string;
  page?: number;
  limit?: number;
}

/** Admin-only: paginated/searchable tag list for /admin/tags. */
export async function getAllTags(options: GetAllTagsOptions = {}) {
  await connectToDatabase();

  const { search, limit = 20, page = 1 } = options;
  const filter: QueryFilter<TagDocument> = {};

  if (search?.trim()) {
    filter.name = { $regex: escapeRegExp(search.trim()), $options: "i" };
  }

  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);

  return Tag.find(filter)
    .sort({ name: 1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit);
}

/** Admin-only: number of posts referencing each tag, in a single aggregate query. */
export async function getTagPostCounts(): Promise<Map<string, number>> {
  await connectToDatabase();

  const results = await Post.aggregate<{ _id: unknown; count: number }>([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
  ]);

  return new Map(results.map((result) => [String(result._id), result.count]));
}

/** Admin-only: post count for a single tag (edit page / pre-delete check). */
export async function getTagUsage(id: string): Promise<{ posts: number }> {
  assertValidObjectId(id);
  await connectToDatabase();
  const posts = await Post.countDocuments({ tags: id });
  return { posts };
}
