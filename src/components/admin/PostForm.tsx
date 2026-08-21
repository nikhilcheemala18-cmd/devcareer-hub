"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { POST_TYPES, type ContentStatus, type PostType } from "@/lib/db/enums";
import { slugify, formatEnumLabel } from "@/lib/format";
import { inputClasses, buttonClasses, cn } from "@/lib/styles";
import type { PostFormState } from "@/app/admin/(dashboard)/posts/actions";

export interface PostFormValues {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  type: PostType;
  category: string;
  tags: string[];
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoCanonicalUrl: string;
}

const initialFormState: PostFormState = {};

export function PostForm({
  mode,
  action,
  initialValues,
  currentStatus,
  categories,
  tags,
  authorName,
}: {
  mode: "create" | "edit";
  action: (prevState: PostFormState, formData: FormData) => Promise<PostFormState>;
  initialValues: PostFormValues;
  currentStatus?: ContentStatus;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  authorName?: string;
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
            Title
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
            <label htmlFor="type" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Type
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue={initialValues.type}
              className={cn(inputClasses, "mt-1")}
            >
              {POST_TYPES.map((value) => (
                <option key={value} value={value}>
                  {formatEnumLabel(value)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={initialValues.category}
              className={cn(inputClasses, "mt-1")}
            >
              <option value="">— None —</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                No categories exist yet.
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={2}
            maxLength={500}
            defaultValue={initialValues.excerpt}
            className={cn(inputClasses, "mt-1")}
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Content</h2>
        <MarkdownEditor name="content" defaultValue={initialValues.content} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Tags</h2>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="tags"
                  value={tag.id}
                  defaultChecked={initialValues.tags.includes(tag.id)}
                  className="rounded border-zinc-300 dark:border-zinc-700"
                />
                {tag.name}
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No tags exist yet.</p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Featured Image</h2>
        <p className="rounded-md border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Media upload isn&apos;t available yet — coming in a later phase.
        </p>
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

      {authorName && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Author: {authorName}</p>
      )}

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

        <Link href="/admin/posts" className="ml-auto text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          Cancel
        </Link>
      </div>
    </form>
  );
}
