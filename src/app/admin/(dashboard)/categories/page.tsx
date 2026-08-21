import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCategories, getCategoryPostCounts } from "@/lib/services/categories";
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
  title: "Categories",
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, postCounts] = await Promise.all([getCategories(), getCategoryPostCounts()]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Categories"
        description="Category management is coming in a later phase — this is a read-only view."
      />

      {categories.length > 0 ? (
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
              {categories.map((category) => (
                <tr key={String(category._id)} className={tableRowClasses}>
                  <td className={tableCellClasses}>{category.name}</td>
                  <td className={tableCellClasses}>
                    <code className="text-xs text-zinc-500 dark:text-zinc-400">{category.slug}</code>
                  </td>
                  <td className={tableCellClasses}>{postCounts.get(String(category._id)) ?? 0}</td>
                  <td className={tableCellClasses}>{formatDate(category.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No categories yet."
          description="Categories will appear here once created."
        />
      )}
    </div>
  );
}
