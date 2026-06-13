/**
 * Cached Mongoose connection. In serverless environments (Vercel) the module
 * scope is reused across invocations, so we memoize the connection on
 * `globalThis` to avoid exhausting the connection pool.
 */

import mongoose from "mongoose";
import { getEnv } from "@developeros/shared";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __developerosMongoose: MongooseCache | undefined;
}

const cache: MongooseCache =
  globalThis.__developerosMongoose ?? { conn: null, promise: null };

globalThis.__developerosMongoose = cache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    const { MONGODB_URI } = getEnv();
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export async function disconnectFromDatabase(): Promise<void> {
  if (cache.conn) {
    await cache.conn.disconnect();
    cache.conn = null;
    cache.promise = null;
  }
}
