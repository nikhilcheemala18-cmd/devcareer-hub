"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/auth";
import { createPost, updatePost, deletePost } from "@/lib/services/posts";
import { AppError } from "@/lib/errors";
import type { ContentStatus, PostType } from "@/lib/db/enums";

export interface PostFormState {
  error?: string;
}

/**
 * Explicit submit-button intents rather than a free-form "status" field, so
 * "Save Draft" can never accidentally publish and "Update" can never
 * accidentally change a post's current status.
 */
function statusForIntent(intent: FormDataEntryValue | null): ContentStatus | undefined {
  switch (intent) {
    case "draft":
      return "DRAFT";
    case "publish":
      return "PUBLISHED";
    case "archive":
      return "ARCHIVED";
    default:
      return undefined; // "update" (or anything else): leave status untouched
  }
}

function readPostFormData(formData: FormData) {
  const categoryValue = String(formData.get("category") ?? "");
  const seoMetaTitle = String(formData.get("seoMetaTitle") ?? "").trim();
  const seoMetaDescription = String(formData.get("seoMetaDescription") ?? "").trim();
  const seoCanonicalUrl = String(formData.get("seoCanonicalUrl") ?? "").trim();
  const hasSeo = Boolean(seoMetaTitle || seoMetaDescription || seoCanonicalUrl);

  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    // Cast, not validated here — createPost/updatePost still run this
    // through zod at runtime, which rejects anything outside POST_TYPES.
    type: String(formData.get("type") ?? "") as PostType,
    excerpt: String(formData.get("excerpt") ?? "").trim() || undefined,
    content: String(formData.get("content") ?? ""),
    category: categoryValue || null,
    tags: formData.getAll("tags").map(String),
    seo: hasSeo
      ? {
          metaTitle: seoMetaTitle || undefined,
          metaDescription: seoMetaDescription || undefined,
          canonicalUrl: seoCanonicalUrl || undefined,
        }
      : undefined,
  };
}

function messageFor(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  console.error(error);
  return "Something went wrong while saving. Please try again.";
}

export async function createPostAction(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const admin = await requireAdmin();
  const intent = formData.get("intent");
  const status = statusForIntent(intent) ?? "DRAFT";
  const data = readPostFormData(formData);

  let created;
  try {
    created = await createPost({
      ...data,
      category: data.category ?? undefined,
      status,
      author: admin.id,
    });
  } catch (error) {
    return { error: messageFor(error) };
  }

  redirect(`/admin/posts/${String(created._id)}/edit?created=1`);
}

export async function updatePostAction(
  id: string,
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  await requireAdmin();
  const intent = formData.get("intent");
  const status = statusForIntent(intent);
  const data = readPostFormData(formData);

  try {
    await updatePost(id, status ? { ...data, status } : data);
  } catch (error) {
    return { error: messageFor(error) };
  }

  redirect(`/admin/posts/${id}/edit?saved=1`);
}

export async function deletePostAction(id: string): Promise<void> {
  await requireAdmin();

  try {
    await deletePost(id);
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/admin/posts?deleteError=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  redirect("/admin/posts?deleted=1");
}
