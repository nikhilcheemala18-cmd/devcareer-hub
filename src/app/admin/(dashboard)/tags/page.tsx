import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteTagForm } from "@/components/admin/DeleteTagForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { getAllTags, getTagPostCounts } from "@/lib/services/tags";
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
  title: "Tags",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = firstValue(params.q) || undefined;
  const page = Math.max(1, Number(firstValue(params.page)) || 1);
  const deleted = params.deleted === "1";
  const deleteError = firstValue(params.deleteError);

  const [tags, postCounts] = await Promise.all([
    getAllTags({ search, page, limit: PAGE_SIZE }),
    getTagPostCounts(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Tags"
        description="Manage the tags used to organize posts. Jobs don't currently support tags."
        action={
          <Link href="/admin/tags/new" className={buttonClasses("primary")}>
            New Tag
          </Link>
        }
      />

      {deleted && (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Tag deleted.
        </p>
      )}
      {deleteError && (
        <p className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {deleteError}
        </p>
      )}

      <form action="/admin/tags" method="get" className="grid gap-3 sm:grid-cols-4">
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

      {tags.length > 0 ? (
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
              {tags.map((tag) => {
                const id = String(tag._id);
                return (
                  <tr key={id} className={tableRowClasses}>
                    <td className={tableCellClasses}>{tag.name}</td>
                    <td className={tableCellClasses}>
                      <code className="text-xs text-zinc-500 dark:text-zinc-400">{tag.slug}</code>
                    </td>
                    <td className={tableCellClasses}>{postCounts.get(id) ?? 0}</td>
                    <td className={tableCellClasses}>{formatDate(tag.updatedAt)}</td>
                    <td className={tableCellClasses}>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/tags/${id}/edit`}
                          className="font-medium text-indigo-600 dark:text-indigo-400"
                        >
                          Edit
                        </Link>
                        <DeleteTagForm id={id} name={tag.name} />
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
          title="No tags match these filters."
          description="Try clearing the search, or create a new tag."
        />
      )}

      <Pagination
        basePath="/admin/tags"
        currentPage={page}
        hasNextPage={tags.length === PAGE_SIZE}
        searchParams={{ q: search }}
      />
    </div>
  );
}
