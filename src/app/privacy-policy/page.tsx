import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { env } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `Privacy Policy for ${env.siteName}.`,
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <Container className="max-w-3xl py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Last updated: [date]</p>

      <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        This is template content and should be reviewed by a legal professional and customized
        for your jurisdiction, your actual data practices, and any advertising or analytics
        tools you use, before this site goes live.
      </div>

      <div className="mt-6 flex flex-col gap-6 text-zinc-700 dark:text-zinc-300">
        <section>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Information We Collect
          </h2>
          <p className="mt-2">
            {env.siteName} does not require an account to browse content, jobs, or articles. We
            may collect basic technical information automatically, such as pages visited,
            browser type, and approximate location, typically through server logs or analytics
            tools.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Cookies and Similar Technologies
          </h2>
          <p className="mt-2">
            This site may use cookies or similar technologies for essential site functionality
            and, in the future, for analytics or advertising. If and when analytics or
            advertising services (such as Google Analytics or Google AdSense) are enabled, this
            policy will be updated to describe what they collect and how to opt out.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Third-Party Services and Advertising
          </h2>
          <p className="mt-2">
            This site may in the future display advertising through third-party services, such
            as Google AdSense, and may use third-party analytics. These services may use cookies
            or similar technologies to serve relevant content and measure performance. Any such
            integration will be disclosed here before it goes live.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            External Links
          </h2>
          <p className="mt-2">
            Job listings and articles may link to external websites, including employer
            application pages. We are not responsible for the privacy practices of external
            sites.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Changes to This Policy
          </h2>
          <p className="mt-2">
            This policy may be updated as the site evolves. Material changes will be reflected
            on this page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Contact</h2>
          <p className="mt-2">
            Questions about this policy can be sent to the address on the{" "}
            <a href="/contact" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              Contact
            </a>{" "}
            page.
          </p>
        </section>
      </div>
    </Container>
  );
}
