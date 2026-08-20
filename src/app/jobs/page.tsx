import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { JobCard } from "@/components/content/JobCard";
import { getPublishedJobs } from "@/lib/services/jobs";
import { EMPLOYMENT_TYPES, type EmploymentType } from "@/lib/db/enums";
import { formatEnumLabel } from "@/lib/format";
import { inputClasses, buttonClasses, cn } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Software engineering, backend, frontend, and internship opportunities.",
};

const PAGE_SIZE = 12;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const location = firstValue(params.location);
  const company = firstValue(params.company);
  const employmentTypeParam = firstValue(params.employmentType);
  const employmentType = EMPLOYMENT_TYPES.includes(employmentTypeParam as EmploymentType)
    ? (employmentTypeParam as EmploymentType)
    : undefined;
  const page = Math.max(1, Number(firstValue(params.page)) || 1);

  const jobs = await getPublishedJobs({
    location,
    company,
    employmentType,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <Container className="flex flex-col gap-8 py-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Jobs
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Software engineering, backend, frontend, and internship opportunities.
        </p>
      </div>

      <form
        action="/jobs"
        method="get"
        className="grid gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:grid-cols-4"
      >
        <div className="sm:col-span-1">
          <label htmlFor="location" className="sr-only">
            Location
          </label>
          <input
            id="location"
            type="text"
            name="location"
            defaultValue={location}
            placeholder="Location (e.g. Remote)"
            className={inputClasses}
          />
        </div>

        <div className="sm:col-span-1">
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

        <div className="sm:col-span-1">
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
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {formatEnumLabel(type)}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className={cn(buttonClasses("primary"), "sm:col-span-1")}>
          Apply filters
        </button>
      </form>

      {jobs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={String(job._id)} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No jobs available right now."
          description="Try clearing your filters, or check back soon for new listings."
        />
      )}

      <Pagination
        basePath="/jobs"
        currentPage={page}
        hasNextPage={jobs.length === PAGE_SIZE}
        searchParams={{ location, company, employmentType }}
      />
    </Container>
  );
}
