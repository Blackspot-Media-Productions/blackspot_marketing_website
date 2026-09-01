"use client";

import { useState, type FormEvent } from "react";
import { useToast } from "../components/ToastProvider";

function loginFailureMessage(status: number, data: { error?: string } | null) {
  if (typeof data?.error === "string" && data.error.trim()) return data.error;
  if (status === 401) return "Invalid email or password";
  if (status === 403) return "This account cannot sign in yet";
  if (status === 400) return "Email and password are required";
  if (status >= 500) return "Sign in is temporarily unavailable. Please try again.";
  return "Could not sign in. Please try again.";
}

export function LoginForm() {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error(loginFailureMessage(response.status, data));
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
    <form className="loginForm" onSubmit={onSubmit}>
      <div className="field">
        <span>Email</span>
        <input name="email" type="email" autoComplete="username" required />
      </div>
      <div className="field">
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </div>
      <button className="publishBtn" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
