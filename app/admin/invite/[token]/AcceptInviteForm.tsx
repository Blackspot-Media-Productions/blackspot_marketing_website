"use client";

import { useState, type FormEvent } from "react";
import { useToast } from "../../components/ToastProvider";

export function AcceptInviteForm({
  token,
  email,
  name,
}: {
  token: string;
  email: string;
  name: string;
}) {
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [fullName, setFullName] = useState(name || "");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setPending(true);
    try {
      const response = await fetch(`/api/auth/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, password }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(data?.error || "Could not accept invite");
        return;
      }
      window.location.href = "/admin";
    } catch {
      toast.error("Could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="loginForm" onSubmit={(event) => void onSubmit(event)}>
      <div className="field">
        <span>Email</span>
        <input type="email" value={email} readOnly />
      </div>
      <div className="field">
        <span>Name</span>
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} required autoComplete="name" />
      </div>
      <div className="field">
        <span>Password</span>
        <input name="password" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      <div className="field">
        <span>Confirm password</span>
        <input name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      <button className="publishBtn" type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Accept invite"}
      </button>
    </form>
  );
}
