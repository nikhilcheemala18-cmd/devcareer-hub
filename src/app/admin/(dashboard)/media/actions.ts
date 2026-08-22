"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/auth";
import { createMedia, updateMedia, deleteMedia } from "@/lib/services/media";
import { AppError } from "@/lib/errors";

export interface MediaFormState {
  error?: string;
}

function readMediaFormData(formData: FormData) {
  return {
    filename: String(formData.get("filename") ?? ""),
    url: String(formData.get("url") ?? ""),
    type: String(formData.get("type") ?? ""),
    altText: String(formData.get("altText") ?? "").trim() || undefined,
  };
}

function messageFor(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  console.error(error);
  return "Something went wrong while saving. Please try again.";
}

export async function createMediaAction(
  _prevState: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  await requireAdmin();
  const data = readMediaFormData(formData);

  let created;
  try {
    created = await createMedia(data);
  } catch (error) {
    return { error: messageFor(error) };
  }

  redirect(`/admin/media/${String(created._id)}/edit?created=1`);
}

export async function updateMediaAction(
  id: string,
  _prevState: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  await requireAdmin();
  const data = readMediaFormData(formData);

  try {
    await updateMedia(id, data);
  } catch (error) {
    return { error: messageFor(error) };
  }

  redirect(`/admin/media/${id}/edit?saved=1`);
}

export async function deleteMediaAction(id: string): Promise<void> {
  await requireAdmin();

  try {
    await deleteMedia(id);
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/admin/media?deleteError=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  redirect("/admin/media?deleted=1");
}
