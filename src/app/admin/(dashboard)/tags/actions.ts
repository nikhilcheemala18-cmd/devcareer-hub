"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/auth";
import { createTag, updateTag, deleteTag } from "@/lib/services/tags";
import { AppError } from "@/lib/errors";

export interface TagFormState {
  error?: string;
}

function readTagFormData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
  };
}

function messageFor(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  console.error(error);
  return "Something went wrong while saving. Please try again.";
}

export async function createTagAction(
  _prevState: TagFormState,
  formData: FormData
): Promise<TagFormState> {
  await requireAdmin();
  const data = readTagFormData(formData);

  let created;
  try {
    created = await createTag(data);
  } catch (error) {
    return { error: messageFor(error) };
  }

  redirect(`/admin/tags/${String(created._id)}/edit?created=1`);
}

export async function updateTagAction(
  id: string,
  _prevState: TagFormState,
  formData: FormData
): Promise<TagFormState> {
  await requireAdmin();
  const data = readTagFormData(formData);

  try {
    await updateTag(id, data);
  } catch (error) {
    return { error: messageFor(error) };
  }

  redirect(`/admin/tags/${id}/edit?saved=1`);
}

export async function deleteTagAction(id: string): Promise<void> {
  await requireAdmin();

  try {
    await deleteTag(id);
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/admin/tags?deleteError=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  redirect("/admin/tags?deleted=1");
}
