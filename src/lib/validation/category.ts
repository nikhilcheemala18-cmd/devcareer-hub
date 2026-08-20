import { z } from "zod";
import { slugSchema } from "@/lib/validation/shared";

export const createCategoryInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  slug: slugSchema,
  description: z.string().trim().max(500).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

export const updateCategoryInputSchema = createCategoryInputSchema.partial();

export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;
