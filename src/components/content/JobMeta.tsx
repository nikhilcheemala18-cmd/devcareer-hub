import { formatDate } from "@/lib/format";

export interface JobMetaData {
  location: string;
  salary?: string | null;
  deadline?: Date | string | null;
  source?: string | null;
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

export function JobMeta({ job }: { job: JobMetaData }) {
  const deadlineLabel = formatDate(job.deadline);

  return (
    <dl className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-200 p-4 sm:grid-cols-4 dark:border-zinc-800">
      <MetaItem label="Location" value={job.location} />
      {job.salary && <MetaItem label="Salary" value={job.salary} />}
      {deadlineLabel && <MetaItem label="Deadline" value={deadlineLabel} />}
      {job.source && <MetaItem label="Source" value={job.source} />}
    </dl>
  );
}
