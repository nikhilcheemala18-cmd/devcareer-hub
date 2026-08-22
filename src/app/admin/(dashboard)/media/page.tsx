import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteMediaForm } from "@/components/admin/DeleteMediaForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { getMedia, getMediaUsageCounts } from "@/lib/services/media";
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
  title: "Media",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = firstValue(params.q) || undefined;
  const page = Math.max(1, Number(firstValue(params.page)) || 1);
  const deleted = params.deleted === "1";
  const deleteError = firstValue(params.deleteError);

  const [media, usageCounts] = await Promise.all([
    getMedia({ search, page, limit: PAGE_SIZE }),
    getMediaUsageCounts(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Media"
        description="Manage media records used as featured images across posts and jobs."
        action={
          <Link href="/admin/media/new" className={buttonClasses("primary")}>
            Add Media URL
          </Link>
        }
      />

      <p className="rounded-md border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No storage provider is configured yet, so files aren&apos;t uploaded here — this manages
        records pointing at externally hosted URLs. A provider (e.g. Cloudinary, S3, R2) can be added
        later without changing this page.
      </p>

      {deleted && (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Media deleted.
        </p>
      )}
      {deleteError && (
        <p className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {deleteError}
        </p>
      )}

      <form action="/admin/media" method="get" className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="q" className="sr-only">
            Search by filename or alt text
          </label>
          <input
            id="q"
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Search by filename or alt text"
            className={inputClasses}
          />
        </div>
        <button type="submit" className={cn(buttonClasses("secondary"), "w-fit")}>
          Search
        </button>
      </form>

      {media.length > 0 ? (
        <div className={tableWrapperClasses}>
          <table className={tableClasses}>
            <thead>
              <tr className={tableHeadRowClasses}>
                <th className={tableHeadCellClasses}>Preview</th>
                <th className={tableHeadCellClasses}>Filename</th>
                <th className={tableHeadCellClasses}>Type</th>
                <th className={tableHeadCellClasses}>Alt Text</th>
                <th className={tableHeadCellClasses}>Usage</th>
                <th className={tableHeadCellClasses}>Added</th>
                <th className={tableHeadCellClasses}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {media.map((item) => {
                const id = String(item._id);
                const usage = usageCounts.get(id) ?? { posts: 0, jobs: 0 };
                return (
                  <tr key={id} className={tableRowClasses}>
                    <td className={tableCellClasses}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary external URL, no storage/CDN provider configured */}
                      <img
                        src={item.url}
                        alt={item.altText ?? ""}
                        className="h-12 w-12 rounded object-cover"
                      />
                    </td>
                    <td className={cn(tableCellClasses, "max-w-xs truncate")}>{item.filename}</td>
                    <td className={tableCellClasses}>{item.type}</td>
                    <td className={cn(tableCellClasses, "max-w-xs truncate")}>{item.altText || "—"}</td>
                    <td className={tableCellClasses}>
                      {usage.posts} post{usage.posts === 1 ? "" : "s"}, {usage.jobs} job
                      {usage.jobs === 1 ? "" : "s"}
                    </td>
                    <td className={tableCellClasses}>{formatDate(item.createdAt)}</td>
                    <td className={tableCellClasses}>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/media/${id}/edit`}
                          className="font-medium text-indigo-600 dark:text-indigo-400"
                        >
                          Edit
                        </Link>
                        <DeleteMediaForm id={id} filename={item.filename} />
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
          title="No media records yet."
          description="Add a media URL to make it available as a featured image for posts and jobs."
        />
      )}

      <Pagination
        basePath="/admin/media"
        currentPage={page}
        hasNextPage={media.length === PAGE_SIZE}
        searchParams={{ q: search }}
      />
    </div>
  );
}
