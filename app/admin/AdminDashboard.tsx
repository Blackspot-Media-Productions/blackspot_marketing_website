"use client";

import { useEffect, useMemo, useState } from "react";
import { hasPermission } from "../lib/access";
import type { AdminSession, Post } from "../lib/types";
import { formatDisplayDate } from "../lib/format";
import { AdminShell, useAdminUser } from "./components/AdminShell";
import { ConfirmDelete } from "./components/ConfirmDelete";
import { DeleteIcon } from "./components/DeleteIcon";
import { useToast } from "./components/ToastProvider";

type Filter = "all" | "blog" | "proof";

function kindLabel(post: Post) {
  if (post.kind === "blog") return "Blog post";
  const format = post.type ? post.type.replace("-", " ") : "proof";
  return `Proof of work · ${format}`;
}

export function AdminDashboard({ initialUser }: { initialUser: AdminSession }) {
  return (
    <AdminShell active="content" initialUser={initialUser}>
      <DashboardMain />
    </AdminShell>
  );
}

function DashboardMain() {
  const toast = useToast();
  const { user } = useAdminUser();
  const canWrite = hasPermission(user, "content.write");
  const canDelete = hasPermission(user, "content.delete");
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const postsRes = await fetch("/api/posts");
      if (ignore) return;
      if (!postsRes.ok) {
        setError("Could not load content");
        toast.error("Could not load content");
        setLoading(false);
        return;
      }
      const data = await postsRes.json();
      setPosts(data.posts || []);
      setLoading(false);
    }
    load();
    return () => {
      ignore = true;
    };
  }, [toast]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (filter !== "all" && post.kind !== filter) return false;
      if (!q) return true;
      return [post.title, post.slug, post.client, post.category].some((value) =>
        value?.toLowerCase().includes(q),
      );
    });
  }, [posts, filter, query]);

  const stats = {
    published: posts.filter((p) => p.status === "published").length,
    drafts: posts.filter((p) => p.status === "draft").length,
    proof: posts.filter((p) => p.kind === "proof").length,
    blog: posts.filter((p) => p.kind === "blog").length,
  };

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const response = await fetch(`/api/posts/${pendingDelete._id}`, { method: "DELETE" });
    setDeleting(false);
    if (!response.ok) {
      toast.error("Could not delete");
      return;
    }
    setPosts((current) => current.filter((item) => item._id !== pendingDelete._id));
    toast.success("Deleted");
    setPendingDelete(null);
  }

  return (
    <>
      <main className="adminMain">
        <header>
          <div>
            <p>Blackspot CMS</p>
            <h1>Content</h1>
          </div>
          {canWrite ? <button onClick={() => setOpen(true)} type="button">＋ Create post</button> : null}
        </header>
        <section className="adminStats">
          <article><span>Published</span><b>{loading ? "—" : stats.published}</b></article>
          <article><span>Drafts</span><b>{loading ? "—" : stats.drafts}</b></article>
          <article><span>Proof of work</span><b>{loading ? "—" : stats.proof}</b></article>
          <article><span>Blog posts</span><b>{loading ? "—" : stats.blog}</b></article>
        </section>
        <section className="contentPanel">
          <div className="contentTools">
            <div>
              {(["all", "blog", "proof"] as Filter[]).map((item) => (
                <button
                  key={item}
                  className={filter === item ? "selected" : undefined}
                  onClick={() => setFilter(item)}
                  type="button"
                >
                  {item === "all" ? "All" : item === "blog" ? "Blog" : "Proof of work"}
                </button>
              ))}
            </div>
            <input
              aria-label="Search content"
              placeholder="Search content…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="contentTable">
            <div className="tableHead"><span>Title</span><span>Status</span><span>Updated</span><span /></div>
            {error ? <p className="emptyTable">{error}</p> : null}
            {!loading && !error && visible.length === 0 ? <p className="emptyTable">No matching content yet.</p> : null}
            {visible.map((post) => (
              <div className="tableRow" key={post._id}>
                <div>
                  <b>{post.title}</b>
                  <small>{kindLabel(post)}</small>
                </div>
                <span className={`status ${post.status}`}>{post.status}</span>
                <span>{formatDisplayDate(post.updatedAt)}</span>
                <div className="tableActions">
                  {canWrite ? <a href={`/admin/new?id=${post._id}`}>Edit ↗</a> : null}
                  {canDelete ? (
                    <button
                      type="button"
                      className="deleteIconBtn"
                      aria-label={`Delete ${post.title || "untitled post"}`}
                      onClick={() => setPendingDelete(post)}
                    >
                      <DeleteIcon />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      {pendingDelete && (
        <ConfirmDelete
          title={pendingDelete.title}
          deleting={deleting}
          onCancel={() => {
            if (!deleting) setPendingDelete(null);
          }}
          onConfirm={() => void confirmDelete()}
        />
      )}
      {open && (
        <div className="typeModal" role="dialog" aria-modal="true" aria-labelledby="new-post-title">
          <div className="modalCard">
            <button className="modalClose" onClick={() => setOpen(false)} aria-label="Close" type="button">×</button>
            <p className="sectionLabel">New content</p>
            <h2 id="new-post-title">What are you posting?</h2>
            <div className="postChoices">
              <a href="/admin/new?type=blog">
                <span>✎</span>
                <div><b>Blog post</b><small>Article, insight, news or opinion</small></div>
                <i>→</i>
              </a>
              <a href="/admin/new?type=proof">
                <span>↗</span>
                <div><b>Proof of work</b><small>Image, video, gallery or case study</small></div>
                <i>→</i>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
