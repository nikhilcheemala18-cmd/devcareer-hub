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

/** Returns the oldest admin user, used as the author for server-to-server automation drafts. */
export async function getFirstAdminUser() {
  await connectToDatabase();
  return User.findOne({ role: "ADMIN" }).sort({ createdAt: 1 });
}
