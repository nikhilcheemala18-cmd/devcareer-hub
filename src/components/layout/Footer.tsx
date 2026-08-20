import Link from "next/link";
import { env } from "@/lib/env";
import { Container } from "@/components/ui/Container";

const CONTENT_LINKS = [
  { label: "Jobs", href: "/jobs" },
  { label: "Interview Prep", href: "/interview-prep" },
  { label: "System Design", href: "/system-design" },
  { label: "Blog", href: "/blog" },
];

const LEGAL_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

function FooterNav({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{title}</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-2">
          <p className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{env.siteName}</p>
          <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Software engineering jobs, interview preparation, system design, and developer
            resources — published for people building their careers in tech.
          </p>
        </div>

        <FooterNav title="Explore" links={CONTENT_LINKS} />
        <FooterNav title="Site" links={LEGAL_LINKS} />
      </Container>

      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <Container className="py-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            © {year} {env.siteName}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
