import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const mediaSchema = new Schema(
  {
    filename: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    size: { type: Number, required: true, min: 0 },
    altText: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type MediaDocument = InferSchemaType<typeof mediaSchema>;

export const Media: Model<MediaDocument> =
  models.Media ?? model<MediaDocument>("Media", mediaSchema);
