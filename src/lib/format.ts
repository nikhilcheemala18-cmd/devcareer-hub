/** Turns SCREAMING_SNAKE_CASE enum values into readable labels, e.g. "INTERVIEW_PREP" -> "Interview Prep". */
export function formatEnumLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatDate(date: Date | string | null | undefined): string | null {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

/** Maps each document's `_id` to a chosen field, for resolving ObjectId refs to display values without a populate query. */
export function buildIdMap<T extends { _id: unknown }, K extends keyof T>(
  docs: T[],
  key: K
): Map<string, T[K]> {
  return new Map(docs.map((doc) => [String(doc._id), doc[key]]));
}

/** "Top 10 SQL Interview Questions" -> "top-10-sql-interview-questions". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Escapes regex metacharacters so user input can be safely used inside a RegExp. */
export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Formats a Date for an `<input type="date">` defaultValue ("YYYY-MM-DD").
 * Uses toISOString rather than local getters — a server running in a
 * non-UTC timezone would otherwise shift the displayed day by one.
 */
export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}
