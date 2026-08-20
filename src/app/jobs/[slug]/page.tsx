import { notFound } from "next/navigation";
import { DetailPageContainer } from "@/components/content/DetailPageContainer";
import { JobHeader } from "@/components/content/JobHeader";
import { JobMeta } from "@/components/content/JobMeta";
import { ApplyButton } from "@/components/content/ApplyButton";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { RelatedContent } from "@/components/content/RelatedContent";
import { JobCard } from "@/components/content/JobCard";
import { getJobBySlug, getRelatedJobs } from "@/lib/services/jobs";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job || job.status !== "PUBLISHED") {
    notFound();
  }

  const relatedJobs = await getRelatedJobs(job, 4);

  return (
    <DetailPageContainer backHref="/jobs" backLabel="Jobs">
      <JobHeader job={job} />
      <JobMeta job={job} />

      <div className="flex flex-col gap-6">
        <ContentRenderer content={job.description} />

        {job.requirements && job.requirements.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
              Requirements
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-zinc-700 dark:text-zinc-300">
              {job.requirements.map((requirement, index) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ApplyButton applicationUrl={job.applicationUrl} />

      <RelatedContent
        title="Related Jobs"
        items={relatedJobs}
        getKey={(item) => String(item._id)}
        emptyMessage="No related jobs yet."
        renderItem={(item) => <JobCard job={item} />}
      />
    </DetailPageContainer>
  );
}
