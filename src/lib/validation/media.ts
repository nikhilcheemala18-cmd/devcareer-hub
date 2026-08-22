import { z } from "zod";
import { urlSchema } from "@/lib/validation/shared";

export const createMediaInputSchema = z.object({
  filename: z.string().trim().min(1, "Filename is required.").max(200),
  url: urlSchema,
  type: z.string().trim().min(1, "Type is required.").max(50),
  altText: z.string().trim().max(300).optional(),
});

export type CreateMediaInput = z.infer<typeof createMediaInputSchema>;

export const updateMediaInputSchema = createMediaInputSchema.partial();

export type UpdateMediaInput = z.infer<typeof updateMediaInputSchema>;
