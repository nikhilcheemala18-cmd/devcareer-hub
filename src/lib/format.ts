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
