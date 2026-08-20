import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { USER_ROLES } from "@/lib/db/enums";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: "ADMIN", required: true },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const User: Model<UserDocument> =
  models.User ?? model<UserDocument>("User", userSchema);
