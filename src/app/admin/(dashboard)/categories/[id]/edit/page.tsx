import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteCategoryForm } from "@/components/admin/DeleteCategoryForm";
import { getCategoryById, getCategoryUsage } from "@/lib/services/categories";
import { updateCategoryAction } from "@/app/admin/(dashboard)/categories/actions";

export const metadata: Metadata = {
  title: "Edit Category",
};

export const dynamic = "force-dynamic";

async function loadCategory(id: string) {
  try {
    return await getCategoryById(id);
  } catch {
    return null;
  }
}

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const category = await loadCategory(id);

  if (!category) {
    notFound();
  }

  const usage = await getCategoryUsage(id);
  const boundAction = updateCategoryAction.bind(null, id);
  const successMessage = query.created ? "Category created." : query.saved ? "Category saved." : null;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Edit Category"
        description={category.name}
        action={<DeleteCategoryForm id={id} name={category.name} />}
      />

      {successMessage && (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          {successMessage}{" "}
          <Link href="/admin/categories" className="font-medium underline">
            Back to categories →
          </Link>
        </p>
      )}

      <CategoryForm
        mode="edit"
        action={boundAction}
        usage={usage}
        initialValues={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
        }}
      />
    </div>
  );
}
