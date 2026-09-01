"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toEditorHtml } from "../../lib/article-body";
import { slugify } from "../../lib/format";
import type { Post, PostKind, ProjectType } from "../../lib/types";
import { uploadMedia } from "../../lib/upload-client";
import { ConfirmDelete } from "../components/ConfirmDelete";
import { DeleteIcon } from "../components/DeleteIcon";
import { useToast } from "../components/ToastProvider";
import { BodyEditor } from "./BodyEditor";

const proofTypes: { id: ProjectType; name: string; copy: string }[] = [
  { id: "image", name: "Single image", copy: "One strong visual with context" },
  { id: "video", name: "Video", copy: "One film or motion piece" },
  { id: "gallery", name: "Image gallery", copy: "A collection of related visuals" },
  { id: "case-study", name: "Full case study", copy: "Challenge, solution and outcomes" },
];

type EditorState = {
  kind: PostKind;
  status: Post["status"];
  title: string;
  slug: string;
  summary: string;
  cover: string;
  seoTitle: string;
  seoDescription: string;
  category: string;
  body: string;
  read: string;
  client: string;
  type: ProjectType;
  year: string;
  services: string;
  images: string[];
  video: string;
  challenge: string;
  solution: string;
  outcome: string;
};

function fromPost(post: Post | null, defaultKind: PostKind): EditorState {
  return {
    kind: post?.kind || defaultKind,
    status: post?.status || "draft",
    title: post?.title || "",
    slug: post?.slug || "",
    summary: post?.summary || "",
    cover: post?.cover || "",
    seoTitle: post?.seoTitle || "",
    seoDescription: post?.seoDescription || "",
    category: post?.category || "",
    body: toEditorHtml(post?.body || ""),
    read: post?.read || "",
    client: post?.client || "",
    type: post?.type || "case-study",
    year: post?.year || String(new Date().getFullYear()),
    services: (post?.services || []).join(", "),
    images: post?.images || [],
    video: post?.video || "",
    challenge: post?.challenge || "",
    solution: post?.solution || "",
    outcome: post?.outcome || "",
  };
}

function payloadFromState(state: EditorState, status: Post["status"]) {
  return {
    ...state,
    status,
    services: state.services,
    images: state.images,
  };
}

export function PostEditor({
  initial,
  defaultKind,
  canPublish,
  canDelete,
}: {
  initial: Post | null;
  defaultKind: PostKind;
  canPublish: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [state, setState] = useState<EditorState>(() => fromPost(initial, defaultKind));
  const [postId, setPostId] = useState(initial?._id || "");
  const [slugLocked, setSlugLocked] = useState(Boolean(initial?.slug));
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadLabel, setUploadLabel] = useState("");
  const coverInput = useRef<HTMLInputElement>(null);
  const extraInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  function update<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  function onTitle(value: string) {
    setState((current) => ({
      ...current,
      title: value,
      slug: slugLocked ? current.slug : slugify(value),
    }));
  }

  async function save(status: "draft" | "published") {
    setSaving(status);
    const response = await fetch(postId ? `/api/posts/${postId}` : "/api/posts", {
      method: postId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadFromState(state, status)),
    });
    const data = await response.json().catch(() => null);
    setSaving(null);
    if (!response.ok) {
      toast.error(data?.error || "Could not save");
      return;
    }
    toast.success(status === "published" ? "Published" : "Draft saved");
    if (data?.post?._id && data.post._id !== postId) {
      setPostId(data.post._id);
      router.replace(`/admin/new?id=${data.post._id}`);
    }
  }

  async function remove() {
    if (!postId) return;
    setDeleting(true);
    const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setDeleting(false);
    if (!response.ok) {
      toast.error("Could not delete");
      return;
    }
    toast.success("Deleted");
    router.push("/admin");
  }

  async function handleFiles(files: FileList | null, target: "cover" | "images" | "video") {
    if (!files?.length) return;
    try {
      for (const file of Array.from(files)) {
        const url = await uploadMedia(file, setUploadLabel);
        if (target === "cover") update("cover", url);
        if (target === "video") update("video", url);
        if (target === "images") {
          setState((current) => ({
            ...current,
            images: [...current.images, url],
            cover: current.cover || url,
          }));
        }
      }
      setUploadLabel("");
    } catch (err) {
      setUploadLabel("");
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  function onFile(event: ChangeEvent<HTMLInputElement>, target: "cover" | "images" | "video") {
    void handleFiles(event.target.files, target);
    event.target.value = "";
  }

  const showGallery = state.kind === "proof" && (state.type === "gallery" || state.type === "case-study");
  const showVideo = state.kind === "proof" && state.type === "video";
  const extraHint = useMemo(() => {
    if (uploadLabel) return uploadLabel;
    if (showVideo) return "Images compress to WebP on upload. Videos upload as-is.";
    return "Images are resized to 2560px and saved as WebP before they reach storage.";
  }, [showVideo, uploadLabel]);

  return (
    <div className="editorPage">
      <header className="editorBar">
        <a href="/admin">← Content</a>
        <div>
          {postId && canDelete ? (
            <button
              className="deleteBarBtn"
              onClick={() => setConfirmingDelete(true)}
              disabled={Boolean(saving) || deleting}
              type="button"
              aria-label="Delete post"
            >
              <DeleteIcon />
            </button>
          ) : null}
          <button onClick={() => void save("draft")} disabled={Boolean(saving) || deleting} type="button">
            {saving === "draft" ? "Saving…" : "Save draft"}
          </button>
          {canPublish ? (
            <button className="publishBtn" onClick={() => void save("published")} disabled={Boolean(saving) || deleting} type="button">
              {saving === "published" ? "Publishing…" : "Publish"}
            </button>
          ) : null}
        </div>
      </header>
      <main className="editorMain">
        <div className="editorTitle">
          <p className="sectionLabel">{postId ? "Edit post" : "Create post"}</p>
          <h1>{postId ? "Edit content" : "New content"}</h1>
          <div className="kindSwitch">
            <button className={state.kind === "blog" ? "active" : undefined} onClick={() => update("kind", "blog")} type="button">Blog post</button>
            <button className={state.kind === "proof" ? "active" : undefined} onClick={() => update("kind", "proof")} type="button">Proof of work</button>
          </div>
        </div>

        {state.kind === "proof" && (
          <section className="editorSection">
            <label>Presentation format</label>
            <div className="formatGrid">
              {proofTypes.map((item) => (
                <button key={item.id} className={state.type === item.id ? "active" : undefined} onClick={() => update("type", item.id)} type="button">
                  <i>{state.type === item.id ? "✓" : ""}</i>
                  <b>{item.name}</b>
                  <small>{item.copy}</small>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="editorSection formGrid">
          <label>Post details</label>
          <div>
            <div className="field">
              <span>Title</span>
              <input value={state.title} onChange={(event) => onTitle(event.target.value)} />
            </div>
            <div className="fieldSplit">
              <div className="field">
                <span>{state.kind === "blog" ? "Category" : "Client"}</span>
                <input
                  value={state.kind === "blog" ? state.category : state.client}
                  onChange={(event) => update(state.kind === "blog" ? "category" : "client", event.target.value)}
                />
              </div>
              <div className="field">
                <span>Slug</span>
                <input
                  value={state.slug}
                  onChange={(event) => {
                    setSlugLocked(true);
                    update("slug", slugify(event.target.value));
                  }}
                />
              </div>
            </div>
            {state.kind === "proof" && (
              <div className="fieldSplit">
                <div className="field">
                  <span>Category</span>
                  <input value={state.category} onChange={(event) => update("category", event.target.value)} />
                </div>
                <div className="field">
                  <span>Year</span>
                  <input value={state.year} onChange={(event) => update("year", event.target.value)} />
                </div>
              </div>
            )}
            {state.kind === "proof" && (
              <div className="field">
                <span>Services</span>
                <input value={state.services} onChange={(event) => update("services", event.target.value)} placeholder="Brand strategy, Visual identity" />
              </div>
            )}
            {state.kind === "blog" && (
              <div className="field">
                <span>Read time</span>
                <input value={state.read} onChange={(event) => update("read", event.target.value)} placeholder="5 min read" />
              </div>
            )}
            <div className="field">
              <span>Summary</span>
              <textarea rows={4} value={state.summary} onChange={(event) => update("summary", event.target.value)} />
            </div>
          </div>
        </section>

        <section className="editorSection formGrid">
          <label>{state.kind === "blog" ? "Featured image" : "Media"}</label>
          <div>
            <input ref={coverInput} className="hiddenFile" type="file" accept="image/*" onChange={(event) => onFile(event, "cover")} />
            <input ref={extraInput} className="hiddenFile" type="file" accept="image/*" multiple onChange={(event) => onFile(event, "images")} />
            <input ref={videoInput} className="hiddenFile" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => onFile(event, "video")} />
            <button className="uploadDemo" type="button" onClick={() => coverInput.current?.click()}>
              <span>＋</span>
              <b>{state.cover ? "Replace cover image" : "Add cover image"}</b>
              <small>{extraHint}</small>
            </button>
            {state.cover ? (
              <div className="mediaPreview">
                <img src={state.cover} alt="Cover" />
                <button type="button" onClick={() => update("cover", "")}>Remove cover</button>
              </div>
            ) : null}
            {showVideo ? (
              <div className="mediaActions">
                <button type="button" onClick={() => videoInput.current?.click()}>{state.video ? "Replace video" : "Upload video"}</button>
                {state.video ? <a href={state.video} target="_blank" rel="noreferrer">Open video ↗</a> : null}
              </div>
            ) : null}
            {showGallery ? (
              <>
                <div className="mediaActions">
                  <button type="button" onClick={() => extraInput.current?.click()}>Add gallery images</button>
                </div>
                <div className="mediaGrid">
                  {state.images.map((src) => (
                    <figure key={src}>
                      <img src={src} alt="" />
                      <button
                        type="button"
                        onClick={() => update("images", state.images.filter((item) => item !== src))}
                      >
                        Remove
                      </button>
                    </figure>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </section>

        {(state.kind === "blog" || state.type === "case-study") && (
          <section className="editorSection formGrid">
            <label>{state.kind === "blog" ? "Article" : "Case study"}</label>
            <div>
              {state.kind === "proof" && state.type === "case-study" && (
                <>
                  <div className="field"><span>Challenge</span><textarea rows={4} value={state.challenge} onChange={(event) => update("challenge", event.target.value)} /></div>
                  <div className="field"><span>Solution</span><textarea rows={4} value={state.solution} onChange={(event) => update("solution", event.target.value)} /></div>
                  <div className="field"><span>Outcome</span><textarea rows={4} value={state.outcome} onChange={(event) => update("outcome", event.target.value)} /></div>
                </>
              )}
              {state.kind === "blog" && (
                <div className="field">
                  <span>Body</span>
                  <BodyEditor value={state.body} onChange={(html) => update("body", html)} />
                </div>
              )}
            </div>
          </section>
        )}

        <section className="editorSection formGrid">
          <label>Search & sharing</label>
          <div>
            <div className="field"><span>SEO title</span><input value={state.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} /></div>
            <div className="field"><span>SEO description</span><textarea rows={3} value={state.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} /></div>
          </div>
        </section>
      </main>
      {confirmingDelete && canDelete && (
        <ConfirmDelete
          title={state.title}
          deleting={deleting}
          onCancel={() => {
            if (!deleting) setConfirmingDelete(false);
          }}
          onConfirm={() => void remove()}
        />
      )}
    </div>
  );
}
