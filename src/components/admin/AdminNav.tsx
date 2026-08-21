"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { env } from "@/lib/env";
import { cn } from "@/lib/styles";
import { logout } from "@/app/admin/actions";

const NAV_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Posts", href: "/admin/posts" },
  { label: "Jobs", href: "/admin/jobs" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Tags", href: "/admin/tags" },
  { label: "Media", href: "/admin/media" },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <ul className="flex flex-col gap-1">
      {NAV_LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              )}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function FooterLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-1 border-t border-zinc-200 pt-3 dark:border-zinc-800">
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
      >
        View Website ↗
      </Link>
      <form action={logout}>
        <button
          type="submit"
          className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
        >
          Log out
        </button>
      </form>
    </div>
  );
}

export function AdminNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-zinc-200 md:flex md:flex-col md:gap-4 md:p-4 dark:border-zinc-800">
        <Link href="/admin" className="px-3 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {env.siteName}
        </Link>
        <NavLinks pathname={pathname} />
        <div className="mt-auto">
          <FooterLinks />
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:hidden dark:border-zinc-800 dark:bg-black">
        <Link href="/admin" className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {env.siteName}
        </Link>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          aria-label="Toggle admin menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isMenuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </header>

      {isMenuOpen && (
        <nav className="border-b border-zinc-200 px-4 py-3 md:hidden dark:border-zinc-800">
          <NavLinks pathname={pathname} onNavigate={() => setIsMenuOpen(false)} />
          <div className="mt-3">
            <FooterLinks onNavigate={() => setIsMenuOpen(false)} />
          </div>
        </nav>
      )}
    </>
  );
}
