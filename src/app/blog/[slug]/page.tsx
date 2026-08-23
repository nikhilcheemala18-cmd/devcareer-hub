import type { Metadata } from "next";
import { PostDetailView } from "@/components/content/PostDetailView";
import { buildPostDetailMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildPostDetailMetadata({ slug, postType: "BLOG", basePath: "/blog" });
}

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
