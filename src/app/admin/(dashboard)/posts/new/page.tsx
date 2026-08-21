import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostForm } from "@/components/admin/PostForm";
import { getCategories } from "@/lib/services/categories";
import { getTags } from "@/lib/services/tags";
import { getCurrentUser } from "@/lib/auth/auth";
import { getUserById } from "@/lib/services/users";
import { createPostAction } from "@/app/admin/(dashboard)/posts/actions";

export const metadata: Metadata = {
  title: "New Post",
};

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const currentUser = await getCurrentUser();

  const [categories, tags, author] = await Promise.all([
    getCategories(),
    getTags(),
    currentUser ? getUserById(currentUser.id) : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="New Post" description="Create a new blog, interview prep, system design, guide, or career post." />

      <PostForm
        mode="create"
        action={createPostAction}
        initialValues={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          type: "BLOG",
          category: "",
          tags: [],
          seoMetaTitle: "",
          seoMetaDescription: "",
          seoCanonicalUrl: "",
        }}
        categories={categories.map((category) => ({ id: String(category._id), name: category.name }))}
        tags={tags.map((tag) => ({ id: String(tag._id), name: tag.name }))}
        authorName={author?.name}
      />
    </div>
  );
}
