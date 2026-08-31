import { MongoClient, type Db } from "mongodb";
import type { PostDocument, UserDocument } from "./types";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "blackspot";

type GlobalMongo = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  const globalWithMongo = globalThis as GlobalMongo;

  if (process.env.NODE_ENV === "development") {
    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    return globalWithMongo._mongoClientPromise;
  }

  return new MongoClient(uri).connect();
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}

export async function postsCollection() {
  const db = await getDb();
  return db.collection<PostDocument>("posts");
}

export async function usersCollection() {
  const db = await getDb();
  return db.collection<UserDocument>("users");
}
