/** Small shared style tokens so cards, buttons, and badges stay visually consistent across the site. */

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function buttonClasses(variant: "primary" | "secondary" = "primary"): string {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

  if (variant === "secondary") {
    return cn(
      base,
      "border border-zinc-300 text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
    );
  }

  return cn(base, "bg-indigo-600 text-white hover:bg-indigo-700");
}

export const cardClasses =
  "rounded-lg border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700";

export type BadgeTone = "neutral" | "accent" | "success" | "warning";

export function badgeClasses(tone: BadgeTone = "neutral"): string {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

  switch (tone) {
    case "accent":
      return cn(base, "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300");
    case "success":
      return cn(base, "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300");
    case "warning":
      return cn(base, "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300");
    default:
      return cn(base, "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300");
  }
}

export const inputClasses =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

/** Table shell used by the admin list pages — horizontally scrolls its own content instead of the page. */
export const tableWrapperClasses =
  "overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800";
export const tableClasses = "w-full min-w-max text-left text-sm";
export const tableHeadRowClasses =
  "border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900";
export const tableHeadCellClasses =
  "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 whitespace-nowrap";
export const tableRowClasses =
  "border-b border-zinc-100 last:border-0 dark:border-zinc-900";
export const tableCellClasses = "px-4 py-3 align-middle text-zinc-800 dark:text-zinc-200";
