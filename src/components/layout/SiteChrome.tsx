"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/**
 * The admin area gets its own navigation (AdminNav) and needs a clear
 * separation from the public site, so the public Header/Footer are skipped
 * for /admin/* — including /admin/login, which reads better as a standalone
 * screen anyway.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
