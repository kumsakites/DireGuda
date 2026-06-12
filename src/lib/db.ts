import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

export async function connectDB() {
  if (!global._mongoose) global._mongoose = { conn: null, promise: null };
  const cache = global._mongoose;

  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null;
    throw e;
  }
  return cache.conn;
}
