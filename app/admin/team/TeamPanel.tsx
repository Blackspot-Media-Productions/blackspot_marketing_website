"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ALL_PERMISSIONS, permissionLabel } from "../../lib/access";
import type { AccessRole, AdminSession, MemberPermission, TeamMember } from "../../lib/types";
import { AdminShell, useAdminUser } from "../components/AdminShell";
import { ConfirmDelete } from "../components/ConfirmDelete";
import { useToast } from "../components/ToastProvider";

type AccessState = {
  role: AccessRole;
  permissions: MemberPermission[];
};

const defaultAccess = (): AccessState => ({
  role: "member",
  permissions: ["content.write", "content.publish"],
});

function accessFromMember(member: TeamMember): AccessState {
  if (member.role === "super_admin") return { role: "super_admin", permissions: [] };
  return { role: "member", permissions: [...member.permissions] };
}

function accessSummary(member: TeamMember) {
  if (member.role === "super_admin") return "Super admin";
  if (member.permissions.length === 0) return "View only";
  return member.permissions.map(permissionLabel).join(" · ");
}

function statusLabel(status: TeamMember["status"]) {
  if (status === "pending") return "Invite pending";
  if (status === "revoked") return "Revoked";
  return "Active";
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function AccessFields({
  access,
  onChange,
}: {
  access: AccessState;
  onChange: (access: AccessState) => void;
}) {
  const superAdmin = access.role === "super_admin";
  return (
    <div className="permissionList">
      <label className="permissionRow">
        <input
          type="checkbox"
          checked={superAdmin}
          onChange={(event) =>
            onChange(event.target.checked ? { role: "super_admin", permissions: [] } : defaultAccess())
          }
        />
        <span>
          <b>Super admin</b>
          <small>Full access, including inviting and managing the team</small>
        </span>
      </label>
      {ALL_PERMISSIONS.map((permission) => (
        <label className={`permissionRow${superAdmin ? " disabled" : ""}`} key={permission}>
          <input
            type="checkbox"
            disabled={superAdmin}
            checked={superAdmin || access.permissions.includes(permission)}
            onChange={(event) => {
              const next = event.target.checked
                ? [...access.permissions, permission]
                : access.permissions.filter((item) => item !== permission);
              onChange({ role: "member", permissions: next });
            }}
          />
          <span>
            <b>{permissionLabel(permission)}</b>
            <small>
              {permission === "content.write"
                ? "Create, edit and upload posts"
                : permission === "content.publish"
                  ? "Make drafts live on the website"
                  : "Permanently remove posts"}
            </small>
          </span>
        </label>
      ))}
    </div>
  );
}

export function TeamPanel({ initialUser }: { initialUser: AdminSession }) {
  return (
    <AdminShell active="team" initialUser={initialUser}>
      <TeamFields />
    </AdminShell>
  );
}

function TeamFields() {
  const toast = useToast();
  const { user } = useAdminUser();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteAccess, setInviteAccess] = useState<AccessState>(defaultAccess);
  const [savingInvite, setSavingInvite] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [editAccess, setEditAccess] = useState<AccessState>(defaultAccess);
  const [savingEdit, setSavingEdit] = useState(false);
  const [pendingRevoke, setPendingRevoke] = useState<TeamMember | null>(null);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadTeam() {
      const response = await fetch("/api/team");
      if (ignore) return;
      if (!response.ok) {
        setError("Could not load the team");
        toast.error("Could not load the team");
        setLoading(false);
        return;
      }
      const data = await response.json();
      setMembers(data.members || []);
      setError("");
      setLoading(false);
    }
    void loadTeam();
    return () => {
      ignore = true;
    };
  }, [toast]);

  function upsertMember(member: TeamMember) {
    setMembers((current) => {
      const next = current.some((item) => item._id === member._id)
        ? current.map((item) => (item._id === member._id ? member : item))
        : [...current, member];
      return next;
    });
  }

  async function onInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingInvite(true);
    const response = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inviteEmail,
        name: inviteName,
        role: inviteAccess.role,
        permissions: inviteAccess.permissions,
      }),
    });
    const data = await response.json().catch(() => null);
    setSavingInvite(false);
    if (!response.ok) {
      toast.error(data?.error || "Could not send invite");
      return;
    }
    upsertMember(data.member);
    setInviting(false);
    setInviteEmail("");
    setInviteName("");
    setInviteAccess(defaultAccess());
    setInviteUrl(data.inviteUrl || "");
    toast.success("Invite created");
  }

  async function onSaveRights(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSavingEdit(true);
    const response = await fetch(`/api/team/${editing._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: editAccess.role,
        permissions: editAccess.permissions,
      }),
    });
    const data = await response.json().catch(() => null);
    setSavingEdit(false);
    if (!response.ok) {
      toast.error(data?.error || "Could not update access");
      return;
    }
    upsertMember(data.member);
    setEditing(null);
    toast.success("Access updated");
  }

  async function copyInvite(member?: TeamMember) {
    if (member) {
      const response = await fetch(`/api/team/${member._id}/invite`, { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(data?.error || "Could not create invite link");
        return;
      }
      upsertMember(data.member);
      setInviteUrl(data.inviteUrl || "");
      toast.success("New invite link ready");
      return;
    }
    if (!inviteUrl) return;
    const copied = await copyText(inviteUrl);
    toast[copied ? "success" : "error"](copied ? "Invite link copied" : "Could not copy the link");
  }

  async function confirmRevoke() {
    if (!pendingRevoke) return;
    setRevoking(true);
    const response = await fetch(`/api/team/${pendingRevoke._id}`, { method: "DELETE" });
    const data = await response.json().catch(() => null);
    setRevoking(false);
    if (!response.ok) {
      toast.error(data?.error || "Could not revoke access");
      return;
    }
    upsertMember(data.member);
    setPendingRevoke(null);
    toast.success("Access revoked");
  }

  return (
    <main className="adminMain">
      <header>
        <div>
          <p>Blackspot CMS</p>
          <h1>Team</h1>
        </div>
        <button onClick={() => setInviting(true)} type="button">＋ Invite</button>
      </header>
      <section className="contentPanel">
        <div className="contentTable teamTable">
          <div className="tableHead"><span>Person</span><span>Access</span><span>Status</span><span /></div>
          {error ? <p className="emptyTable">{error}</p> : null}
          {!loading && !error && members.length === 0 ? <p className="emptyTable">No team members yet.</p> : null}
          {members.map((member) => (
            <div className="tableRow" key={member._id}>
              <div>
                <b>{member.name || member.email}</b>
                <small>{member.email}</small>
              </div>
              <span className="accessSummary">{accessSummary(member)}</span>
              <span className={`status ${member.status}`}>{statusLabel(member.status)}</span>
              <div className="tableActions">
                {member.status !== "revoked" ? (
                  <button
                    type="button"
                    className="textBtn"
                    onClick={() => {
                      setEditing(member);
                      setEditAccess(accessFromMember(member));
                    }}
                  >
                    Rights
                  </button>
                ) : null}
                {member.status === "pending" || member.status === "revoked" ? (
                  <button type="button" className="textBtn" onClick={() => void copyInvite(member)}>
                    {member.status === "revoked" ? "Re-invite" : "Copy link"}
                  </button>
                ) : null}
                {member._id !== user?.sub && member.status !== "revoked" ? (
                  <button type="button" className="textBtn dangerText" onClick={() => setPendingRevoke(member)}>
                    Revoke
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      {inviting ? (
        <div className="typeModal" role="dialog" aria-modal="true" aria-labelledby="invite-title">
          <div className="modalCard inviteCard">
            <button className="modalClose" onClick={() => !savingInvite && setInviting(false)} aria-label="Close" type="button">×</button>
            <p className="sectionLabel">Team</p>
            <h2 id="invite-title">Invite someone</h2>
            <form className="inviteForm" onSubmit={(event) => void onInvite(event)}>
              <div className="field">
                <span>Email</span>
                <input type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} required />
              </div>
              <div className="field">
                <span>Name</span>
                <input value={inviteName} onChange={(event) => setInviteName(event.target.value)} placeholder="Optional" />
              </div>
              <p className="profileHint">Choose their access. You can change this later.</p>
              <AccessFields access={inviteAccess} onChange={setInviteAccess} />
              <button className="publishBtn" type="submit" disabled={savingInvite}>
                {savingInvite ? "Creating invite…" : "Create invite link"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {editing ? (
        <div className="typeModal" role="dialog" aria-modal="true" aria-labelledby="rights-title">
          <div className="modalCard inviteCard">
            <button className="modalClose" onClick={() => !savingEdit && setEditing(null)} aria-label="Close" type="button">×</button>
            <p className="sectionLabel">Access</p>
            <h2 id="rights-title">Edit rights</h2>
            <p className="confirmCopy">{editing.name} · {editing.email}</p>
            <form className="inviteForm" onSubmit={(event) => void onSaveRights(event)}>
              <AccessFields access={editAccess} onChange={setEditAccess} />
              <button className="publishBtn" type="submit" disabled={savingEdit}>
                {savingEdit ? "Saving…" : "Save rights"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {inviteUrl ? (
        <div className="typeModal" role="dialog" aria-modal="true" aria-labelledby="copy-title">
          <div className="modalCard inviteCard">
            <button className="modalClose" onClick={() => setInviteUrl("")} aria-label="Close" type="button">×</button>
            <p className="sectionLabel">Invite link</p>
            <h2 id="copy-title">Share this link</h2>
            <p className="confirmCopy">It expires in 7 days. Generating a new link invalidates the previous one.</p>
            <div className="copyLinkBox">{inviteUrl}</div>
            <div className="confirmActions">
              <button type="button" onClick={() => setInviteUrl("")}>Done</button>
              <button type="button" className="publishBtn" onClick={() => void copyInvite()}>Copy link</button>
            </div>
          </div>
        </div>
      ) : null}

      {pendingRevoke ? (
        <ConfirmDelete
          title={pendingRevoke.name || pendingRevoke.email}
          deleting={revoking}
          sectionLabel="Team"
          heading="Revoke access?"
          copy={`“${pendingRevoke.name || pendingRevoke.email}” will no longer be able to sign in. You can invite them again later.`}
          confirmLabel="Revoke"
          busyLabel="Revoking…"
          onCancel={() => {
            if (!revoking) setPendingRevoke(null);
          }}
          onConfirm={() => void confirmRevoke()}
        />
      ) : null}
    </main>
  );
}
