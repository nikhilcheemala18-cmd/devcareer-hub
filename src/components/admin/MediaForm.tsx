"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { inputClasses, buttonClasses, cn } from "@/lib/styles";
import type { MediaFormState } from "@/app/admin/(dashboard)/media/actions";

export interface MediaFormValues {
  filename: string;
  url: string;
  type: string;
  altText: string;
}

const initialFormState: MediaFormState = {};

export function MediaForm({
  mode,
  action,
  initialValues,
  usage,
}: {
  mode: "create" | "edit";
  action: (prevState: MediaFormState, formData: FormData) => Promise<MediaFormState>;
  initialValues: MediaFormValues;
  usage?: { posts: number; jobs: number };
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const [url, setUrl] = useState(initialValues.url);

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
          Used as featured image by {usage.posts} post{usage.posts === 1 ? "" : "s"} and {usage.jobs} job
          {usage.jobs === 1 ? "" : "s"}.
        </p>
      )}

      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- URL is arbitrary admin-entered external media, no storage provider to serve it through
        <img
          src={url}
          alt={initialValues.altText}
          className="h-40 w-full rounded-lg border border-zinc-200 object-contain dark:border-zinc-800"
        />
      )}

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          URL
        </label>
        <input
          id="url"
          name="url"
          type="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com/image.jpg"
          className={cn(inputClasses, "mt-1")}
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Must be http:// or https://. This links to an externally hosted file — no storage provider is
          configured yet, so nothing is uploaded here.
        </p>
      </div>

      <div>
        <label htmlFor="filename" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Filename / Title
        </label>
        <input
          id="filename"
          name="filename"
          type="text"
          required
          defaultValue={initialValues.filename}
          className={cn(inputClasses, "mt-1")}
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Type
        </label>
        <input
          id="type"
          name="type"
          type="text"
          required
          defaultValue={initialValues.type}
          placeholder="e.g. image, document"
          className={cn(inputClasses, "mt-1")}
        />
      </div>

      <div>
        <label htmlFor="altText" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Alt Text
        </label>
        <input
          id="altText"
          name="altText"
          type="text"
          maxLength={300}
          defaultValue={initialValues.altText}
          className={cn(inputClasses, "mt-1")}
        />
      </div>

      <div className="flex items-center gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <button
          type="submit"
          disabled={pending}
          className={cn(buttonClasses("primary"), pending && "opacity-70")}
        >
          {mode === "create" ? "Add Media" : "Save Changes"}
        </button>
        <Link
          href="/admin/media"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
