"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSession, MemberContent } from "../../lib/types";
import { AdminShell, useAdminUser } from "../components/AdminShell";
import { useToast } from "../components/ToastProvider";
import { hasPermission } from "../../lib/access";
import { DeleteIcon } from "../components/DeleteIcon";
import { formatDisplayDate } from "../../lib/format";
import { ConfirmDelete } from "../components/ConfirmDelete";

type Filter = "all" | "active";

export function TeamPage({ initialUser }: { initialUser: AdminSession }) {
  return (
    <AdminShell active="team" initialUser={initialUser}>
      <TeamMembers />
    </AdminShell>
  );
}

function TeamMembers() {
  const toast = useToast();
  const { user } = useAdminUser();
  const canWrite = hasPermission(user, "member.write");
  const canDelete = hasPermission(user, "member.delete");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<MemberContent[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<MemberContent | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const membersRes = await fetch("/api/team-members");
      if (ignore) return;
      if (!membersRes.ok) {
        setError("Could not load team members");
        toast.error("Could not load team members");
        setLoading(false);
        return;
      }
      const data = await membersRes.json();
      setMembers(data.members || []);
      setLoading(false);
    }
    load();
    return () => {
      ignore = true;
    };
  }, [toast]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((member) => {
      if (filter !== "all" && member.status !== "published" && !member.isActive)
        return false;

      if (!q) return true;
      return [member.name, member.email, member.role].some((value) =>
        value?.toLowerCase().includes(q),
      );
    });
  }, [members, filter, query]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const response = await fetch(`/api/team-members/${pendingDelete._id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (!response.ok) {
      toast.error("Could not delete");
      return;
    }
    setMembers((current) =>
      current.filter((item) => item._id !== pendingDelete._id),
    );
    toast.success("Deleted");
    setPendingDelete(null);
  }

  return (
    <>
      <main className="adminMain">
        <header>
          <div>
            <p>Blackspot CMS</p>
            <h1>Team Members</h1>
          </div>

          <a href="/admin/team-members/add" className="button">
            ＋ Add
          </a>
        </header>
        <section className="contentPanel">
          <div className="contentTools">
            <div>
              {(["all", "active"] as Filter[]).map((item) => (
                <button
                  key={item}
                  className={filter === item ? "selected" : undefined}
                  onClick={() => setFilter(item)}
                  type="button"
                >
                  {item === "all" ? "All" : item === "active" ? "Featured" : ""}
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
            <div className="tableHead members">
              <span>Member</span>
              <span>Role</span>
              <span>Featured</span>
              <span>Status</span>
              <span>Updated</span>
              <span />
            </div>
            {error ? <p className="emptyTable">{error}</p> : null}
            {!loading && !error && visible.length === 0 ? (
              <p className="emptyTable" style={{ textAlign: "center" }}>
                No matching content yet.
              </p>
            ) : null}
            {visible.map((member) => (
              <div className="tableRow members" key={member._id}>
                <div>
                  <b>{member.name}</b>
                  <small>{member.email}</small>
                </div>
                <span>{member.role}</span>
                <span>{member.isActive ? "Yes" : "No"}</span>
                <span className={`status ${member.status}`}>
                  {member.status}
                </span>
                <span>{formatDisplayDate(member.updatedAt)}</span>
                <div className="tableActions">
                  {canWrite ? (
                    <a href={`/admin/team-members/add?id=${member._id}`}>
                      Edit ↗
                    </a>
                  ) : null}
                  {canDelete ? (
                    <button
                      type="button"
                      className="deleteIconBtn"
                      aria-label={`Delete ${member.name || "untitled team member"}`}
                      onClick={() => setPendingDelete(member)}
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
          title={pendingDelete.name}
          sectionLabel="Remove content"
          heading="Remove this team member?"
          deleting={deleting}
          onCancel={() => {
            if (!deleting) setPendingDelete(null);
          }}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </>
  );
}
