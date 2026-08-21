import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { Category } from "@/lib/db/models/Category";
import { Post } from "@/lib/db/models/Post";
import { assertValidObjectId } from "@/lib/db/objectId";
import { NotFoundError, toAppError } from "@/lib/errors";
import { parseInput } from "@/lib/validation/shared";
import {
  createCategoryInputSchema,
  updateCategoryInputSchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/lib/validation/category";

export async function createCategory(input: CreateCategoryInput) {
  const data = parseInput(createCategoryInputSchema, input);
  await connectToDatabase();

  try {
    return await Category.create(data);
  } catch (error) {
    throw toAppError(error, data.slug);
  }
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  assertValidObjectId(id);
  const data = parseInput(updateCategoryInputSchema, input);
  await connectToDatabase();

  try {
    const updated = await Category.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updated) {
      throw new NotFoundError(`Category not found: ${id}`);
    }

    return updated;
  } catch (error) {
    throw toAppError(error, data.slug);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  assertValidObjectId(id);
  await connectToDatabase();

  const deleted = await Category.findByIdAndDelete(id);

  if (!deleted) {
    throw new NotFoundError(`Category not found: ${id}`);
  }
}

export async function getCategoryById(id: string) {
  assertValidObjectId(id);
  await connectToDatabase();
  return Category.findById(id);
}

export async function getCategoryBySlug(slug: string) {
  await connectToDatabase();
  return Category.findOne({ slug: slug.trim().toLowerCase() });
}

export async function getCategories() {
  await connectToDatabase();
  return Category.find().sort({ name: 1 });
}

/** Admin-only: number of posts referencing each category, in a single aggregate query. */
export async function getCategoryPostCounts(): Promise<Map<string, number>> {
  await connectToDatabase();

  const results = await Post.aggregate<{ _id: unknown; count: number }>([
    { $match: { category: { $ne: null } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  return new Map(results.map((result) => [String(result._id), result.count]));
}
