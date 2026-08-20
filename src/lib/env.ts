/**
 * Centralized access to environment variables.
 * Keeps env var names in one place and fails fast if a required value is missing.
 */

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  siteName: getEnv(
    "NEXT_PUBLIC_SITE_NAME",
    "Developer Jobs & Knowledge Publishing Platform"
  ),
  siteUrl: getEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000"),
  contactEmail: getEnv("NEXT_PUBLIC_CONTACT_EMAIL", "contact@yourdomain.com"),
};
