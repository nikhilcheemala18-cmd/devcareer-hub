import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${env.siteName}.`,
};

export default function ContactPage() {
  return (
    <Container className="max-w-3xl py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Contact
      </h1>

      <div className="mt-6 flex flex-col gap-4 text-zinc-700 dark:text-zinc-300">
        <p>
          For questions, corrections to a job or article, or anything else, reach out by email:
        </p>
        <p>
          <a
            href={`mailto:${env.contactEmail}`}
            className="text-lg font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            {env.contactEmail}
          </a>
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          This address is placeholder configuration (
          <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">
            NEXT_PUBLIC_CONTACT_EMAIL
          </code>
          ) and should be set to a real inbox before launch.
        </p>
      </div>
    </Container>
  );
}
