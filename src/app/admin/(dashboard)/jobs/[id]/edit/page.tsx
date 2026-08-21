import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { JobForm } from "@/components/admin/JobForm";
import { DeleteJobForm } from "@/components/admin/DeleteJobForm";
import { getJobById } from "@/lib/services/jobs";
import { updateJobAction } from "@/app/admin/(dashboard)/jobs/actions";
import { toDateInputValue } from "@/lib/format";

export const metadata: Metadata = {
  title: "Edit Job",
};

export const dynamic = "force-dynamic";

async function loadJob(id: string) {
  try {
    return await getJobById(id);
  } catch {
    return null;
  }
}

export default async function EditJobPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const job = await loadJob(id);

  if (!job) {
    notFound();
  }

  const boundAction = updateJobAction.bind(null, id);
  const successMessage = query.created ? "Job created." : query.saved ? "Job saved." : null;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Edit Job"
        description={job.title}
        action={<DeleteJobForm id={id} title={job.title} />}
      />

      {successMessage && (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          {successMessage}{" "}
          <Link href={`/admin/jobs/${id}/preview`} className="font-medium underline">
            Preview →
          </Link>
        </p>
      )}

      <JobForm
        mode="edit"
        action={boundAction}
        currentStatus={job.status}
        initialValues={{
          title: job.title,
          slug: job.slug,
          company: job.company,
          location: job.location,
          experience: job.experience ?? "",
          salary: job.salary ?? "",
          employmentType: job.employmentType,
          description: job.description,
          requirements: job.requirements ?? [],
          applicationUrl: job.applicationUrl,
          source: job.source ?? "",
          deadline: toDateInputValue(job.deadline),
          seoMetaTitle: job.seo?.metaTitle ?? "",
          seoMetaDescription: job.seo?.metaDescription ?? "",
          seoCanonicalUrl: job.seo?.canonicalUrl ?? "",
        }}
      />
    </div>
  );
}
