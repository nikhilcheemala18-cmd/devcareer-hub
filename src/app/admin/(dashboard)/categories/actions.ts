"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/auth";
import { createCategory, updateCategory, deleteCategory } from "@/lib/services/categories";
import { AppError } from "@/lib/errors";

export interface CategoryFormState {
  error?: string;
}

function readCategoryFormData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? "").trim() || undefined,
  };
}

function messageFor(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  console.error(error);
  return "Something went wrong while saving. Please try again.";
}

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();
  const data = readCategoryFormData(formData);

  let created;
  try {
    created = await createCategory(data);
  } catch (error) {
    return { error: messageFor(error) };
  }

  redirect(`/admin/categories/${String(created._id)}/edit?created=1`);
}

export async function updateCategoryAction(
  id: string,
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();
  const data = readCategoryFormData(formData);

  try {
    await updateCategory(id, data);
  } catch (error) {
    return { error: messageFor(error) };
  }

  redirect(`/admin/categories/${id}/edit?saved=1`);
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await requireAdmin();

  try {
    await deleteCategory(id);
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/admin/categories?deleteError=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  redirect("/admin/categories?deleted=1");
}
