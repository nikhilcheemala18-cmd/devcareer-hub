import "server-only";
import type { QueryFilter } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { Category, type CategoryDocument } from "@/lib/db/models/Category";
import { Post } from "@/lib/db/models/Post";
import { assertValidObjectId } from "@/lib/db/objectId";
import { InUseError, NotFoundError, toAppError } from "@/lib/errors";
import { parseInput } from "@/lib/validation/shared";
import { escapeRegExp } from "@/lib/format";
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

/**
 * Blocks deletion while any Post still references this category — Job has no
 * category field, so only Posts can hold a reference. Prevents a Post from
 * being left pointing at a category that no longer exists.
 */
export async function deleteCategory(id: string): Promise<void> {
  assertValidObjectId(id);
  await connectToDatabase();

  const postCount = await Post.countDocuments({ category: id });

  if (postCount > 0) {
    throw new InUseError(
      `Cannot delete this category — it is used by ${postCount} post${postCount === 1 ? "" : "s"}. Remove it from those posts first.`
    );
  }

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

interface GetAllCategoriesOptions {
  search?: string;
  page?: number;
  limit?: number;
}

/** Admin-only: paginated/searchable category list for /admin/categories. */
export async function getAllCategories(options: GetAllCategoriesOptions = {}) {
  await connectToDatabase();

  const { search, limit = 20, page = 1 } = options;
  const filter: QueryFilter<CategoryDocument> = {};

  if (search?.trim()) {
    filter.name = { $regex: escapeRegExp(search.trim()), $options: "i" };
  }

  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safePage = Math.max(page, 1);

  return Category.find(filter)
    .sort({ name: 1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit);
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

/** Admin-only: post count for a single category (edit page / pre-delete check). */
export async function getCategoryUsage(id: string): Promise<{ posts: number }> {
  assertValidObjectId(id);
  await connectToDatabase();
  const posts = await Post.countDocuments({ category: id });
  return { posts };
}
