import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostForm } from "@/components/admin/PostForm";
import { DeletePostForm } from "@/components/admin/DeletePostForm";
import { getPostById } from "@/lib/services/posts";
import { getCategories } from "@/lib/services/categories";
import { getTags } from "@/lib/services/tags";
import { getUserById } from "@/lib/services/users";
import { updatePostAction } from "@/app/admin/(dashboard)/posts/actions";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Edit Post",
};

export const dynamic = "force-dynamic";

async function loadPost(id: string) {
  try {
    return await getPostById(id);
  } catch {
    return null;
  }
}

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const post = await loadPost(id);

  if (!post) {
    notFound();
  }

  const [categories, tags, author] = await Promise.all([
    getCategories(),
    getTags(),
    getUserById(String(post.author)),
  ]);

  const boundAction = updatePostAction.bind(null, id);
  const successMessage = query.created ? "Post created." : query.saved ? "Post saved." : null;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Edit Post"
        description={post.title}
        action={<DeletePostForm id={id} title={post.title} />}
      />

      {successMessage && (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          {successMessage}{" "}
          <Link href={`/admin/posts/${id}/preview`} className="font-medium underline">
            Preview →
          </Link>
        </p>
      )}

      <PostForm
        mode="edit"
        action={boundAction}
        currentStatus={post.status}
        initialValues={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          type: post.type,
          category: post.category ? String(post.category) : "",
          tags: post.tags?.map((tag) => String(tag)) ?? [],
          seoMetaTitle: post.seo?.metaTitle ?? "",
          seoMetaDescription: post.seo?.metaDescription ?? "",
          seoCanonicalUrl: post.seo?.canonicalUrl ?? "",
        }}
        categories={categories.map((category) => ({ id: String(category._id), name: category.name }))}
        tags={tags.map((tag) => ({ id: String(tag._id), name: tag.name }))}
        authorName={author?.name}
      />
    </div>
  );
}
