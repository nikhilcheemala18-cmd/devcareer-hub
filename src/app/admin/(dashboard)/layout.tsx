import { requireAdmin } from "@/lib/auth/auth";
import { AdminNav } from "@/components/admin/AdminNav";

/**
 * Protects every /admin/* route except /admin/login (which lives outside
 * this route group). requireAdmin() runs once here for the whole subtree —
 * individual admin pages don't need to call it again.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <AdminNav />
      <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
