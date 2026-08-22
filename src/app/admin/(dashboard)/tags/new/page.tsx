import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TagForm } from "@/components/admin/TagForm";
import { createTagAction } from "@/app/admin/(dashboard)/tags/actions";

export const metadata: Metadata = {
  title: "New Tag",
};

export const dynamic = "force-dynamic";

export default function NewTagPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="New Tag" description="Create a new content tag." />

      <TagForm mode="create" action={createTagAction} initialValues={{ name: "", slug: "" }} />
    </div>
  );
}
