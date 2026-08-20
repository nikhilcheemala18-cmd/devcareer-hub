import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/auth";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/lib/styles";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
};

export const dynamic = "force-dynamic";

/**
 * Minimal placeholder to verify authentication end-to-end. The real admin
 * dashboard (content/job/category/tag/media management) is a later phase.
 */
export default async function AdminHomePage() {
  await requireAdmin();

  return (
    <Container className="py-12">
      <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Admin</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        You are signed in as an administrator. The content dashboard is not built yet.
      </p>

      <form action={logout} className="mt-6">
        <button type="submit" className={buttonClasses("secondary")}>
          Log out
        </button>
      </form>
    </Container>
  );
}
