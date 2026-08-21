"use client";

import type { FormEvent } from "react";
import { deletePostAction } from "@/app/admin/(dashboard)/posts/actions";

/** Native confirm() before the destructive delete actually submits — no accidental single-click deletes. */
export function DeletePostForm({ id, title }: { id: string; title: string }) {
  const action = deletePostAction.bind(null, id);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
      >
        Delete
      </button>
    </form>
  );
}
