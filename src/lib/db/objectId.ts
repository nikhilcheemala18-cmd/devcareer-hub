import mongoose from "mongoose";
import { InvalidIdError } from "@/lib/errors";

export function assertValidObjectId(id: string): void {
  if (!mongoose.isValidObjectId(id)) {
    throw new InvalidIdError(id);
  }
}
