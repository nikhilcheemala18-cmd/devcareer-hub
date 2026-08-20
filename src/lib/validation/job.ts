import { z } from "zod";
import { EMPLOYMENT_TYPES, CONTENT_STATUSES } from "@/lib/db/enums";
import { slugSchema, urlSchema, seoInputSchema, objectIdStringSchema } from "@/lib/validation/shared";

export const createJobInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  slug: slugSchema,
  company: z.string().trim().min(1, "Company is required.").max(200),
  location: z.string().trim().min(1, "Location is required.").max(200),
  experience: z.string().trim().max(100).optional(),
  salary: z.string().trim().max(100).optional(),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  description: z.string().trim().min(1, "Description is required."),
  requirements: z.array(z.string().trim().min(1)).optional(),
  applicationUrl: urlSchema,
  source: z.string().trim().max(200).optional(),
  deadline: z.coerce.date().optional(),
  featuredImage: objectIdStringSchema.optional(),
  seo: seoInputSchema,
  status: z.enum(CONTENT_STATUSES).optional(),
});

export type CreateJobInput = z.infer<typeof createJobInputSchema>;

export const updateJobInputSchema = createJobInputSchema.partial();

export type UpdateJobInput = z.infer<typeof updateJobInputSchema>;
