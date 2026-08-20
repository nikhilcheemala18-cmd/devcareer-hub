import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "About",
  description: `About ${env.siteName}.`,
};

export default function AboutPage() {
  return (
    <Container className="max-w-3xl py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        About {env.siteName}
      </h1>

      <div className="prose-content mt-6 flex flex-col gap-4 text-zinc-700 dark:text-zinc-300">
        <p>
          {env.siteName} is a publishing platform for software engineering jobs, interview
          preparation, system design, and developer knowledge. It exists to give developers,
          job seekers, and students a single place to find useful, practical resources for
          building a career in tech.
        </p>
        <p>
          The site is organized around three areas: job listings for software engineering,
          backend, frontend, and internship roles; interview preparation material covering
          languages, databases, and computer science fundamentals; and technical and career
          content, including system design write-ups, programming tutorials, and career
          guidance.
        </p>
        <p>
          Where job information originates from an external source, the goal is to add useful
          context and point readers to the official application destination rather than simply
          duplicate a listing.
        </p>
        <p>
          This site is under active development, and new content is added regularly. If you
          have feedback or a correction, see the{" "}
          <a href="/contact" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            Contact
          </a>{" "}
          page.
        </p>
      </div>
    </Container>
  );
}
