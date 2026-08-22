"use client";

import type { FormEvent } from "react";
import { deleteTagAction } from "@/app/admin/(dashboard)/tags/actions";

/** Native confirm() before the destructive delete actually submits — no accidental single-click deletes. */
export function DeleteTagForm({ id, name }: { id: string; name: string }) {
  const action = deleteTagAction.bind(null, id);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) {
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
