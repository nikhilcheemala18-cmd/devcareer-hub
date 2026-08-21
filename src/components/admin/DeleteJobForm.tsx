"use client";

import type { FormEvent } from "react";
import { deleteJobAction } from "@/app/admin/(dashboard)/jobs/actions";

/** Native confirm() before the destructive delete actually submits — no accidental single-click deletes. */
export function DeleteJobForm({ id, title }: { id: string; title: string }) {
  const action = deleteJobAction.bind(null, id);

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
