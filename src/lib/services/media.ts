import "server-only";
import type { QueryFilter } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { Media, type MediaDocument } from "@/lib/db/models/Media";
import { Post } from "@/lib/db/models/Post";
import { Job } from "@/lib/db/models/Job";
import { assertValidObjectId } from "@/lib/db/objectId";
import { InUseError, NotFoundError, toAppError } from "@/lib/errors";
import { parseInput } from "@/lib/validation/shared";
import { escapeRegExp } from "@/lib/format";
import {
  createMediaInputSchema,
  updateMediaInputSchema,
  type CreateMediaInput,
  type UpdateMediaInput,
} from "@/lib/validation/media";

// No upload/storage provider is configured (SRS §21, deferred by design), so
// there is no real file to measure. `size` stays 0 for every record created
// through the URL-entry form below — it's a known-unknown, not a real byte
// count, until a storage provider lands.
const UNKNOWN_SIZE = 0;

export async function createMedia(input: CreateMediaInput) {
  const data = parseInput(createMediaInputSchema, input);
  await connectToDatabase();

  try {
    return await Media.create({ ...data, size: UNKNOWN_SIZE });
  } catch (error) {
    throw toAppError(error);
  }
}

export async function updateMedia(id: string, input: UpdateMediaInput) {
  assertValidObjectId(id);
  const data = parseInput(updateMediaInputSchema, input);
  await connectToDatabase();

  try {
    const updated = await Media.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updated) {
      throw new NotFoundError(`Media not found: ${id}`);
    }

    return updated;
  } catch (error) {
    throw toAppError(error);
  }
}

/** Blocks deletion while any Post/Job still uses this media as its featured image. */
export async function deleteMedia(id: string): Promise<void> {
  assertValidObjectId(id);
  await connectToDatabase();

  const [postCount, jobCount] = await Promise.all([
    Post.countDocuments({ featuredImage: id }),
    Job.countDocuments({ featuredImage: id }),
  ]);

  if (postCount + jobCount > 0) {
    const parts = [
      postCount > 0 ? `${postCount} post${postCount === 1 ? "" : "s"}` : null,
      jobCount > 0 ? `${jobCount} job${jobCount === 1 ? "" : "s"}` : null,
    ].filter(Boolean);
    throw new InUseError(
      `Cannot delete this media item — it is used as the featured image by ${parts.join(" and ")}. Remove it from those first.`
    );
  }

  const deleted = await Media.findByIdAndDelete(id);

  if (!deleted) {
    throw new NotFoundError(`Media not found: ${id}`);
  }
}

export async function getMediaById(id: string) {
  assertValidObjectId(id);
  await connectToDatabase();
  return Media.findById(id);
}

interface GetMediaOptions {
  search?: string;
  page?: number;
  limit?: number;
}

/** Admin-only: paginated/searchable media list for /admin/media. */
export async function getMedia(options: GetMediaOptions = {}) {
  await connectToDatabase();

  const { search, limit = 20, page = 1 } = options;
  const filter: QueryFilter<MediaDocument> = {};

  if (search?.trim()) {
    const pattern = { $regex: escapeRegExp(search.trim()), $options: "i" };
    filter.$or = [{ filename: pattern }, { altText: pattern }];
  }

  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);

  return Media.find(filter)
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit);
}

/** Admin-only: Post/Job usage for a single media item (edit page / pre-delete check). */
export async function getMediaUsage(id: string): Promise<{ posts: number; jobs: number }> {
  assertValidObjectId(id);
  await connectToDatabase();

  const [posts, jobs] = await Promise.all([
    Post.countDocuments({ featuredImage: id }),
    Job.countDocuments({ featuredImage: id }),
  ]);

  return { posts, jobs };
}

/** Admin-only: Post/Job usage for every media item, in two aggregate queries (not one per row). */
export async function getMediaUsageCounts(): Promise<Map<string, { posts: number; jobs: number }>> {
  await connectToDatabase();

  const [postResults, jobResults] = await Promise.all([
    Post.aggregate<{ _id: unknown; count: number }>([
      { $match: { featuredImage: { $ne: null } } },
      { $group: { _id: "$featuredImage", count: { $sum: 1 } } },
    ]),
    Job.aggregate<{ _id: unknown; count: number }>([
      { $match: { featuredImage: { $ne: null } } },
      { $group: { _id: "$featuredImage", count: { $sum: 1 } } },
    ]),
  ]);

  const usage = new Map<string, { posts: number; jobs: number }>();

  for (const result of postResults) {
    usage.set(String(result._id), { posts: result.count, jobs: 0 });
  }
  for (const result of jobResults) {
    const key = String(result._id);
    const existing = usage.get(key) ?? { posts: 0, jobs: 0 };
    usage.set(key, { ...existing, jobs: result.count });
  }

  return usage;
}
