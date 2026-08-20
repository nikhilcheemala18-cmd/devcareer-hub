import { Schema } from "mongoose";

export interface Seo {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

export const seoSchema = new Schema<Seo>(
  {
    metaTitle: { type: String, trim: true, maxlength: 70 },
    metaDescription: { type: String, trim: true, maxlength: 160 },
    canonicalUrl: { type: String, trim: true },
  },
  { _id: false }
);
