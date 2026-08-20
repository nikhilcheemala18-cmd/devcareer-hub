import type { ReactNode } from "react";

/** Generic "Related X" section reused for both related posts and related jobs. */
export function RelatedContent<T>({
  title,
  items,
  renderItem,
  getKey,
  emptyMessage,
}: {
  title: string;
  items: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  emptyMessage: string;
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">{title}</h2>
      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div key={getKey(item)}>{renderItem(item)}</div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>
      )}
    </section>
  );
}
