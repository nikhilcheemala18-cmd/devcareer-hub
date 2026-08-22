import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaForm } from "@/components/admin/MediaForm";
import { createMediaAction } from "@/app/admin/(dashboard)/media/actions";

export const metadata: Metadata = {
  title: "Add Media",
};

export const dynamic = "force-dynamic";

export default function NewMediaPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Add Media URL"
        description="Register an externally hosted image so it can be used as a featured image."
      />

      <MediaForm
        mode="create"
        action={createMediaAction}
        initialValues={{ filename: "", url: "", type: "image", altText: "" }}
      />
    </div>
  );
}
