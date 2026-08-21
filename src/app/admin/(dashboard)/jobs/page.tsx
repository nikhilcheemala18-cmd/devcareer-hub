import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ComingSoonAction } from "@/components/admin/ComingSoonAction";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { getAllJobs } from "@/lib/services/jobs";
import { CONTENT_STATUSES, type ContentStatus } from "@/lib/db/enums";
import { formatDate, formatEnumLabel } from "@/lib/format";
import {
  inputClasses,
  buttonClasses,
  cn,
  tableWrapperClasses,
  tableClasses,
  tableHeadRowClasses,
  tableHeadCellClasses,
  tableRowClasses,
  tableCellClasses,
} from "@/lib/styles";

export const metadata: Metadata = {
  title: "Jobs",
};

const PAGE_SIZE = 20;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const statusParam = firstValue(params.status);
  const status = CONTENT_STATUSES.includes(statusParam as ContentStatus)
    ? (statusParam as ContentStatus)
    : undefined;
  const page = Math.max(1, Number(firstValue(params.page)) || 1);

  const jobs = await getAllJobs({ status, page, limit: PAGE_SIZE });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Jobs"
        description="All jobs regardless of publication status."
        action={<ComingSoonAction label="New Job" note="Coming in Phase 8" />}
      />

      <form
        action="/admin/jobs"
        method="get"
        className="grid gap-3 rounded-lg border border-zinc-200 p-4 sm:grid-cols-3 dark:border-zinc-800"
      >
        <div>
          <label htmlFor="status" className="sr-only">
            Status
          </label>
          <select id="status" name="status" defaultValue={status ?? ""} className={inputClasses}>
            <option value="">All statuses</option>
            {CONTENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {formatEnumLabel(value)}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className={cn(buttonClasses("secondary"))}>
          Apply filters
        </button>
      </form>

      {jobs.length > 0 ? (
        <div className={tableWrapperClasses}>
          <table className={tableClasses}>
            <thead>
              <tr className={tableHeadRowClasses}>
                <th className={tableHeadCellClasses}>Title</th>
                <th className={tableHeadCellClasses}>Company</th>
                <th className={tableHeadCellClasses}>Location</th>
                <th className={tableHeadCellClasses}>Status</th>
                <th className={tableHeadCellClasses}>Updated</th>
                <th className={tableHeadCellClasses}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={String(job._id)} className={tableRowClasses}>
                  <td className={tableCellClasses}>{job.title}</td>
                  <td className={tableCellClasses}>{job.company}</td>
                  <td className={tableCellClasses}>{job.location}</td>
                  <td className={tableCellClasses}>
                    <StatusBadge status={job.status} />
                  </td>
                  <td className={tableCellClasses}>{formatDate(job.updatedAt)}</td>
                  <td className={tableCellClasses}>
                    <div className="flex items-center gap-3">
                      {job.status === "PUBLISHED" ? (
                        <Link
                          href={`/jobs/${job.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-indigo-600 dark:text-indigo-400"
                        >
                          View
                        </Link>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600">Not public</span>
                      )}
                      <span className="text-zinc-300 dark:text-zinc-700" title="Editing arrives in Phase 8">
                        Edit
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No jobs match these filters."
          description="Try clearing the filters, or check back once jobs have been created."
        />
      )}

      <Pagination
        basePath="/admin/jobs"
        currentPage={page}
        hasNextPage={jobs.length === PAGE_SIZE}
        searchParams={{ status }}
      />
    </div>
  );
}
