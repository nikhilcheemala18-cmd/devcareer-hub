import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { Container } from "@/components/ui/Container";
import { env } from "@/lib/env";
import { LoginForm } from "./LoginForm";

// Outside the (dashboard) route group, so it doesn't inherit that layout's
// noindex default — set explicitly here instead.
export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/admin");
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{env.siteName}</p>
          <h1 className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Administrator sign in</h1>
        </div>

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <LoginForm />
        </div>
      </div>
    </Container>
  );
}
