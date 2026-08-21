"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EMPLOYMENT_TYPES, type ContentStatus, type EmploymentType } from "@/lib/db/enums";
import { slugify, formatEnumLabel } from "@/lib/format";
import { inputClasses, buttonClasses, cn } from "@/lib/styles";
import type { JobFormState } from "@/app/admin/(dashboard)/jobs/actions";

export interface JobFormValues {
  title: string;
  slug: string;
  company: string;
  location: string;
  experience: string;
  salary: string;
  employmentType: EmploymentType;
  description: string;
  requirements: string[];
  applicationUrl: string;
  source: string;
  deadline: string; // "YYYY-MM-DD" or ""
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoCanonicalUrl: string;
}

const initialFormState: JobFormState = {};

export function JobForm({
  mode,
  action,
  initialValues,
  currentStatus,
}: {
  mode: "create" | "edit";
  action: (prevState: JobFormState, formData: FormData) => Promise<JobFormState>;
  initialValues: JobFormValues;
  currentStatus?: ContentStatus;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);

  const [title, setTitle] = useState(initialValues.title);
  const [slug, setSlug] = useState(initialValues.slug);
  const slugEditedManually = useRef(mode === "edit");

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isDirty) return;
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function handleFormChange(event: FormEvent<HTMLFormElement>) {
    setIsDirty(true);
    if (event.target instanceof HTMLInputElement && event.target.name === "slug") {
      slugEditedManually.current = true;
    }
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEditedManually.current) {
      setSlug(slugify(value));
    }
  }

  return (
    <form
      action={formAction}
      onChange={handleFormChange}
      onSubmit={() => setIsDirty(false)}
      className="flex flex-col gap-8"
    >
      {state?.error && (
        <p
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {state.error}
        </p>
      )}

      {currentStatus && (
        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          Current status: <StatusBadge status={currentStatus} />
          {currentStatus === "PUBLISHED" && (
            <span className="text-amber-600 dark:text-amber-400">
              — changing the slug will break existing links; no redirect is created.
            </span>
          )}
        </div>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Basic Info</h2>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Job Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className={cn(inputClasses, "mt-1")}
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className={cn(inputClasses, "mt-1 font-mono text-sm")}
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Lowercase letters, numbers, and hyphens only. Generated from the title unless edited.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Company
            </label>
            <input
              id="company"
              name="company"
              type="text"
              required
              defaultValue={initialValues.company}
              className={cn(inputClasses, "mt-1")}
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              defaultValue={initialValues.location}
              placeholder="e.g. Remote"
              className={cn(inputClasses, "mt-1")}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="employmentType" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Employment Type
            </label>
            <select
              id="employmentType"
              name="employmentType"
              required
              defaultValue={initialValues.employmentType}
              className={cn(inputClasses, "mt-1")}
            >
              {EMPLOYMENT_TYPES.map((value) => (
                <option key={value} value={value}>
                  {formatEnumLabel(value)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Experience
            </label>
            <input
              id="experience"
              name="experience"
              type="text"
              defaultValue={initialValues.experience}
              placeholder="e.g. 2-4 years"
              className={cn(inputClasses, "mt-1")}
            />
          </div>

          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Salary
            </label>
            <input
              id="salary"
              name="salary"
              type="text"
              defaultValue={initialValues.salary}
              placeholder="e.g. $120k - $150k"
              className={cn(inputClasses, "mt-1")}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Description</h2>
        <MarkdownEditor name="description" defaultValue={initialValues.description} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Requirements</h2>
        <label htmlFor="requirements" className="sr-only">
          Requirements, one per line
        </label>
        <textarea
          id="requirements"
          name="requirements"
          rows={6}
          defaultValue={initialValues.requirements.join("\n")}
          placeholder={"One requirement per line, e.g.\n3+ years with Node.js\nExperience with MongoDB"}
          className={inputClasses}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">One requirement per line.</p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Application</h2>

        <div>
          <label htmlFor="applicationUrl" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Application URL
          </label>
          <input
            id="applicationUrl"
            name="applicationUrl"
            type="url"
            required
            defaultValue={initialValues.applicationUrl}
            placeholder="https://example.com/careers/apply"
            className={cn(inputClasses, "mt-1")}
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Where the public Apply button sends applicants. Must be http:// or https://.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Source
            </label>
            <input
              id="source"
              name="source"
              type="text"
              defaultValue={initialValues.source}
              placeholder="e.g. Company careers page"
              className={cn(inputClasses, "mt-1")}
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Where this listing was sourced from — a short label, not a link.
            </p>
          </div>

          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Deadline
            </label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              defaultValue={initialValues.deadline}
              className={cn(inputClasses, "mt-1")}
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Optional. Clear to remove it.</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">SEO</h2>

        <div>
          <label htmlFor="seoMetaTitle" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Meta title
          </label>
          <input
            id="seoMetaTitle"
            name="seoMetaTitle"
            type="text"
            maxLength={70}
            defaultValue={initialValues.seoMetaTitle}
            className={cn(inputClasses, "mt-1")}
          />
        </div>

        <div>
          <label
            htmlFor="seoMetaDescription"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Meta description
          </label>
          <textarea
            id="seoMetaDescription"
            name="seoMetaDescription"
            rows={2}
            maxLength={160}
            defaultValue={initialValues.seoMetaDescription}
            className={cn(inputClasses, "mt-1")}
          />
        </div>

        <div>
          <label
            htmlFor="seoCanonicalUrl"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Canonical URL
          </label>
          <input
            id="seoCanonicalUrl"
            name="seoCanonicalUrl"
            type="url"
            defaultValue={initialValues.seoCanonicalUrl}
            className={cn(inputClasses, "mt-1")}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={pending}
          className={cn(buttonClasses("secondary"), pending && "opacity-70")}
        >
          Save Draft
        </button>

        {mode === "edit" && (
          <button
            type="submit"
            name="intent"
            value="update"
            disabled={pending}
            className={cn(buttonClasses("secondary"), pending && "opacity-70")}
          >
            Update
          </button>
        )}

        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending}
          className={cn(buttonClasses("primary"), pending && "opacity-70")}
        >
          Publish
        </button>

        {mode === "edit" && currentStatus !== "ARCHIVED" && (
          <button
            type="submit"
            name="intent"
            value="archive"
            disabled={pending}
            className={cn(buttonClasses("secondary"), pending && "opacity-70")}
          >
            Archive
          </button>
        )}

        <Link
          href="/admin/jobs"
          className="ml-auto text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
