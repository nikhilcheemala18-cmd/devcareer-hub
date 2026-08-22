import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TagForm } from "@/components/admin/TagForm";
import { DeleteTagForm } from "@/components/admin/DeleteTagForm";
import { getTagById, getTagUsage } from "@/lib/services/tags";
import { updateTagAction } from "@/app/admin/(dashboard)/tags/actions";

export const metadata: Metadata = {
  title: "Edit Tag",
};

export const dynamic = "force-dynamic";

async function loadTag(id: string) {
  try {
    return await getTagById(id);
  } catch {
    return null;
  }
}

export default async function EditTagPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const tag = await loadTag(id);

  if (!tag) {
    notFound();
  }

  const usage = await getTagUsage(id);
  const boundAction = updateTagAction.bind(null, id);
  const successMessage = query.created ? "Tag created." : query.saved ? "Tag saved." : null;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Edit Tag"
        description={tag.name}
        action={<DeleteTagForm id={id} name={tag.name} />}
      />

      {successMessage && (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          {successMessage}{" "}
          <Link href="/admin/tags" className="font-medium underline">
            Back to tags →
          </Link>
        </p>
      )}

      <TagForm
        mode="edit"
        action={boundAction}
        usage={usage}
        initialValues={{ name: tag.name, slug: tag.slug }}
      />
    </div>
  );
}
