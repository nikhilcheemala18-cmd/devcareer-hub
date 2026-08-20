import { z } from "zod";
import { slugSchema } from "@/lib/validation/shared";

export const createTagInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(50),
  slug: slugSchema,
});

export type CreateTagInput = z.infer<typeof createTagInputSchema>;

export const updateTagInputSchema = createTagInputSchema.partial();

export type UpdateTagInput = z.infer<typeof updateTagInputSchema>;
