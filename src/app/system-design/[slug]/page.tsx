import type { Metadata } from "next";
import { PostDetailView } from "@/components/content/PostDetailView";
import { buildPostDetailMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildPostDetailMetadata({ slug, postType: "SYSTEM_DESIGN", basePath: "/system-design" });
}

export default async function SystemDesignPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PostDetailView
      slug={slug}
      postType="SYSTEM_DESIGN"
      basePath="/system-design"
      backLabel="System Design"
      relatedTitle="Related System Design Content"
      relatedEmptyMessage="No related system design content yet."
    />
  );
}
