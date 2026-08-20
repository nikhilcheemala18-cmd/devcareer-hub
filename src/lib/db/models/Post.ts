import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { POST_TYPES, CONTENT_STATUSES } from "@/lib/db/enums";
import { seoSchema } from "@/lib/db/schemas/seo";

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    type: { type: String, enum: POST_TYPES, required: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    featuredImage: { type: Schema.Types.ObjectId, ref: "Media" },
    seo: { type: seoSchema, default: {} },
    status: {
      type: String,
      enum: CONTENT_STATUSES,
      default: "DRAFT",
      required: true,
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

postSchema.index({ type: 1, status: 1, publishedAt: -1 });
postSchema.index({ category: 1 });
postSchema.index({ tags: 1 });

export type PostDocument = InferSchemaType<typeof postSchema>;

export const Post: Model<PostDocument> =
  models.Post ?? model<PostDocument>("Post", postSchema);
