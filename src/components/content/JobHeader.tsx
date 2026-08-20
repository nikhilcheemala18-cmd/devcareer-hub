import { Badge } from "@/components/ui/Badge";
import { formatDate, formatEnumLabel } from "@/lib/format";

export interface JobHeaderData {
  title: string;
  company: string;
  employmentType: string;
  experience?: string | null;
  publishedAt?: Date | string | null;
}

export function JobHeader({ job }: { job: JobHeaderData }) {
  const publishedLabel = formatDate(job.publishedAt);

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{formatEnumLabel(job.employmentType)}</Badge>
        {job.experience && <Badge>{job.experience}</Badge>}
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
        {job.title}
      </h1>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-zinc-600 dark:text-zinc-400">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{job.company}</span>
        {publishedLabel && (
          <>
            <span aria-hidden>·</span>
            <span>Posted {publishedLabel}</span>
          </>
        )}
      </div>
    </header>
  );
}
