const MAX_EDGE = 2560;
const QUALITY = 0.85;
const SKIP_WEBP_BYTES = 500 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/webp" && file.size < SKIP_WEBP_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", QUALITY);
    });
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}

export async function uploadMedia(file: File, onProgress?: (label: string) => void) {
  const prepared = file.type.startsWith("video/")
    ? file
    : await compressImageFile(file);

  if (prepared.type.startsWith("video/") && prepared.size > MAX_VIDEO_BYTES) {
    throw new Error("Video must be 200MB or smaller");
  }

  onProgress?.(prepared.type.startsWith("image/") ? "Compressing…" : "Preparing…");

  const presign = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: prepared.name,
      contentType: prepared.type || "application/octet-stream",
      size: prepared.size,
    }),
  });
  if (!presign.ok) {
    const data = await presign.json().catch(() => null);
    throw new Error(data?.error || "Could not start upload");
  }

  const { uploadUrl, publicUrl } = await presign.json() as { uploadUrl: string; publicUrl: string };
  onProgress?.("Uploading…");

  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": prepared.type || "application/octet-stream" },
    body: prepared,
  });
  if (!put.ok) throw new Error("Upload to storage failed");

  return publicUrl as string;
}
