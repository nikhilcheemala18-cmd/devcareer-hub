import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { EMPLOYMENT_TYPES, CONTENT_STATUSES } from "@/lib/db/enums";
import { seoSchema } from "@/lib/db/schemas/seo";

const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    experience: { type: String, trim: true },
    salary: { type: String, trim: true },
    employmentType: { type: String, enum: EMPLOYMENT_TYPES, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String, trim: true }],
    applicationUrl: { type: String, required: true, trim: true },
    source: { type: String, trim: true },
    deadline: { type: Date },
    featuredImage: { type: Schema.Types.ObjectId, ref: "Media" },
    seo: { type: seoSchema, default: {} },
    status: {
      type: String,
      enum: CONTENT_STATUSES,
      default: "DRAFT",
      required: true,
    },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, publishedAt: -1 });
jobSchema.index({ location: 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ company: 1 });

export type JobDocument = InferSchemaType<typeof jobSchema>;

export const Job: Model<JobDocument> =
  models.Job ?? model<JobDocument>("Job", jobSchema);
