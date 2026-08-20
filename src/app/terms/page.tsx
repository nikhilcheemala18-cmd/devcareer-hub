import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms & Conditions for ${env.siteName}.`,
};

export default function TermsPage() {
  return (
    <Container className="max-w-3xl py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Terms &amp; Conditions
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Last updated: [date]</p>

      <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        This is template content and should be reviewed by a legal professional and customized
        for your jurisdiction before this site goes live.
      </div>

      <div className="mt-6 flex flex-col gap-6 text-zinc-700 dark:text-zinc-300">
        <section>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Acceptance of Terms
          </h2>
          <p className="mt-2">
            By accessing and using {env.siteName}, you agree to these Terms &amp; Conditions. If
            you do not agree, please do not use the site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Use of the Site</h2>
          <p className="mt-2">
            Content on this site, including articles, interview preparation material, and job
            listings, is provided for general informational purposes. No account is required to
            browse the site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Job Listings and External Sources
          </h2>
          <p className="mt-2">
            Some job listings may be sourced from external websites or employers. Where this is
            the case, we aim to identify the source and link to the official application
            destination rather than operate as a mirror of that source. We make a reasonable
            effort to keep listings accurate and current, but we cannot guarantee that every
            listing is up to date, and applicants should verify details on the employer&apos;s
            official page before applying. Applying to a job through an external link is subject
            to that employer&apos;s or platform&apos;s own terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Intellectual Property
          </h2>
          <p className="mt-2">
            Original articles and content published on this site are the property of{" "}
            {env.siteName} unless otherwise noted. Job listings and any quoted material remain
            the property of their respective sources.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Disclaimer</h2>
          <p className="mt-2">
            Content is provided &ldquo;as is&rdquo; without warranties of any kind. Technical
            and career guidance on this site is general in nature and should not be treated as
            professional advice specific to your situation.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Limitation of Liability
          </h2>
          <p className="mt-2">
            To the extent permitted by law, {env.siteName} is not liable for any indirect or
            consequential loss arising from use of the site or reliance on its content,
            including job listings sourced from third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Changes to These Terms
          </h2>
          <p className="mt-2">
            These terms may be updated as the site evolves. Continued use of the site after
            changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Contact</h2>
          <p className="mt-2">
            Questions about these terms can be sent to the address on the{" "}
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
