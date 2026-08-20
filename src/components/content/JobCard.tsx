import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cardClasses, cn } from "@/lib/styles";
import { formatDate, formatEnumLabel } from "@/lib/format";

export interface JobCardData {
  slug: string;
  title: string;
  company: string;
  location: string;
  experience?: string | null;
  employmentType: string;
  publishedAt?: Date | string | null;
}

export function JobCard({ job }: { job: JobCardData }) {
  const publishedLabel = formatDate(job.publishedAt);

  return (
    <Link href={`/jobs/${job.slug}`} className={cn(cardClasses, "block")}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{formatEnumLabel(job.employmentType)}</Badge>
        {job.experience && <Badge>{job.experience}</Badge>}
      </div>

      <h3 className="mt-3 text-lg font-semibold text-zinc-950 dark:text-zinc-50">{job.title}</h3>
      <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">{job.company}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span>{job.location}</span>
        {publishedLabel && <span>Posted {publishedLabel}</span>}
      </div>
    </Link>
  );
}
