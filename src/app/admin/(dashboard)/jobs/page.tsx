import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DeleteJobForm } from "@/components/admin/DeleteJobForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { getAllJobs } from "@/lib/services/jobs";
import { CONTENT_STATUSES, EMPLOYMENT_TYPES, type ContentStatus, type EmploymentType } from "@/lib/db/enums";
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
  const employmentTypeParam = firstValue(params.employmentType);
  const employmentType = EMPLOYMENT_TYPES.includes(employmentTypeParam as EmploymentType)
    ? (employmentTypeParam as EmploymentType)
    : undefined;
  const company = firstValue(params.company) || undefined;
  const location = firstValue(params.location) || undefined;
  const search = firstValue(params.q) || undefined;
  const page = Math.max(1, Number(firstValue(params.page)) || 1);
  const deleted = params.deleted === "1";
  const deleteError = firstValue(params.deleteError);

  const jobs = await getAllJobs({
    status,
    employmentType,
    company,
    location,
    search,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Jobs"
        description="All jobs regardless of publication status."
        action={
          <Link href="/admin/jobs/new" className={buttonClasses("primary")}>
            New Job
          </Link>
        }
      />

      {deleted && (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Job deleted.
        </p>
      )}
      {deleteError && (
        <p className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {deleteError}
        </p>
      )}

      <form
        action="/admin/jobs"
        method="get"
        className="grid gap-3 rounded-lg border border-zinc-200 p-4 sm:grid-cols-5 dark:border-zinc-800"
      >
        <div className="sm:col-span-2">
          <label htmlFor="q" className="sr-only">
            Search by title
          </label>
          <input
            id="q"
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Search by title"
            className={inputClasses}
          />
        </div>

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

        <div>
          <label htmlFor="employmentType" className="sr-only">
            Employment type
          </label>
          <select
            id="employmentType"
            name="employmentType"
            defaultValue={employmentType ?? ""}
            className={inputClasses}
          >
            <option value="">All employment types</option>
            {EMPLOYMENT_TYPES.map((value) => (
              <option key={value} value={value}>
                {formatEnumLabel(value)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="company" className="sr-only">
            Company
          </label>
          <input
            id="company"
            type="text"
            name="company"
            defaultValue={company}
            placeholder="Company"
            className={inputClasses}
          />
        </div>

        <div className="sm:col-span-4">
          <label htmlFor="location" className="sr-only">
            Location
          </label>
          <input
            id="location"
            type="text"
            name="location"
            defaultValue={location}
            placeholder="Location"
            className={inputClasses}
          />
        </div>

        <button type="submit" className={cn(buttonClasses("secondary"), "sm:w-fit")}>
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
                <th className={tableHeadCellClasses}>Type</th>
                <th className={tableHeadCellClasses}>Experience</th>
                <th className={tableHeadCellClasses}>Status</th>
                <th className={tableHeadCellClasses}>Published</th>
                <th className={tableHeadCellClasses}>Updated</th>
                <th className={tableHeadCellClasses}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const id = String(job._id);
                const canView = job.status === "PUBLISHED";

                return (
                  <tr key={id} className={tableRowClasses}>
                    <td className={cn(tableCellClasses, "max-w-xs truncate")}>{job.title}</td>
                    <td className={tableCellClasses}>{job.company}</td>
                    <td className={tableCellClasses}>{job.location}</td>
                    <td className={tableCellClasses}>{formatEnumLabel(job.employmentType)}</td>
                    <td className={tableCellClasses}>{job.experience || "—"}</td>
                    <td className={tableCellClasses}>
                      <StatusBadge status={job.status} />
                    </td>
                    <td className={tableCellClasses}>{formatDate(job.publishedAt) ?? "—"}</td>
                    <td className={tableCellClasses}>{formatDate(job.updatedAt)}</td>
                    <td className={tableCellClasses}>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/jobs/${id}/edit`}
                          className="font-medium text-indigo-600 dark:text-indigo-400"
                        >
                          Edit
                        </Link>
                        {canView ? (
                          <Link
                            href={`/jobs/${job.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-zinc-600 dark:text-zinc-400"
                          >
                            View
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/jobs/${id}/preview`}
                            className="font-medium text-zinc-600 dark:text-zinc-400"
                          >
                            Preview
                          </Link>
                        )}
                        <DeleteJobForm id={id} title={job.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No jobs match these filters."
          description="Try clearing the filters, or create a new job."
        />
      )}

      <Pagination
        basePath="/admin/jobs"
        currentPage={page}
        hasNextPage={jobs.length === PAGE_SIZE}
        searchParams={{ status, employmentType, company, location, q: search }}
      />
    </div>
  );
}
