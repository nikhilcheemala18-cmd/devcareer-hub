import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteCategoryForm } from "@/components/admin/DeleteCategoryForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { getAllCategories, getCategoryPostCounts } from "@/lib/services/categories";
import { formatDate } from "@/lib/format";
import {
  inputClasses,
  buttonClasses,
  cn,
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

const PAGE_SIZE = 20;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = firstValue(params.q) || undefined;
  const page = Math.max(1, Number(firstValue(params.page)) || 1);
  const deleted = params.deleted === "1";
  const deleteError = firstValue(params.deleteError);

  const [categories, postCounts] = await Promise.all([
    getAllCategories({ search, page, limit: PAGE_SIZE }),
    getCategoryPostCounts(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Categories"
        description="Manage the categories used to organize posts. Jobs don't currently support categories."
        action={
          <Link href="/admin/categories/new" className={buttonClasses("primary")}>
            New Category
          </Link>
        }
      />

      {deleted && (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Category deleted.
        </p>
      )}
      {deleteError && (
        <p className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {deleteError}
        </p>
      )}

      <form
        action="/admin/categories"
        method="get"
        className="grid gap-3 sm:grid-cols-4"
      >
        <div className="sm:col-span-2">
          <label htmlFor="q" className="sr-only">
            Search by name
          </label>
          <input
            id="q"
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Search by name"
            className={inputClasses}
          />
        </div>
        <button type="submit" className={cn(buttonClasses("secondary"), "w-fit")}>
          Search
        </button>
      </form>

      {categories.length > 0 ? (
        <div className={tableWrapperClasses}>
          <table className={tableClasses}>
            <thead>
              <tr className={tableHeadRowClasses}>
                <th className={tableHeadCellClasses}>Name</th>
                <th className={tableHeadCellClasses}>Slug</th>
                <th className={tableHeadCellClasses}>Posts</th>
                <th className={tableHeadCellClasses}>Updated</th>
                <th className={tableHeadCellClasses}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const id = String(category._id);
                return (
                  <tr key={id} className={tableRowClasses}>
                    <td className={tableCellClasses}>{category.name}</td>
                    <td className={tableCellClasses}>
                      <code className="text-xs text-zinc-500 dark:text-zinc-400">{category.slug}</code>
                    </td>
                    <td className={tableCellClasses}>{postCounts.get(id) ?? 0}</td>
                    <td className={tableCellClasses}>{formatDate(category.updatedAt)}</td>
                    <td className={tableCellClasses}>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/categories/${id}/edit`}
                          className="font-medium text-indigo-600 dark:text-indigo-400"
                        >
                          Edit
                        </Link>
                        <DeleteCategoryForm id={id} name={category.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No categories match these filters."
          description="Try clearing the search, or create a new category."
        />
      )}

      <Pagination
        basePath="/admin/categories"
        currentPage={page}
        hasNextPage={categories.length === PAGE_SIZE}
        searchParams={{ q: search }}
      />
    </div>
  );
}
