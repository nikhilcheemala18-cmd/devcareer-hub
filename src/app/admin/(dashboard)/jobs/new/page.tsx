import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { JobForm } from "@/components/admin/JobForm";
import { createJobAction } from "@/app/admin/(dashboard)/jobs/actions";

export const metadata: Metadata = {
  title: "New Job",
};

export const dynamic = "force-dynamic";

export default function NewJobPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="New Job" description="Create a new job listing." />

      <JobForm
        mode="create"
        action={createJobAction}
        initialValues={{
          title: "",
          slug: "",
          company: "",
          location: "",
          experience: "",
          salary: "",
          employmentType: "FULL_TIME",
          description: "",
          requirements: [],
          applicationUrl: "",
          source: "",
          deadline: "",
          seoMetaTitle: "",
          seoMetaDescription: "",
          seoCanonicalUrl: "",
        }}
      />
    </div>
  );
}
