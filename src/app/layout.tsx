import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { JsonLd } from "@/components/seo/JsonLd";
import { env } from "@/lib/env";
import { buildWebsiteJsonLd, buildOrganizationJsonLd } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_DESCRIPTION =
  "Find software engineering jobs, prepare for technical interviews, and learn system design and core programming concepts — all in one place.";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${env.siteName} — Jobs, Interview Preparation & Developer Resources`,
    template: `%s | ${env.siteName}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: env.siteName,
  keywords: [
    "software engineering jobs",
    "developer jobs",
    "interview preparation",
    "system design",
    "programming interview questions",
    "career guidance for developers",
  ],
  openGraph: {
    type: "website",
    siteName: env.siteName,
    title: env.siteName,
    description: SITE_DESCRIPTION,
    url: env.siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: env.siteName,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <JsonLd data={buildWebsiteJsonLd()} />
        <JsonLd data={buildOrganizationJsonLd()} />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
