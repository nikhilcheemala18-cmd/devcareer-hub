import { z } from "zod";
import { POST_TYPES, CONTENT_STATUSES } from "@/lib/db/enums";
import { slugSchema, seoInputSchema, objectIdStringSchema } from "@/lib/validation/shared";

export const createPostInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  slug: slugSchema,
  type: z.enum(POST_TYPES),
  excerpt: z.string().trim().max(500).optional(),
  content: z.string().trim().min(1, "Content is required."),
  category: objectIdStringSchema.optional(),
  tags: z.array(objectIdStringSchema).optional(),
  featuredImage: objectIdStringSchema.optional(),
  seo: seoInputSchema,
  status: z.enum(CONTENT_STATUSES).optional(),
  author: objectIdStringSchema,
});

export type CreatePostInput = z.infer<typeof createPostInputSchema>;

export const updatePostInputSchema = createPostInputSchema
  .omit({ author: true })
  .partial();

export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
