import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { Tag } from "@/lib/db/models/Tag";
import { Post } from "@/lib/db/models/Post";
import { assertValidObjectId } from "@/lib/db/objectId";
import { NotFoundError, toAppError } from "@/lib/errors";
import { parseInput } from "@/lib/validation/shared";
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

export async function deleteTag(id: string): Promise<void> {
  assertValidObjectId(id);
  await connectToDatabase();

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

/** Admin-only: number of posts referencing each tag, in a single aggregate query. */
export async function getTagPostCounts(): Promise<Map<string, number>> {
  await connectToDatabase();

  const results = await Post.aggregate<{ _id: unknown; count: number }>([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
  ]);

  return new Map(results.map((result) => [String(result._id), result.count]));
}
