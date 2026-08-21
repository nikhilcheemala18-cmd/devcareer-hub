import { z } from "zod";
import { ValidationError } from "@/lib/errors";

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required.")
  .max(200, "Slug must be 200 characters or fewer.")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Slug must contain only lowercase letters, numbers, and hyphens."
  );

// zod's .url() only checks URL syntax — "javascript:alert(1)" and "data:..."
// parse as valid URLs. Restricting to http(s) closes that off for every
// caller (Post canonical URLs, Job application/source URLs) in one place.
const SAFE_URL_PROTOCOLS = new Set(["http:", "https:"]);

export const urlSchema = z
  .string()
  .trim()
  .url("Must be a valid URL.")
  .refine((value) => {
    try {
      return SAFE_URL_PROTOCOLS.has(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "URL must start with http:// or https://.");

export const objectIdStringSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{24}$/i, "Invalid id.");

export const seoInputSchema = z
  .object({
    metaTitle: z.string().trim().max(70).optional(),
    metaDescription: z.string().trim().max(160).optional(),
    canonicalUrl: urlSchema.optional(),
  })
  .optional();

/**
 * Parses `input` against `schema`, throwing a ValidationError with a
 * readable message instead of a raw ZodError when it doesn't match.
 */
export function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => (issue.path.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message))
      .join("; ");
    throw new ValidationError(message);
  }

  return result.data;
}
