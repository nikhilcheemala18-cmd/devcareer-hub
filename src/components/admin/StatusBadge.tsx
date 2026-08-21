import { Badge } from "@/components/ui/Badge";
import type { BadgeTone } from "@/lib/styles";
import { formatEnumLabel } from "@/lib/format";
import type { ContentStatus } from "@/lib/db/enums";

const TONE_BY_STATUS: Record<ContentStatus, BadgeTone> = {
  DRAFT: "warning",
  PUBLISHED: "success",
  ARCHIVED: "neutral",
};

/** Status is conveyed by the label text as well as color, not color alone. */
export function StatusBadge({ status }: { status: ContentStatus }) {
  return <Badge tone={TONE_BY_STATUS[status]}>{formatEnumLabel(status)}</Badge>;
}
