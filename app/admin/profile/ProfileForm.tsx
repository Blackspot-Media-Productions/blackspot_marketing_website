"use client";

import { useState, type FormEvent } from "react";
import type { AdminSession } from "../../lib/types";
import { AdminShell, useAdminUser } from "../components/AdminShell";
import { useToast } from "../components/ToastProvider";

export function ProfileForm({ initial }: { initial: AdminSession }) {
  return (
    <AdminShell active="profile" initialUser={initial}>
      <ProfileFields initial={initial} />
    </AdminShell>
  );
}

function ProfileFields({ initial }: { initial: AdminSession }) {
  const toast = useToast();
  const { setUser } = useAdminUser();
  const [name, setName] = useState(initial.name || "");
  const [position, setPosition] = useState(initial.position || "");
  const [email, setEmail] = useState(initial.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSaving(true);
    const response = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        position,
        email,
        currentPassword: newPassword ? currentPassword : "",
        newPassword,
      }),
    });
    const data = await response.json().catch(() => null);
    setSaving(false);
    if (!response.ok) {
      toast.error(data?.error || "Could not save profile");
      return;
    }
    setUser(data.user);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Profile saved");
  }

  return (
    <main className="adminMain">
      <header>
        <div>
          <p>Blackspot CMS</p>
          <h1>Profile</h1>
        </div>
      </header>
      <form className="contentPanel profilePanel" onSubmit={onSubmit}>
        <div className="field">
          <span>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div className="field">
          <span>Position</span>
          <input
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            placeholder="Founder, Creative director…"
          />
        </div>
        <div className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <p className="profileHint">Leave the password fields blank to keep your current password.</p>
        <div className="field">
          <span>Current password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </div>
        <div className="fieldSplit">
          <div className="field">
            <span>New password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <div className="field">
            <span>Confirm new password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        </div>
        <button className="publishBtn" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </main>
  );
}
