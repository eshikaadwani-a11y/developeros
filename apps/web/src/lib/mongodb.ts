/**
 * Shared MongoClient promise for the NextAuth MongoDB adapter.
 * Reused across hot reloads in development and across serverless invocations.
 *
 * The connection (and the MONGODB_URI check) is deferred to first use rather
 * than evaluated at import time, so `next build` can analyze the module graph
 * without a database configured.
 */

import { MongoClient } from "mongodb";

const options = {};

declare global {
  // eslint-disable-next-line no-var
  var __developerosMongoClient: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Promise.reject(new Error("MONGODB_URI is not set"));
  }
  return new MongoClient(uri, options).connect();
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!globalThis.__developerosMongoClient) {
    globalThis.__developerosMongoClient = createClientPromise();
  }
  clientPromise = globalThis.__developerosMongoClient;
} else {
  clientPromise = createClientPromise();
}

export default clientPromise;
