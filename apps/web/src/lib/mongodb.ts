/**
 * Shared MongoClient promise for the NextAuth MongoDB adapter.
 * Reused across hot reloads in development and across serverless invocations.
 */

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set");
}

const options = {};

let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var __developerosMongoClient: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!globalThis.__developerosMongoClient) {
    globalThis.__developerosMongoClient = new MongoClient(uri, options).connect();
  }
  clientPromise = globalThis.__developerosMongoClient;
} else {
  clientPromise = new MongoClient(uri, options).connect();
}

export default clientPromise;
