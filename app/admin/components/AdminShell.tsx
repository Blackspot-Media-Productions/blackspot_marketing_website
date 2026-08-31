"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AdminSession } from "../../lib/types";

type AdminUserContextValue = {
  user: AdminSession | null;
  setUser: (user: AdminSession | null) => void;
};

const AdminUserContext = createContext<AdminUserContextValue>({
  user: null,
  setUser: () => undefined,
});

export function useAdminUser() {
  return useContext(AdminUserContext);
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "BS";
}

export function AdminShell({
  active,
  children,
}: {
  active: "content" | "profile";
  children: ReactNode;
}) {
  const [user, setUser] = useState<AdminSession | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const response = await fetch("/api/auth/login");
      if (ignore || !response.ok) return;
      const data = await response.json();
      setUser(data.user || null);
    }
    void load();
    return () => {
      ignore = true;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <AdminUserContext.Provider value={{ user, setUser }}>
      <div className="adminShell">
        <aside className="adminSide">
          <a href="/admin" className="adminLogo"><img src="/blackspot-logo.png" alt="Blackspot" /></a>
          <nav>
            <a className={active === "content" ? "active" : undefined} href="/admin">Content</a>
            <a className={active === "profile" ? "active" : undefined} href="/admin/profile">Profile</a>
            <a href="/work">View website</a>
          </nav>
          <div className="adminUser">
            <a href="/admin/profile" className="adminUserLink">
              <span>{initials(user?.name || "Blackspot Owner")}</span>
              <div>
                <b>{user?.name || "Blackspot Owner"}</b>
                {user?.position ? <small>{user.position}</small> : null}
                <small>{user?.email || "Administrator"}</small>
              </div>
            </a>
            <button className="logoutBtn" onClick={logout} type="button">Log out</button>
          </div>
        </aside>
        {children}
      </div>
    </AdminUserContext.Provider>
  );
}
