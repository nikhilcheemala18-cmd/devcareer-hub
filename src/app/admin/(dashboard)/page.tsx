import type { Metadata } from "next";
import Link from "next/link";
import { getPostCounts, getRecentPosts } from "@/lib/services/posts";
import { getJobCounts, getRecentJobs } from "@/lib/services/jobs";
import { getCategories } from "@/lib/services/categories";
import { buildIdMap, formatDate, formatEnumLabel } from "@/lib/format";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  tableWrapperClasses,
  tableClasses,
  tableHeadRowClasses,
  tableHeadCellClasses,
  tableRowClasses,
  tableCellClasses,
  buttonClasses,
} from "@/lib/styles";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [postCounts, jobCounts, recentPosts, recentJobs, categories] = await Promise.all([
    getPostCounts(),
    getJobCounts(),
    getRecentPosts(5),
    getRecentJobs(5),
    getCategories(),
  ]);

  const categoryNameById = buildIdMap(categories, "name");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Overview of published and draft content.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Posts</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <AdminStatCard label="Total" value={postCounts.total} />
          <AdminStatCard label="Published" value={postCounts.published} />
          <AdminStatCard label="Draft" value={postCounts.draft} />
          <AdminStatCard label="Archived" value={postCounts.archived} tone="muted" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Jobs</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <AdminStatCard label="Total" value={jobCounts.total} />
          <AdminStatCard label="Published" value={jobCounts.published} />
          <AdminStatCard label="Draft" value={jobCounts.draft} />
          <AdminStatCard label="Archived" value={jobCounts.archived} tone="muted" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Quick Actions</h2>
        <div className="flex flex-wrap items-start gap-3">
          <Link href="/admin/posts/new" className={buttonClasses("primary")}>
            New Post
          </Link>
          <Link href="/admin/jobs/new" className={buttonClasses("primary")}>
            New Job
          </Link>
          <Link href="/admin/posts" className={buttonClasses("secondary")}>
            Manage Posts
          </Link>
          <Link href="/admin/jobs" className={buttonClasses("secondary")}>
            Manage Jobs
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Recent Posts</h2>
          <Link href="/admin/posts" className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            View all →
          </Link>
        </div>
        {recentPosts.length > 0 ? (
          <div className={tableWrapperClasses}>
            <table className={tableClasses}>
              <thead>
                <tr className={tableHeadRowClasses}>
                  <th className={tableHeadCellClasses}>Title</th>
                  <th className={tableHeadCellClasses}>Type</th>
                  <th className={tableHeadCellClasses}>Category</th>
                  <th className={tableHeadCellClasses}>Status</th>
                  <th className={tableHeadCellClasses}>Updated</th>
                  <th className={tableHeadCellClasses}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post) => (
                  <tr key={String(post._id)} className={tableRowClasses}>
                    <td className={tableCellClasses}>{post.title}</td>
                    <td className={tableCellClasses}>{formatEnumLabel(post.type)}</td>
                    <td className={tableCellClasses}>
                      {post.category ? (categoryNameById.get(String(post.category)) ?? "—") : "—"}
                    </td>
                    <td className={tableCellClasses}>
                      <StatusBadge status={post.status} />
                    </td>
                    <td className={tableCellClasses}>{formatDate(post.updatedAt)}</td>
                    <td className={tableCellClasses}>
                      <Link
                        href={`/admin/posts/${String(post._id)}/edit`}
                        className="font-medium text-indigo-600 dark:text-indigo-400"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No posts yet." description="Posts will appear here once created." />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Recent Jobs</h2>
          <Link href="/admin/jobs" className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            View all →
          </Link>
        </div>
        {recentJobs.length > 0 ? (
          <div className={tableWrapperClasses}>
            <table className={tableClasses}>
              <thead>
                <tr className={tableHeadRowClasses}>
                  <th className={tableHeadCellClasses}>Title</th>
                  <th className={tableHeadCellClasses}>Company</th>
                  <th className={tableHeadCellClasses}>Status</th>
                  <th className={tableHeadCellClasses}>Updated</th>
                  <th className={tableHeadCellClasses}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => (
                  <tr key={String(job._id)} className={tableRowClasses}>
                    <td className={tableCellClasses}>{job.title}</td>
                    <td className={tableCellClasses}>{job.company}</td>
                    <td className={tableCellClasses}>
                      <StatusBadge status={job.status} />
                    </td>
                    <td className={tableCellClasses}>{formatDate(job.updatedAt)}</td>
                    <td className={tableCellClasses}>
                      <Link
                        href={`/admin/jobs/${String(job._id)}/edit`}
                        className="font-medium text-indigo-600 dark:text-indigo-400"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No jobs yet." description="Jobs will appear here once created." />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Website Shortcuts</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400">
            View Homepage ↗
          </Link>
          <Link href="/jobs" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400">
            View Jobs ↗
          </Link>
          <Link href="/blog" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400">
            View Blog ↗
          </Link>
        </div>
      </section>
    </div>
  );
}
