import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const MAX_IMAGE_BYTES = 30 * 1024 * 1024;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${required("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: required("R2_ACCESS_KEY_ID"),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export function isAllowedUpload(contentType: string, size: number) {
  if (!ALLOWED_TYPES.has(contentType)) return false;
  if (contentType.startsWith("video/")) return size > 0 && size <= MAX_VIDEO_BYTES;
  return size > 0 && size <= MAX_IMAGE_BYTES;
}

export function publicAssetUrl(key: string) {
  const base = required("R2_PUBLIC_URL").replace(/\/$/, "");
  return `${base}/${key}`;
}

export async function presignUpload(key: string, contentType: string) {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: required("R2_BUCKET_NAME"),
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 * 5 });
  return { uploadUrl, publicUrl: publicAssetUrl(key), key };
}

export function uploadKey(filename: string, contentType: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const extFromName = safe.includes(".") ? safe.split(".").pop() : "";
  const extFromType = contentType.split("/")[1]?.replace("jpeg", "jpg").replace("quicktime", "mov");
  const ext = extFromName || extFromType || "bin";
  const prefix = contentType.startsWith("video/") ? "video" : "image";
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `uploads/${prefix}/${stamp}.${ext}`;
}
