import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * /search is deliberately NOT disallowed here — it's kept crawlable so
 * Googlebot can read its noindex meta tag (see search/page.tsx). Disallowing
 * it in robots.txt would block that tag from ever being seen, which can
 * paradoxically leave a bare URL indexed with no snippet. /admin/ has no such
 * concern (it's auth-gated and noindex'd everywhere already), so disallowing
 * it here is pure extra friction, not the only line of defense.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
