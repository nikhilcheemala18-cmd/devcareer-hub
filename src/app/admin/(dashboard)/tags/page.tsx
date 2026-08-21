import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { getTags, getTagPostCounts } from "@/lib/services/tags";
import { formatDate } from "@/lib/format";
import {
  tableWrapperClasses,
  tableClasses,
  tableHeadRowClasses,
  tableHeadCellClasses,
  tableRowClasses,
  tableCellClasses,
} from "@/lib/styles";

export const metadata: Metadata = {
  title: "Tags",
};

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const [tags, postCounts] = await Promise.all([getTags(), getTagPostCounts()]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Tags"
        description="Tag management is coming in a later phase — this is a read-only view."
      />

      {tags.length > 0 ? (
        <div className={tableWrapperClasses}>
          <table className={tableClasses}>
            <thead>
              <tr className={tableHeadRowClasses}>
                <th className={tableHeadCellClasses}>Name</th>
                <th className={tableHeadCellClasses}>Slug</th>
                <th className={tableHeadCellClasses}>Posts</th>
                <th className={tableHeadCellClasses}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={String(tag._id)} className={tableRowClasses}>
                  <td className={tableCellClasses}>{tag.name}</td>
                  <td className={tableCellClasses}>
                    <code className="text-xs text-zinc-500 dark:text-zinc-400">{tag.slug}</code>
                  </td>
                  <td className={tableCellClasses}>{postCounts.get(String(tag._id)) ?? 0}</td>
                  <td className={tableCellClasses}>{formatDate(tag.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No tags yet." description="Tags will appear here once created." />
      )}
    </div>
  );
}
