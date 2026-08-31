import { revalidatePath } from "next/cache";
import type { Post } from "./types";

export function revalidateContent(post: Pick<Post, "kind" | "slug">) {
  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/blog");
  if (post.kind === "proof") revalidatePath(`/work/${post.slug}`);
  if (post.kind === "blog") revalidatePath(`/blog/${post.slug}`);
}
