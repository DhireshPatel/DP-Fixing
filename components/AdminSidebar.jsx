"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Users,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import styles from "./AdminSidebar.module.css";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: ClipboardList },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/service-men", label: "Service Men", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>
          <Zap size={18} strokeWidth={2.5} />
        </span>
        DP Fixing
      </div>

      <nav className={styles.nav}>
        {LINKS.map((link) => {
          const Icon = link.icon;
          const active = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button className={styles.logoutBtn} onClick={handleLogout}>
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
