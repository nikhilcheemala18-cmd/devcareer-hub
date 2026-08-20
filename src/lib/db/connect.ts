import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cache;

/**
 * Returns a shared Mongoose connection, reusing it across hot reloads in
 * development and across invocations in serverless production so a new
 * connection is not opened per request.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("Missing required environment variable: MONGODB_URI");
    }

    cache.promise = mongoose.connect(uri).catch((error) => {
      cache.promise = null;
      throw error;
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
