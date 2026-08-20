import { notFound } from "next/navigation";
import { DetailPageContainer } from "@/components/content/DetailPageContainer";
import { ArticleHeader, type ArticleHeaderData } from "@/components/content/ArticleHeader";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { RelatedContent } from "@/components/content/RelatedContent";
import { PostCard, toPostCardData } from "@/components/content/PostCard";
import { getPostBySlug, getRelatedPosts } from "@/lib/services/posts";
import { getUserById } from "@/lib/services/users";
import { getMediaById } from "@/lib/services/media";
import { getCategories } from "@/lib/services/categories";
import { getTags } from "@/lib/services/tags";
import { buildIdMap } from "@/lib/format";
import type { PostType } from "@/lib/db/enums";

/**
 * Shared implementation for /blog/[slug], /interview-prep/[slug], and
 * /system-design/[slug] — same data shape and layout, only the content type,
 * base path, and copy differ per route.
 */
export async function PostDetailView({
  slug,
  postType,
  basePath,
  backLabel,
  relatedTitle,
  relatedEmptyMessage,
}: {
  slug: string;
  postType: PostType;
  basePath: string;
  backLabel: string;
  relatedTitle: string;
  relatedEmptyMessage: string;
}) {
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "PUBLISHED" || post.type !== postType) {
    notFound();
  }

  const [author, media, categories, tags, relatedPosts] = await Promise.all([
    getUserById(String(post.author)),
    post.featuredImage ? getMediaById(String(post.featuredImage)) : Promise.resolve(null),
    getCategories(),
    getTags(),
    getRelatedPosts(post, 4),
  ]);

  const categoryNameById = buildIdMap(categories, "name");
  const tagNameById = buildIdMap(tags, "name");

  const articleData: ArticleHeaderData = {
    title: post.title,
    excerpt: post.excerpt,
    type: post.type,
    publishedAt: post.publishedAt,
    categoryName: post.category ? categoryNameById.get(String(post.category)) : undefined,
    tagNames: post.tags
      ?.map((tag) => tagNameById.get(String(tag)))
      .filter((name): name is string => Boolean(name)),
    authorName: author?.name,
    featuredImageUrl: media?.url,
    featuredImageAlt: media?.altText ?? undefined,
  };

  return (
    <DetailPageContainer backHref={basePath} backLabel={backLabel}>
      <ArticleHeader article={articleData} />
      <ContentRenderer content={post.content} />
      <RelatedContent
        title={relatedTitle}
        items={relatedPosts}
        getKey={(item) => String(item._id)}
        emptyMessage={relatedEmptyMessage}
        renderItem={(item) => (
          <PostCard post={toPostCardData(item, categoryNameById, tagNameById)} />
        )}
      />
    </DetailPageContainer>
  );
}
