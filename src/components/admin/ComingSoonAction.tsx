import { buttonClasses, cn } from "@/lib/styles";

/**
 * A visibly-disabled action for functionality that doesn't exist yet
 * (post/job creation lands in a later phase). Native `disabled` rather than
 * a styled link, so it's never a broken/fake navigation target.
 */
export function ComingSoonAction({ label, note }: { label: string; note: string }) {
  return (
    <span className="inline-flex flex-col items-start gap-1 sm:items-end">
      <button
        type="button"
        disabled
        aria-disabled="true"
        className={cn(buttonClasses("secondary"), "cursor-not-allowed opacity-50")}
      >
        {label}
      </button>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{note}</span>
    </span>
  );
}
