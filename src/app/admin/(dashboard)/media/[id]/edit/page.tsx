import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaForm } from "@/components/admin/MediaForm";
import { DeleteMediaForm } from "@/components/admin/DeleteMediaForm";
import { getMediaById, getMediaUsage } from "@/lib/services/media";
import { updateMediaAction } from "@/app/admin/(dashboard)/media/actions";

export const metadata: Metadata = {
  title: "Edit Media",
};

export const dynamic = "force-dynamic";

async function loadMedia(id: string) {
  try {
    return await getMediaById(id);
  } catch {
    return null;
  }
}

export default async function EditMediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const media = await loadMedia(id);

  if (!media) {
    notFound();
  }

  const usage = await getMediaUsage(id);
  const boundAction = updateMediaAction.bind(null, id);
  const successMessage = query.created ? "Media added." : query.saved ? "Media saved." : null;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Edit Media"
        description={media.filename}
        action={<DeleteMediaForm id={id} filename={media.filename} />}
      />

      {successMessage && (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          {successMessage}{" "}
          <Link href="/admin/media" className="font-medium underline">
            Back to media →
          </Link>
        </p>
      )}

      <MediaForm
        mode="edit"
        action={boundAction}
        usage={usage}
        initialValues={{
          filename: media.filename,
          url: media.url,
          type: media.type,
          altText: media.altText ?? "",
        }}
      />
    </div>
  );
}
