import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Media",
};

export default function AdminMediaPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Media" description="Manage images used across posts and jobs." />

      <EmptyState
        title="Media management isn't available yet."
        description="Uploading and browsing media will be added in a later phase, once a storage provider is configured."
      />
    </div>
  );
}
