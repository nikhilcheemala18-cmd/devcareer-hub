import { PostDetailView } from "@/components/content/PostDetailView";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PostDetailView
      slug={slug}
      postType="BLOG"
      basePath="/blog"
      backLabel="Blog"
      relatedTitle="Related Articles"
      relatedEmptyMessage="No related articles yet."
    />
  );
}
