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

// `category`/`featuredImage` accept `null` (not just omission) so the CMS can
// explicitly clear a single-value reference — an update payload that simply
// omits a key means "leave unchanged" (see updatePost's Object.assign), which
// can't express "the admin picked '— None —'" without this.
export const updatePostInputSchema = createPostInputSchema
  .omit({ author: true, category: true, featuredImage: true })
  .partial()
  .extend({
    category: objectIdStringSchema.nullable().optional(),
    featuredImage: objectIdStringSchema.nullable().optional(),
  });

export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
