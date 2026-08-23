"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [checking, setChecking] = useState(!isLoginPage);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (isLoginPage) return;

    fetch("/api/admin/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then(() => {
        setAuthenticated(true);
        setChecking(false);
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [isLoginPage, router]);

  if (isLoginPage) return children;

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Checking admin session...
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: "28px 32px", minWidth: 0 }}>{children}</div>
    </div>
  );
}
