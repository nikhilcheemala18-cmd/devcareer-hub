import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { assertValidObjectId } from "@/lib/db/objectId";

/** passwordHash is excluded by default (schema field has `select: false`). */
export async function getUserById(id: string) {
  assertValidObjectId(id);
  await connectToDatabase();
  return User.findById(id);
}
