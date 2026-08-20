import { PostDetailView } from "@/components/content/PostDetailView";

export default async function InterviewPrepPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PostDetailView
      slug={slug}
      postType="INTERVIEW_PREP"
      basePath="/interview-prep"
      backLabel="Interview Prep"
      relatedTitle="Related Interview Preparation"
      relatedEmptyMessage="No related interview preparation content yet."
    />
  );
}
