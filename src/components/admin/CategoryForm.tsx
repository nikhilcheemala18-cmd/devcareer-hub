"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { slugify } from "@/lib/format";
import { inputClasses, buttonClasses, cn } from "@/lib/styles";
import type { CategoryFormState } from "@/app/admin/(dashboard)/categories/actions";

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
}

const initialFormState: CategoryFormState = {};

export function CategoryForm({
  mode,
  action,
  initialValues,
  usage,
}: {
  mode: "create" | "edit";
  action: (prevState: CategoryFormState, formData: FormData) => Promise<CategoryFormState>;
  initialValues: CategoryFormValues;
  usage?: { posts: number };
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);

  const [name, setName] = useState(initialValues.name);
  const [slug, setSlug] = useState(initialValues.slug);
  const slugEditedManually = useRef(mode === "edit");

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEditedManually.current) {
      setSlug(slugify(value));
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.error && (
        <p
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {state.error}
        </p>
      )}

      {usage && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Used by {usage.posts} post{usage.posts === 1 ? "" : "s"}.
        </p>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
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
          onChange={(event) => {
            slugEditedManually.current = true;
            setSlug(event.target.value);
          }}
          className={cn(inputClasses, "mt-1 font-mono text-sm")}
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Lowercase letters, numbers, and hyphens only. Generated from the name unless edited.
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={initialValues.description}
          className={cn(inputClasses, "mt-1")}
        />
      </div>

      <div className="flex items-center gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <button
          type="submit"
          disabled={pending}
          className={cn(buttonClasses("primary"), pending && "opacity-70")}
        >
          {mode === "create" ? "Create Category" : "Save Changes"}
        </button>
        <Link
          href="/admin/categories"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
