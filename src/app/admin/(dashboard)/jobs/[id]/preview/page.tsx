import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobHeader } from "@/components/content/JobHeader";
import { JobMeta } from "@/components/content/JobMeta";
import { ApplyButton } from "@/components/content/ApplyButton";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getJobById } from "@/lib/services/jobs";

// Protected by the admin layout's requireAdmin(); never linked publicly.
// noindex is defense-in-depth in case a URL ever leaks.
export const metadata: Metadata = {
  title: "Preview Job",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function loadJob(id: string) {
  try {
    return await getJobById(id);
  } catch {
    return null;
  }
}

export default async function PreviewJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await loadJob(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-indigo-300 bg-indigo-50 px-4 py-3 text-sm dark:border-indigo-800 dark:bg-indigo-950">
        <span className="text-indigo-800 dark:text-indigo-200">
          Admin preview — not the public URL. <StatusBadge status={job.status} />
        </span>
        <Link
          href={`/admin/jobs/${id}/edit`}
          className="font-medium text-indigo-700 hover:underline dark:text-indigo-300"
        >
          ← Back to edit
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        <JobHeader job={job} />
        <JobMeta job={job} />

        <div className="flex flex-col gap-6">
          <ContentRenderer content={job.description} />

          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Requirements</h2>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
                {job.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <ApplyButton applicationUrl={job.applicationUrl} />
      </div>
    </div>
  );
}
