import { buttonClasses } from "@/lib/styles";

/** Only renders for well-formed http(s) URLs — defense in depth on top of the create/update-time URL validation. */
export function ApplyButton({ applicationUrl }: { applicationUrl: string }) {
  let safeUrl: string | null = null;

  try {
    const parsed = new URL(applicationUrl);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      safeUrl = parsed.toString();
    }
  } catch {
    safeUrl = null;
  }

  if (!safeUrl) {
    return null;
  }

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={buttonClasses("primary")}
    >
      Apply Now →
    </a>
  );
}
