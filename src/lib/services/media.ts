import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { Media } from "@/lib/db/models/Media";
import { assertValidObjectId } from "@/lib/db/objectId";

export async function getMediaById(id: string) {
  assertValidObjectId(id);
  await connectToDatabase();
  return Media.findById(id);
}
