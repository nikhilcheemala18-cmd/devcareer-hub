"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/auth";
import { createJob, updateJob, deleteJob } from "@/lib/services/jobs";
import { AppError } from "@/lib/errors";
import type { ContentStatus, EmploymentType } from "@/lib/db/enums";

export interface JobFormState {
  error?: string;
}

/**
 * Explicit submit-button intents rather than a free-form "status" field, so
 * "Save Draft" can never accidentally publish and "Update" can never
 * accidentally change a job's current status. Mirrors the Post CMS.
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

function readJobFormData(formData: FormData) {
  const deadlineValue = String(formData.get("deadline") ?? "").trim();
  const seoMetaTitle = String(formData.get("seoMetaTitle") ?? "").trim();
  const seoMetaDescription = String(formData.get("seoMetaDescription") ?? "").trim();
  const seoCanonicalUrl = String(formData.get("seoCanonicalUrl") ?? "").trim();
  const hasSeo = Boolean(seoMetaTitle || seoMetaDescription || seoCanonicalUrl);

  const requirements = String(formData.get("requirements") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    company: String(formData.get("company") ?? ""),
    location: String(formData.get("location") ?? ""),
    experience: String(formData.get("experience") ?? "").trim() || undefined,
    salary: String(formData.get("salary") ?? "").trim() || undefined,
    employmentType: String(formData.get("employmentType") ?? "") as EmploymentType,
    description: String(formData.get("description") ?? ""),
    requirements,
    applicationUrl: String(formData.get("applicationUrl") ?? "").trim(),
    source: String(formData.get("source") ?? "").trim() || undefined,
    // Cast, not validated here — createJob/updateJob still run this through
    // zod (z.coerce.date()) at runtime, which rejects anything invalid.
    deadline: (deadlineValue ? new Date(deadlineValue) : null) as Date | null,
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

export async function createJobAction(
  _prevState: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  await requireAdmin();
  const intent = formData.get("intent");
  const status = statusForIntent(intent) ?? "DRAFT";
  const data = readJobFormData(formData);

  let created;
  try {
    created = await createJob({
      ...data,
      deadline: data.deadline ?? undefined,
      status,
    });
  } catch (error) {
    return { error: messageFor(error) };
  }

  redirect(`/admin/jobs/${String(created._id)}/edit?created=1`);
}

export async function updateJobAction(
  id: string,
  _prevState: JobFormState,
  formData: FormData
): Promise<JobFormState> {
  await requireAdmin();
  const intent = formData.get("intent");
  const status = statusForIntent(intent);
  const data = readJobFormData(formData);

  try {
    await updateJob(id, status ? { ...data, status } : data);
  } catch (error) {
    return { error: messageFor(error) };
  }

  redirect(`/admin/jobs/${id}/edit?saved=1`);
}

export async function deleteJobAction(id: string): Promise<void> {
  await requireAdmin();

  try {
    await deleteJob(id);
  } catch (error) {
    if (error instanceof AppError) {
      redirect(`/admin/jobs?deleteError=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  redirect("/admin/jobs?deleted=1");
}
