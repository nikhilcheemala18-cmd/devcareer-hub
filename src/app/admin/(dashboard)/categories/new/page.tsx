import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { createCategoryAction } from "@/app/admin/(dashboard)/categories/actions";

export const metadata: Metadata = {
  title: "New Category",
};

export const dynamic = "force-dynamic";

export default function NewCategoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="New Category" description="Create a new content category." />

      <CategoryForm
        mode="create"
        action={createCategoryAction}
        initialValues={{ name: "", slug: "", description: "" }}
      />
    </div>
  );
}
