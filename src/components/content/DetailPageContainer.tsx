import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

/** Shared shell for all detail pages: a "back to listing" link plus a readable content column. */
export function DetailPageContainer({
  backHref,
  backLabel,
  children,
}: {
  backHref: string;
  backLabel: string;
  children: ReactNode;
}) {
  return (
    <Container className="max-w-3xl py-12">
      <Link
        href={backHref}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        ← {backLabel}
      </Link>

      <div className="mt-6 flex flex-col gap-8">{children}</div>
    </Container>
  );
}
