import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hash } from "bcryptjs";
import { MongoClient } from "mongodb";
import { seedPosts } from "./seed-content";
import type { PostDocument, UserDocument } from "../app/lib/types";


function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(resolve(".env.local"));
loadEnvFile(resolve(".env"));

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the admin user");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "blackspot");
  const users = db.collection<UserDocument>("users");
  const posts = db.collection<PostDocument>("posts");

  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ inviteTokenHash: 1 }, { sparse: true });
  await posts.createIndex({ slug: 1 }, { unique: true });
  await posts.createIndex({ kind: 1, status: 1 });

  const existingUser = await users.findOne({ email: email.toLowerCase() });
  if (!existingUser) {
    await users.insertOne({
      email: email.toLowerCase(),
      passwordHash: await hash(password, 12),
      name: "Blackspot Owner",
      position: "Owner",
      role: "super_admin",
      permissions: [],
      status: "active",
      createdAt: new Date(),
    });
    console.log(`Created super admin ${email}`);
  } else {
    await users.updateOne(
      { _id: existingUser._id },
      { $set: { role: "super_admin", status: "active", updatedAt: new Date() } },
    );
    console.log(`Ensured super admin access for ${email}`);
  }

  let created = 0;
  for (const post of seedPosts) {
    const found = await posts.findOne({ slug: post.slug });
    if (found) continue;
    const now = new Date();
    const publishedAt = post.publishedAt ? new Date(post.publishedAt) : now;
    await posts.insertOne({
      kind: post.kind,
      status: post.status,
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      cover: post.cover,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      category: post.category,
      body: post.body,
      read: post.read,
      client: post.client,
      type: post.type,
      year: post.year,
      services: post.services,
      images: post.images,
      video: post.video,
      challenge: post.challenge,
      solution: post.solution,
      outcome: post.outcome,
      createdAt: publishedAt,
      updatedAt: now,
      publishedAt: post.status === "published" ? publishedAt : undefined,
    });
    created += 1;
  }

  console.log(`Seeded ${created} posts (${seedPosts.length - created} already present)`);
  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
